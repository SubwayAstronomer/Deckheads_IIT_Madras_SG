// RUNWAY PAYMENTS (deck slide 7, left half)
// Day-by-day simulation of one factory under the Demand Contract:
//   goods: PO -> batch made -> GRN at the Valmo hub -> listed live -> sold unit by unit
//   money: lender advance at GRN + 2 days -> buyer payments collect in Meesho's nodal account
//          -> lender takes principal + interest first -> the rest is the factory's
//   loop:  75% sold -> next PO fires for a same-or-larger batch; each batch gets a fresh advance
//   exits: < 40% sold by Day 21 -> flash sale clears stock and debt; 3 fast batches -> graduate
// The same sales are also run under TODAY's framework (factory funds the batch, 7-day payouts)
// so the two cash curves can be compared.

import {
  ADVANCE_LAG_DAYS, ADVANCE_PCT, APR, CLEARANCE_BELOW, CLEARANCE_DAY, GRADUATE_AFTER, GRADUATE_WINDOW_DAYS,
  PILOT_CHECK_DAY, PILOT_RELEASE_SOLD, PILOT_ADVANCE_PCT, PILOT_LOT_UNITS, REORDER_AT, SAFETY_NET_RATE, type Lane,
} from './contract';

export type Scenario = 'planned' | 'strong' | 'slow';
export const SCENARIO_FACTOR: Record<Scenario, number> = { planned: 1, strong: 1.4, slow: 0.28 };

export interface RunwayParams {
  mode: 'runway' | 'today';
  lane: Lane;
  price: number;           // B2B rate per unit
  netPerUnit: number;      // what one sale puts in the nodal account after fees
  flashNet: number;        // what one flash-sale unit nets
  batch1Units: number;
  weeklyCapacity: number;
  likelyPerWeek: number;   // likely first-month demand from the Opportunity Card
  scenario: Scenario;
  safetyNetOptIn: boolean;
  adCredit: number;        // Rs of the first advance taken as Meesho Ads credit (0 = off)
  leadDays?: number;       // PO -> GRN
  payoutHoldDays?: number; // Meesho's standard release after delivery
  horizon?: number;
  advancePct?: number;
}

export interface DayRow {
  day: number;
  demand: number;
  sold: number;
  cumSold: number;
  inventory: number;
  escrow: number;
  owed: number;
  factoryCash: number; // cumulative cash position of the factory for this programme
  lostSales: number;
}

export interface BatchRow {
  n: number;
  units: number;
  poDay: number;
  grnDay: number;
  sold: number;
  day75?: number;
  success?: boolean;
  cleared?: boolean;
  clearedUnits?: number;
}

export interface LoanRow {
  batch: number;
  label: string;
  amount: number;
  startDay: number;
  repaidDay?: number;
  interest?: number;
  unitsSoldAtRepay?: number;
  loss?: number;
}

export interface RunwayEvent { day: number; kind: 'grn' | 'advance' | 'repaid' | 'po' | 'clearance' | 'graduated' | 'pilot-release' | 'pilot-stop'; text: string; }

export interface RunwayResult {
  params: RunwayParams;
  days: DayRow[];
  batches: BatchRow[];
  loans: LoanRow[];
  events: RunwayEvent[];
  summary: {
    lenderRepaidDay?: number;
    unitsAtFirstRepay?: number;
    firstInterest?: number;
    po2Day?: number;
    graduatedDay?: number;
    clearanceDay?: number;
    peakCashLocked: number;
    breakevenDay?: number;
    avgCashLocked30: number;
    totalInterest: number;
    lenderLoss: number;
    safetyNetPaid: number;
    adCreditUsed: number;
    soldByDay14: number;
    soldByDay21: number;
  };
}

/** Expected daily orders: a new listing ramps from half to the full likely rate over two weeks,
 *  then keeps growing as ratings build, up to 1.6x. Calibrated so the deck example sells
 *  42 units by Day 9 and 75 by Day 14. */
export function expectedDaily(day: number, likelyPerWeek: number): number {
  if (day < 1) return 0;
  const base = likelyPerWeek / 7;
  const ramp = day <= 14 ? 0.5 + 0.5 * (day - 1) / 13 : Math.min(1.6, 1 + 0.5 * (day - 14) / 13);
  return base * ramp;
}

