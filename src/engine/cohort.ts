// KPI CONTROL TOWER (deck slides 8 and 9)
// The 12 KPIs, their pilot targets, the review gate each is read at, and the trip-wires that fire
// when a metric goes off. Three illustrative pilot readings show how the dashboard reacts.
// The readings are ILLUSTRATIVE, not forecasts.

export type Stage = 'Onboarding' | 'Activation' | 'Retention';

export interface KpiDef {
  n: number; name: string; stage: Stage; definition: string; when: string;
  target: string; unit: 'pct' | 'days' | 'day' | 'x' | 'ratio';
  pass: (v: number) => boolean;
}

export const KPIS: KpiDef[] = [
  { n: 1, name: 'Pitch-to-contract', stage: 'Onboarding', definition: 'Signed contracts ÷ Opportunity Cards shown', when: 'Contract signed', target: '≥25%', unit: 'pct', pass: (v) => v >= 0.25 },
  { n: 2, name: 'Time to first batch', stage: 'Onboarding', definition: "Days from the STAR's visit to batch 1 cleared at the hub", when: 'Day 0 · GRN', target: '≤14 d', unit: 'days', pass: (v) => v <= 14 },
  { n: 3, name: 'Forecast hit rate', stage: 'Onboarding', definition: "Factories whose first 30 days reach the card's capped forecast", when: 'Day 30', target: '≥80%', unit: 'pct', pass: (v) => v >= 0.8 },
  { n: 4, name: 'Proxy honesty', stage: 'Onboarding', definition: 'kNN cold-start error ÷ error on products with sales history', when: 'Day 30', target: '≤1.5x', unit: 'x', pass: (v) => v <= 1.5 },
  { n: 5, name: 'Paid upfront', stage: 'Activation', definition: '60% advances credited within 48 h of GRN', when: 'Day 2', target: '≥95%', unit: 'pct', pass: (v) => v >= 0.95 },
  { n: 6, name: 'Lender repaid', stage: 'Activation', definition: 'Median day the advance + interest is cleared', when: 'Day 9', target: '≤D12', unit: 'day', pass: (v) => v <= 12 },
  { n: 7, name: 'Sell-through', stage: 'Activation', definition: 'Share of batch 1 sold by Day 30; 75% fires the next PO', when: 'Day 30', target: '≥75%', unit: 'pct', pass: (v) => v >= 0.75 },
  { n: 8, name: 'Clearance rate', stage: 'Activation', definition: 'Batches under 40% sold at Day 21 that go to flash sale', when: 'Day 21', target: '≤10%', unit: 'pct', pass: (v) => v <= 0.1 },
  { n: 9, name: 'Reorder rate', stage: 'Retention', definition: 'Factories firing PO2 and PO3 at the same or a larger size', when: 'PO2 / PO3', target: '≥60%', unit: 'pct', pass: (v) => v >= 0.6 },
  { n: 10, name: 'Graduation', stage: 'Retention', definition: "3 batches inside 90 days, then Meesho's 7-day payout", when: 'Day 90', target: '≥40%', unit: 'pct', pass: (v) => v >= 0.4 },
  { n: 11, name: 'Promise kept', stage: 'Retention', definition: 'Realised earnings ÷ own B2B rate, vs the 1.9x on the card', when: 'Monthly', target: '≥1.7x', unit: 'x', pass: (v) => v >= 1.7 },
  { n: 12, name: 'Safety Net loss ratio', stage: 'Retention', definition: 'Pool payouts ÷ 1.5% contributions', when: 'Monthly', target: '<1.0', unit: 'ratio', pass: (v) => v < 1 },
];

export function fmtKpi(def: KpiDef, v: number): string {
  switch (def.unit) {
    case 'pct': return `${Math.round(v * 100)}%`;
    case 'days': return `${v} d`;
    case 'day': return `D${v}`;
    case 'x': return `${v.toFixed(1)}x`;
    case 'ratio': return v.toFixed(2);
  }
}

export type ScenarioId = 'healthy' | 'optimistic' | 'rto';

export interface PilotReading {
  id: ScenarioId;
  label: string;
  blurb: string;
  values: Record<number, number>;
  northStar: number;              // self-sustaining factories per 100 cards shown
  cardsShown: number;
  graduates: number;
  holding: number;
  nbfcNetLoss: number;            // share of advances lost
  worstCluster: { city: string; clearance: number };
  c2mRating: number;              // vs platform average
}

export const PLATFORM_RATING = 3.95;

