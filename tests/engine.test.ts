// These tests pin the prototype to the numbers printed in the deck, so the app and the slides never disagree.
import { describe, expect, it } from 'vitest';
import { computeCard, HERO_INPUTS, nearestListed } from '../src/engine/opportunityCard';
import { buildContract, HERO_FACTS, laneChecks, laneFor } from '../src/engine/contract';
import { simulateRunway } from '../src/engine/runway';
import { DECK_WEEKLY_LOSS, simulateSafetyNet } from '../src/engine/safetyNet';
import { gateResult, READINGS, tripWires } from '../src/engine/cohort';
import { productById } from '../src/data/products';
import { groupIN, inrCompact } from '../src/engine/util';

const card = computeCard(HERO_INPUTS);
const terms = buildContract(card, laneFor(laneChecks(card, HERO_FACTS)));
const heroRun = simulateRunway({
  mode: 'runway', lane: terms.lane, price: terms.price, netPerUnit: terms.netPerUnit, flashNet: terms.flashNet,
  batch1Units: terms.units, weeklyCapacity: 500, likelyPerWeek: card.demand.batchBand.likely,
  scenario: 'planned', safetyNetOptIn: true, adCredit: 0,
});

describe('Opportunity Card (slide 6) - Shree Balaji Kurtis, Surat 395003, Rs 260, 500/wk', () => {
  it('earnings multiplier 1.9x, B2B Rs 2.8 L/mo vs Meesho Rs 5.2 L/mo', () => {
    expect(card.earnings.multiplier.toFixed(1)).toBe('1.9');
    expect(inrCompact(card.earnings.b2bMonthly)).toBe('₹2.8 L');
    expect(inrCompact(card.earnings.meeshoMonthly)).toBe('₹5.2 L');
  });
  it('~400/wk factory-matched demand = 80% of capacity', () => {
    expect(card.demand.matchedPerWeek).toBe(400);
    expect(card.demand.cappedByCapacity).toBe(true);
  });
  it('12 kurti factories already selling in 395003', () => {
    expect(card.local).toMatchObject({ count: 12, level: 'pincode' });
  });
  it('first-batch band 35-50 a week, planned on the low end', () => {
    expect(card.demand.batchBand).toEqual({ low: 35, likely: 50 });
  });
  it('falls back to district then region for unknown pincodes', () => {
    expect(computeCard({ ...HERO_INPUTS, pincode: '395009' }).local.level).toBe('district');
    expect(computeCard({ ...HERO_INPUTS, pincode: '395999' }).local.level).toBe('region');
    expect(computeCard({ ...HERO_INPUTS, pincode: '600001' }).local.level).toBe('none');
  });
  it('new pillow borrows demand from mattress, cushion cover, bedsheet (slide 6 kNN picture)', () => {
    const n = nearestListed(productById('pillow'));
    expect(n.map((x) => x.product.id)).toEqual(['mattress', 'cushion', 'bedsheet']);
    const pillow = computeCard({ ...HERO_INPUTS, productId: 'pillow' });
    expect(pillow.demand.source).toBe('proxy');
    expect(pillow.demand.confidence).not.toBe('High');
  });
});

describe('Demand Contract (slide 6) and lanes (slide 10)', () => {
  it('hero is a high-confidence maker: 100 units at Rs 260, Rs 15,600 advance', () => {
    expect(terms.lane).toBe('high');
    expect(terms.units).toBe(100);
    expect(terms.batchValue).toBe(26000);
    expect(terms.advanceTotal).toBe(15600);
  });
  it('flash sale at ~Rs 229 nets ~Rs 166 vs Rs 156 principal per unit', () => {
    expect(terms.flashPrice).toBe(229);
    expect(terms.flashNet).toBe(166);
    expect(terms.owedPerUnit).toBe(156);
  });
  it('mid lane funds a 20-unit pilot lot at 50% (Rs 2,600) and Rs 10,400 later', () => {
    const mid = buildContract(card, 'mid');
    expect(mid.tranches.map((t) => t.amount)).toEqual([2600, 10400]);
    expect(buildContract(card, 'low').advanceTotal).toBe(0);
  });
  it('a failed check drops the lane', () => {
    expect(laneFor({ categorySells: true, priceInLine: false, ratesWell: true, provenMaker: true })).toBe('mid');
    expect(laneFor({ categorySells: false, priceInLine: false, ratesWell: true, provenMaker: true })).toBe('low');
  });
});

describe('Runway (slides 6-7): the illustrative timeline', () => {
  it('advance paid Day 2, lender repaid Day 9 after 42 units with ~Rs 54 interest', () => {
    expect(heroRun.loans[0].startDay).toBe(2);
    expect(heroRun.summary.lenderRepaidDay).toBe(9);
    expect(heroRun.summary.unitsAtFirstRepay).toBe(42);
    expect(Math.round(heroRun.summary.firstInterest!)).toBe(54);
  });
  it('75 of 100 sold on Day 14 -> PO2 fires', () => {
    expect(heroRun.summary.soldByDay14).toBe(75);
    expect(heroRun.summary.po2Day).toBe(14);
  });
  it('graduates after 3 batches in about six weeks', () => {
    expect(heroRun.summary.graduatedDay).toBeGreaterThanOrEqual(35);
    expect(heroRun.summary.graduatedDay).toBeLessThanOrEqual(45);
  });
  it('Runway locks far less of the factory cash than today', () => {
    const today = simulateRunway({ ...heroRun.params, mode: 'today' });
    expect(heroRun.summary.avgCashLocked30).toBeLessThan(today.summary.avgCashLocked30 * 0.75);
    expect(heroRun.summary.breakevenDay!).toBeLessThan(today.summary.breakevenDay!);
  });
  it('slow sales -> flash sale on Day 21 clears the debt with no lender loss', () => {
    const slow = simulateRunway({ ...heroRun.params, scenario: 'slow' });
    expect(slow.summary.clearanceDay).toBe(21);
    expect(slow.summary.lenderLoss).toBe(0);
    expect(slow.loans[0].repaidDay).toBe(21);
  });
});

describe('Safety Net (slides 7, 10)', () => {
  const weeks = simulateSafetyNet({ lossRates: DECK_WEEKLY_LOSS, weeklyNetEscrow: 18000, advance: 15600, graduationWeek: 5 });
  it('a 30% week costs the factory only 7.5%', () => {
    expect(weeks[8].factoryPctWith).toBeCloseTo(0.075, 5);
  });
  it('Day 1 contribution is 1.5% of the advance (Rs 234)', () => {
    expect(weeks[0].contribution).toBe(234);
  });
});

describe('Control tower (slides 8-9)', () => {
  const [healthy, optimistic, rto] = READINGS;
  const fired = (r: typeof healthy) => tripWires(r).filter((t) => t.fired).map((t) => t.action);
  it('a pilot on plan passes every gate and only SCALE fires', () => {
    expect([30, 60, 90, 180].map((d) => gateResult(healthy, d))).toEqual([true, true, true, true]);
    expect(fired(healthy)).toEqual(['SCALE']);
  });
  it('over-promising forecasts trip FIX and TIGHTEN; a bad RTO month trips RESET and HOLD', () => {
    expect(fired(optimistic)).toEqual(['FIX', 'TIGHTEN']);
    expect(fired(rto)).toEqual(['RESET', 'HOLD']);
  });
});

it('Indian number grouping', () => {
  expect(groupIN(1560000)).toBe('15,60,000');
  expect(groupIN(15600)).toBe('15,600');
});