export function simulateRunway(p: RunwayParams): RunwayResult {
  const lead = p.leadDays ?? 4;
  const hold = p.payoutHoldDays ?? 7;
  const horizon = p.horizon ?? 60;
  const advPct = p.advancePct ?? ADVANCE_PCT;
  const runway = p.mode === 'runway' && p.lane !== 'low';
  const factor = SCENARIO_FACTOR[p.scenario];
  const adBoost = runway && p.adCredit > 0 ? 1.2 : 1; // assumed lift from ad credit in the first 3 weeks

  const days: DayRow[] = [];
  const batches: BatchRow[] = [];
  const loans: LoanRow[] = [];
  const events: RunwayEvent[] = [];
  const grnQueue = new Map<number, BatchRow>();
  const advanceQueue = new Map<number, { batch: number; label: string; amount: number }[]>();
  const payoutQueue = new Map<number, number>();
  const push = <T,>(m: Map<number, T[]>, d: number, v: T) => m.set(d, [...(m.get(d) ?? []), v]);

  let cash = 0, escrow = 0, cumSold = 0, cumDemand = 0, successes = 0;
  let graduatedDay: number | undefined, clearanceDay: number | undefined;
  let snPaid = 0, adUsed = 0, contractOpen = true, pilotPending: { amount: number } | undefined;
  const firstBatch: BatchRow = { n: 1, units: p.batch1Units, poDay: -lead, grnDay: 0, sold: 0 };
  batches.push(firstBatch);
  grnQueue.set(0, firstBatch);
  const salesLog: number[] = [];

  const owedOn = (l: LoanRow, d: number) => l.amount * (1 + APR * (d - l.startDay) / 365);

  for (let d = 0; d <= horizon; d++) {
    // 1. goods arrive at the hub
    const arriving = grnQueue.get(d);
    if (arriving) {
      cash -= arriving.units * p.price; // the factory has paid to make the batch
      events.push({ day: d, kind: 'grn', text: `Batch ${arriving.n} (${arriving.units} units) passes QC at the Valmo hub` });
      if (runway && graduatedDay === undefined) {
        if (p.lane === 'mid' && arriving.n === 1) {
          const pilot = Math.min(PILOT_LOT_UNITS, arriving.units);
          push(advanceQueue, d + ADVANCE_LAG_DAYS, { batch: 1, label: 'Pilot lot', amount: Math.round(PILOT_ADVANCE_PCT * pilot * p.price) });
          if (arriving.units > pilot) pilotPending = { amount: Math.round(PILOT_ADVANCE_PCT * (arriving.units - pilot) * p.price) };
        } else {
          const pct = p.lane === 'mid' ? PILOT_ADVANCE_PCT : advPct;
          push(advanceQueue, d + ADVANCE_LAG_DAYS, { batch: arriving.n, label: `Batch ${arriving.n}`, amount: Math.round(pct * arriving.units * p.price) });
        }
      }
    }

    // 2. lender advances land
    for (const a of advanceQueue.get(d) ?? []) {
      loans.push({ batch: a.batch, label: a.label, amount: a.amount, startDay: d });
      let toFactory = a.amount;
      if (loans.length === 1 && p.safetyNetOptIn) { const c = Math.round(a.amount * SAFETY_NET_RATE); snPaid += c; toFactory -= c; }
      if (loans.length === 1 && p.adCredit > 0) { const ad = Math.min(p.adCredit, toFactory); adUsed += ad; toFactory -= ad; }
      cash += toFactory;
      events.push({ day: d, kind: 'advance', text: `Lender advances ₹${a.amount.toLocaleString('en-IN')} (${a.label})` });
    }

    // 3. standard payouts released
    cash += payoutQueue.get(d) ?? 0;

    // 4. sales, first-in first-out across batches
    let demandToday = 0;
    if (d >= 1 && contractOpen) {
      const before = Math.round(cumDemand);
      cumDemand += expectedDaily(d, p.likelyPerWeek) * factor * (d <= 21 ? adBoost : 1);
      demandToday = Math.round(cumDemand) - before;
    }
    let sold = 0;
    let need = demandToday;
    for (const b of batches) {
      if (need <= 0) break;
      if (b.grnDay > d || b.cleared) continue;
      const left = b.units - b.sold;
      const take = Math.min(left, need);
      b.sold += take; need -= take; sold += take;
    }
    cumSold += sold;
    salesLog.push(sold);
    const collected = sold * p.netPerUnit;

    // 5. route the money: open advance first, otherwise normal payout after the hold
    const openLoans = () => loans.filter((l) => l.repaidDay === undefined);
    const advanceComing = [...advanceQueue.keys()].some((k) => k > d);
    if (runway && (openLoans().length > 0 || advanceComing)) escrow += collected;
    else if (collected > 0) {
      let net = collected;
      if (graduatedDay !== undefined && p.safetyNetOptIn && runway) { const c = net * SAFETY_NET_RATE; snPaid += c; net -= c; }
      payoutQueue.set(d + hold, (payoutQueue.get(d + hold) ?? 0) + net);
    }

    // 6. mid lane: release the rest of the batch once the pilot lot proves itself
    if (pilotPending && firstBatch.sold >= PILOT_RELEASE_SOLD && d <= PILOT_CHECK_DAY) {
      push(advanceQueue, d + 1, { batch: 1, label: 'Rest of batch', amount: pilotPending.amount });
      events.push({ day: d, kind: 'pilot-release', text: `${PILOT_RELEASE_SOLD} of ${PILOT_LOT_UNITS} pilot units sold - lender releases the rest` });
      pilotPending = undefined;
    } else if (pilotPending && d > PILOT_CHECK_DAY) {
      events.push({ day: d, kind: 'pilot-stop', text: 'Pilot lot missed its Day-15 mark - no further funding' });
      pilotPending = undefined;
    }

    // 7. triggers per batch
    for (const b of batches) {
      if (b.cleared || b.grnDay > d) continue;
      if (b.day75 === undefined && b.sold >= REORDER_AT * b.units) {
        b.day75 = d;
        b.success = d - b.grnDay <= GRADUATE_WINDOW_DAYS;
        if (b.success && graduatedDay === undefined) successes++;
        const last7 = salesLog.slice(-7).reduce((s, x) => s + x, 0);
        const units = Math.min(p.weeklyCapacity * 2, Math.max(b.units, Math.round(last7 * 2)));
        const nb: BatchRow = { n: batches.length + 1, units, poDay: d, grnDay: d + lead, sold: 0 };
        if (b.n === batches.length && contractOpen) {
          batches.push(nb);
          grnQueue.set(nb.grnDay, nb);
          events.push({ day: d, kind: 'po', text: `${Math.round(REORDER_AT * 100)}% of batch ${b.n} sold - PO ${nb.n} fires automatically (${units} units)` });
        }
        if (graduatedDay === undefined && successes >= GRADUATE_AFTER && runway) {
          graduatedDay = d;
          events.push({ day: d, kind: 'graduated', text: `${GRADUATE_AFTER} batches sold to ${REORDER_AT * 100}% within ${GRADUATE_WINDOW_DAYS} days - graduates to the 7-day payout, no more advances` });
        }
      }
      if (runway && d === b.grnDay + CLEARANCE_DAY && b.sold < CLEARANCE_BELOW * b.units && b.day75 === undefined) {
        const left = b.units - b.sold;
        b.cleared = true; b.clearedUnits = left; clearanceDay = d; contractOpen = false;
        escrow += left * p.flashNet;
        cumSold += left;
        events.push({ day: d, kind: 'clearance', text: `Only ${Math.round((b.sold / b.units) * 100)}% sold by Day ${CLEARANCE_DAY} - flash sale clears ${left} units` });
      }
    }

    // 8. repay the lender from escrow, oldest advance first
    for (const l of openLoans()) {
      const owed = owedOn(l, d);
      if (escrow + 1e-6 >= owed) {
        escrow -= owed;
        l.repaidDay = d; l.interest = owed - l.amount; l.unitsSoldAtRepay = cumSold;
        events.push({ day: d, kind: 'repaid', text: `Lender repaid in full for ${l.label} (₹${Math.round(owed).toLocaleString('en-IN')} incl. ₹${Math.round(owed - l.amount)} interest)` });
      } else break;
    }
    if (clearanceDay === d) {
      // flash sale could not fully cover an advance: the lender takes what is there and books the shortfall
      for (const l of openLoans()) {
        const owed = owedOn(l, d);
        const paid = Math.min(escrow, owed);
        escrow -= paid;
        l.repaidDay = d; l.interest = Math.max(0, paid - l.amount); l.loss = owed - paid; l.unitsSoldAtRepay = cumSold;
      }
    }
    if (openLoans().length === 0 && !advanceComing && escrow > 0) { cash += escrow; escrow = 0; }

    const inventory = batches.reduce((s, b) => s + (b.grnDay <= d && !b.cleared ? b.units - b.sold : 0), 0);
    days.push({
      day: d, demand: demandToday, sold, cumSold, inventory, escrow,
      owed: openLoans().reduce((s, l) => s + owedOn(l, d), 0),
      factoryCash: cash, lostSales: Math.max(0, demandToday - sold),
    });
  }

  const first = loans[0];
  const minCash = Math.min(0, ...days.map((r) => r.factoryCash));
  const breakeven = days.find((r) => r.day > 0 && r.factoryCash >= 0);
  const cumAt = (d: number) => days.find((r) => r.day === d)?.cumSold ?? 0;
  return {
    params: p, days, batches, loans, events: events.sort((a, b) => a.day - b.day),
    summary: {
      lenderRepaidDay: first?.repaidDay,
      unitsAtFirstRepay: first?.unitsSoldAtRepay,
      firstInterest: first?.interest,
      po2Day: batches[0].day75,
      graduatedDay, clearanceDay,
      peakCashLocked: -minCash,
      breakevenDay: breakeven?.day,
      avgCashLocked30: days.slice(0, 31).reduce((s, r) => s + Math.max(0, -r.factoryCash), 0) / 31,
      totalInterest: loans.reduce((s, l) => s + (l.interest ?? 0), 0),
      lenderLoss: loans.reduce((s, l) => s + (l.loss ?? 0), 0),
      safetyNetPaid: snPaid,
      adCreditUsed: adUsed,
      soldByDay14: cumAt(14),
      soldByDay21: cumAt(21),
    },
  };
}