export const READINGS: PilotReading[] = [
  {
    id: 'healthy', label: 'Pilot on plan', blurb: 'Forecasts are honest, sales arrive on time, returns stay normal.',
    values: { 1: 0.27, 2: 11, 3: 0.84, 4: 1.2, 5: 0.97, 6: 9, 7: 0.81, 8: 0.06, 9: 0.64, 10: 0.44, 11: 1.8, 12: 0.62 },
    northStar: 8.3, cardsShown: 240, graduates: 28, holding: 20, nbfcNetLoss: 0.004,
    worstCluster: { city: 'Tiruppur', clearance: 0.11 }, c2mRating: 4.12,
  },
  {
    id: 'optimistic', label: 'Forecasts over-promise', blurb: 'The kNN proxy over-sells new products, so batches sit unsold.',
    values: { 1: 0.31, 2: 11, 3: 0.58, 4: 1.9, 5: 0.97, 6: 13, 7: 0.58, 8: 0.23, 9: 0.41, 10: 0.24, 11: 1.3, 12: 0.71 },
    northStar: 4.2, cardsShown: 240, graduates: 17, holding: 10, nbfcNetLoss: 0.026,
    worstCluster: { city: 'Surat', clearance: 0.31 }, c2mRating: 4.02,
  },
  {
    id: 'rto', label: 'Bad RTO month', blurb: 'A courier breakdown and a fraud ring push returns far above 6%.',
    values: { 1: 0.27, 2: 12, 3: 0.78, 4: 1.3, 5: 0.96, 6: 10, 7: 0.77, 8: 0.08, 9: 0.58, 10: 0.38, 11: 1.6, 12: 1.35 },
    northStar: 6.3, cardsShown: 240, graduates: 22, holding: 15, nbfcNetLoss: 0.009,
    worstCluster: { city: 'Agra', clearance: 0.12 }, c2mRating: 3.82,
  },
];

export interface TripWire { id: string; kpis: number[]; rule: string; action: 'SCALE' | 'FIX' | 'TIGHTEN' | 'RESET' | 'HOLD'; what: string; fired: boolean; detail: string; }

/** Deck slide 8, "Illustrative actions when the metrics go off". */
export function tripWires(r: PilotReading): TripWire[] {
  const v = r.values;
  const pc = (x: number) => `${Math.round(x * 100)}%`;
  return [
    { id: 'scale', kpis: [3, 8], rule: 'Forecast hit ≥80% and clearance ≤10%', action: 'SCALE', what: 'Open the next cluster', fired: v[3] >= 0.8 && v[8] <= 0.1, detail: `Forecast hit ${pc(v[3])} · clearance ${pc(v[8])}` },
    { id: 'fix', kpis: [8], rule: 'Clearance above 20% in a cluster', action: 'FIX', what: 'Retrain the demand model first', fired: r.worstCluster.clearance > 0.2, detail: `Worst cluster: ${r.worstCluster.city} at ${pc(r.worstCluster.clearance)}` },
    { id: 'tighten', kpis: [6], rule: 'NBFC net loss above 2%', action: 'TIGHTEN', what: 'Cut the advance from 60% to 50%', fired: r.nbfcNetLoss > 0.02, detail: `NBFC net loss ${(r.nbfcNetLoss * 100).toFixed(1)}%` },
    { id: 'reset', kpis: [12], rule: 'Safety Net loss ratio above 1.0', action: 'RESET', what: 'Raise the returns threshold', fired: v[12] > 1, detail: `Loss ratio ${v[12].toFixed(2)}` },
    { id: 'hold', kpis: [], rule: 'C2M buyer rating below platform average', action: 'HOLD', what: 'Pause the category, fix quality', fired: r.c2mRating < PLATFORM_RATING, detail: `C2M ${r.c2mRating.toFixed(2)}★ vs platform ${PLATFORM_RATING}★` },
  ];
}

/** Review gates from the 30-60-90 plan (deck slide 9, "How we call success"). */
export const GATES = [
  { day: 30, question: 'Does the pitch convert?', kpis: [1, 2, 5], ifMissed: 'Rewrite the card + STAR script; hold month-2 signing two weeks' },
  { day: 60, question: 'Does batch 1 sell?', kpis: [3, 7, 8, 6], ifMissed: 'Retrain the model; cut the advance 60% → 50%' },
  { day: 90, question: 'Do factories come back?', kpis: [9, 10, 11, 12], ifMissed: 'Call the D90 decision' },
  { day: 180, question: 'Does it hold without the lender?', kpis: [], ifMissed: 'Stay in Replicate; no Extend budget' },
];

export function gateResult(r: PilotReading, gateDay: number): boolean {
  const g = GATES.find((x) => x.day === gateDay)!;
  if (gateDay === 180) return r.northStar >= 7;
  return g.kpis.every((n) => KPIS.find((k) => k.n === n)!.pass(r.values[n]));
}
