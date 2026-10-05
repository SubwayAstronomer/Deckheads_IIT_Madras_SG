// DEMAND CONTRACT (deck slide 6, right half; risk lanes from slide 10)
// One deal signed by the maker, Meesho and the lender (MPPL partner NBFC):
//   * a first batch sized to demand (low end of the band x 3 weeks), capped at the Rs 26k first-batch limit
//   * no price cut: the factory's own B2B rate, 0% commission
//   * 60% of batch value advanced within 48 h of GRN at the Valmo hub, 18% p.a. charged daily
//   * the lender is repaid first from sales; then every payout is the seller's
//   * triggers: 75% sold -> next PO; < 40% sold by Day 21 -> flash sale clears stock and debt;
//     3 batches sold to 75% within 14 days -> graduate to Meesho's standard 7-day payout
// Before lending, four checks sort the factory into a confidence lane (slide 10, Layer 1 + Layer 2).

import type { CardResult } from './opportunityCard';

export const FIRST_BATCH_CAP = 26000;
export const ADVANCE_PCT = 0.6;
export const APR = 0.18;
export const SAFETY_NET_RATE = 0.015;
export const REORDER_AT = 0.75;
export const CLEARANCE_DAY = 21;
export const CLEARANCE_BELOW = 0.4;
export const GRADUATE_AFTER = 3;
export const GRADUATE_WINDOW_DAYS = 14;
export const ADVANCE_LAG_DAYS = 2; // "within 48 hrs of GRN"
/** Per-order deductions on a sale: Valmo fulfilment (~Rs 43), GST on fees (~Rs 11), TCS/TDS and payment costs (~Rs 9).
 *  Calibrated to the deck's flash-sale example: Rs 229 nets Rs 166. */
export const PER_ORDER_DEDUCTION = 63;
/** Flash-sale price as a share of the normal listing price (Rs 439 kurti -> Rs 229). */
export const FLASH_PRICE_SHARE = 0.52;
// Mid-confidence lane: pilot lot first
export const PILOT_LOT_UNITS = 20;
export const PILOT_ADVANCE_PCT = 0.5;
export const PILOT_RELEASE_SOLD = 14; // of 20
export const PILOT_CHECK_DAY = 15;

export type Lane = 'high' | 'mid' | 'low';

export interface LaneChecks {
  categorySells: boolean; // 1. does the category sell on Meesho?
  priceInLine: boolean;   // 2. is the price in line with rivals?
  ratesWell: boolean;     // 3. do sample orders rate well?
  provenMaker: boolean;   // 4. has the maker supplied before (2+ years of B2B record)?
}

export interface FactoryFacts { sampleRating: number; yearsSupplying: number; }

export const HERO_FACTS: FactoryFacts = { sampleRating: 4.3, yearsSupplying: 9 };

export function laneChecks(card: CardResult, facts: FactoryFacts): LaneChecks {
  return {
    categorySells: card.demand.confidence !== 'Low',
    priceInLine: card.listingPrice <= card.product.rivalMedian * 1.1,
    ratesWell: facts.sampleRating >= 4.0,
    provenMaker: facts.yearsSupplying >= 2,
  };
}

export function laneFor(c: LaneChecks): Lane {
  const passed = [c.categorySells, c.priceInLine, c.ratesWell, c.provenMaker].filter(Boolean).length;
  return passed === 4 ? 'high' : passed === 3 ? 'mid' : 'low';
}

export interface ContractTerms {
  lane: Lane;
  units: number;
  price: number;
  batchValue: number;
  listingPrice: number;
  netPerUnit: number;
  flashPrice: number;
  flashNet: number;
  /** Tranches the lender funds. High lane: one. Mid lane: pilot lot, then the rest once 14 of 20 sell by Day 15. Low lane: none. */
  tranches: { label: string; units: number; pct: number; amount: number; condition: string }[];
  advanceTotal: number;
  cashAtRiskDay2: number;
  apr: number;
  safetyNetOptIn: boolean;
  safetyNetContribution: number;
  owedPerUnit: number;
  plannedPerWeek: number;
}

export function batchUnits(card: CardResult): number {
  const byCap = Math.floor(FIRST_BATCH_CAP / Math.max(1, card.inputs.b2bPrice));
  const byDemand = card.demand.batchBand.low * 3;
  const byCapacity = card.inputs.weeklyCapacity * 2;
  return Math.max(10, Math.min(byCap, byDemand, byCapacity));
}

export function buildContract(card: CardResult, lane: Lane, safetyNetOptIn = true): ContractTerms {
  const units = batchUnits(card);
  const price = card.inputs.b2bPrice;
  const listing = card.listingPrice;
  const flashPrice = Math.ceil(listing * FLASH_PRICE_SHARE);
  const tranches: ContractTerms['tranches'] = [];
  if (lane === 'high') {
    tranches.push({ label: 'Full advance', units, pct: ADVANCE_PCT, amount: Math.round(ADVANCE_PCT * units * price), condition: 'Within 48 h of GRN' });
  } else if (lane === 'mid') {
    const pilot = Math.min(PILOT_LOT_UNITS, units);
    tranches.push({ label: 'Pilot lot', units: pilot, pct: PILOT_ADVANCE_PCT, amount: Math.round(PILOT_ADVANCE_PCT * pilot * price), condition: 'Within 48 h of GRN' });
    if (units > pilot) {
      tranches.push({
        label: 'Rest of batch', units: units - pilot, pct: PILOT_ADVANCE_PCT,
        amount: Math.round(PILOT_ADVANCE_PCT * (units - pilot) * price),
        condition: `Only if ${PILOT_RELEASE_SOLD} of ${pilot} sell by Day ${PILOT_CHECK_DAY}`,
      });
    }
  }
  const advanceTotal = tranches.reduce((s, t) => s + t.amount, 0);
  const firstTranche = tranches[0]?.amount ?? 0;
  return {
    lane, units, price, batchValue: units * price, listingPrice: listing,
    netPerUnit: listing - PER_ORDER_DEDUCTION,
    flashPrice, flashNet: flashPrice - PER_ORDER_DEDUCTION,
    tranches, advanceTotal, cashAtRiskDay2: firstTranche,
    apr: APR,
    safetyNetOptIn: safetyNetOptIn && firstTranche > 0,
    safetyNetContribution: safetyNetOptIn ? Math.round(firstTranche * SAFETY_NET_RATE) : 0,
    owedPerUnit: Math.round((tranches[0]?.pct ?? 0) * price),
    plannedPerWeek: card.demand.batchBand.low,
  };
}

/** Simple daily interest on the full advance (the advance is cleared in one go from the nodal escrow). */
export function interestFor(advance: number, days: number, apr = APR): number {
  return advance * apr * Math.max(0, days) / 365;
}
