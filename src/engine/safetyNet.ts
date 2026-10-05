// RETURN SAFETY NET (deck slide 7 right half, slide 10 risk 4)
// A voluntary, shared pool - "collective insurance for sellers":
//   Phase 1 (onboarding):  1.5% of the NBFC advance goes into the pool once, on day 1
//   Phase 2 (after graduation): 1.5% of each payout's net escrow
//   Returns, RTO and fraud up to 6% of a week's net sales stay with the factory (business as usual);
//   the pool pays everything above 6%, once the hub's GRN photo and the return scan prove the loss.
// All percentages here are of the week's net escrow (what the seller actually earned).

import { SAFETY_NET_RATE } from './contract';

export const RETURNS_THRESHOLD = 0.06;

/** The 12-week pattern drawn on deck slide 7: a bad week 3 during onboarding, a zone breakdown in week 9. */
export const DECK_WEEKLY_LOSS = [0.05, 0.07, 0.23, 0.05, 0.04, 0.055, 0.045, 0.05, 0.30, 0.05, 0.055, 0.05];

export interface SafetyNetWeek {
  week: number;
  phase: 1 | 2;
  netEscrow: number;
  lossRate: number;
  loss: number;
  factoryCarries: number;   // returns borne by the factory (up to the threshold)
  poolPays: number;
  contribution: number;     // paid into the pool this week
  factoryPctWith: number;   // (carried + contribution) / net escrow
  factoryPctWithout: number;
}

export interface SafetyNetParams {
  lossRates: number[];
  weeklyNetEscrow: number;
  advance: number;
  graduationWeek: number;
  threshold?: number;
  rate?: number;
  optIn?: boolean;
}

export function simulateSafetyNet(p: SafetyNetParams): SafetyNetWeek[] {
  const thr = p.threshold ?? RETURNS_THRESHOLD;
  const rate = p.rate ?? SAFETY_NET_RATE;
  const optIn = p.optIn ?? true;
  return p.lossRates.map((lr, i) => {
    const week = i + 1;
    const phase: 1 | 2 = week < p.graduationWeek ? 1 : 2;
    const net = p.weeklyNetEscrow;
    const loss = lr * net;
    const carries = optIn ? Math.min(lr, thr) * net : loss;
    const pool = loss - carries;
    // Phase 1: one-time 1.5% of the advance on day 1 (week 1). Phase 2: 1.5% of every payout.
    const contribution = !optIn ? 0 : week === 1 ? p.advance * rate : phase === 2 ? net * rate : 0;
    const phase2Contribution = phase === 2 ? contribution : 0;
    return {
      week, phase, netEscrow: net, lossRate: lr, loss,
      factoryCarries: carries, poolPays: pool, contribution,
      factoryPctWith: (carries + phase2Contribution) / net,
      factoryPctWithout: lr,
    };
  });
}
