// The guided demo script. Each caption doubles as the voice-over line in docs/DEMO_SCRIPT.md.
import type { CardInputs } from '../engine/opportunityCard';
import type { useJourney } from '../state/journey';

type J = ReturnType<typeof useJourney>;
export interface DemoStep { chapter: string; route: string; spot?: string; ms: number; caption: string; apply?: (j: J, hero: CardInputs) => void; }

export const STEPS: DemoStep[] = [
  { chapter: 'Overview', route: '/', spot: 'story', ms: 10000, apply: (j) => j.reset(),
    caption: 'C2M Launchpad is our working prototype for Meesho\'s C2M challenge. We follow one Surat kurti maker from the first STAR visit to graduating off support.' },
  { chapter: 'Overview', route: '/', spot: 'tools', ms: 9000,
    caption: 'The problem has four branches: find, convince, pay and retain. Each has a tool, and all of them are measured on one control tower.' },
  { chapter: '1 · Opportunity Card', route: '/card', spot: 'inputs', ms: 10000,
    caption: 'A Meesho STAR visits Shree Balaji Kurtis and types four facts: kurtis, a ₹260 B2B price, 500 pieces a week, pincode 395003.' },
  { chapter: '1 · Opportunity Card', route: '/card', spot: 'phone', ms: 12000,
    caption: 'The card returns three proof points named for this factory: 1.9x its B2B earnings, about 400 orders a week matched to capacity, and 12 kurti makers in the same pincode already selling.' },
  { chapter: '1 · Opportunity Card', route: '/card', spot: 'phone', ms: 6500, apply: (j) => j.setLang('hi'),
    caption: 'The same card in Hindi, ready to send to the owner on WhatsApp.' },
  { chapter: '1 · Opportunity Card', route: '/card', spot: 'knn', ms: 12000,
    apply: (j) => { j.setLang('en'); j.setInputs({ ownerName: 'S Goyal', factoryName: 'Panipat Sleep Co', productId: 'pillow', b2bPrice: 140, weeklyCapacity: 400, pincode: '132103' }); },
    caption: 'What if Meesho has never sold the product? A new memory-foam pillow borrows demand from its three nearest listed look-alikes, and the card says so with a confidence tag.' },
  { chapter: '2 · Demand Contract', route: '/contract', spot: 'lanes', ms: 10000, apply: (j, hero) => j.setInputs(hero),
    caption: 'Back to the kurti maker. Four checks put him in the high-confidence lane: a full 60% advance on a 100-unit first batch.' },
  { chapter: '2 · Demand Contract', route: '/contract', spot: 'lanes', ms: 9000, apply: (j) => j.setChecksOverride({ priceInLine: false }),
    caption: 'If one check fails, the lender funds only a 20-unit pilot lot: ₹2,600 at risk instead of ₹15,600.' },
  { chapter: '2 · Demand Contract', route: '/contract', spot: 'paper', ms: 12000, apply: (j) => { j.setChecksOverride({}); j.setSigned(true); },
    caption: 'The contract: 100 units at his own B2B rate, 60% paid within 48 hours of GRN, 18% a year only while the advance is out, lender repaid first, then reorder, clearance and graduation triggers. All three parties sign.' },
  { chapter: '3 · Runway payments', route: '/runway', spot: 'runway-stats', ms: 12000, apply: (j) => j.setScenario('planned'),
    caption: '₹15,600 lands on Day 2. Sales repay the lender by Day 9, after 42 kurtis. When 75 are sold on Day 14, the next purchase order fires on its own.' },
  { chapter: '3 · Runway payments', route: '/runway', spot: 'cash-chart', ms: 10000,
    caption: 'Same batches, same sales. With Runway, the factory\'s cash hole shrinks within two days instead of waiting on 7-day payouts.' },
  { chapter: '3 · Runway payments', route: '/runway', spot: 'runway-stats', ms: 10000, apply: (j) => j.setScenario('slow'),
    caption: 'If sales stall, a Day-21 flash sale clears the stock and the debt. The lender is repaid in full, and the factory gets most of its batch value back instead of sitting on dead stock.' },
  { chapter: '4 · Return Safety Net', route: '/safety-net', spot: 'sn-chart', ms: 12000, apply: (j) => j.setScenario('planned'),
    caption: 'The Return Safety Net: every seller puts 1.5% into a shared pool. In week 9 a courier breakdown sends back 30% of orders, and the factory carries only 7.5%.' },
  { chapter: '5 · Health Card', route: '/health', spot: 'health-phone', ms: 10000, apply: (j) => j.setDay(14),
    caption: 'The Health Card checks the promises live. On Day 14: 75 sold against a forecast of 70, advance paid, lender repaid, and PO 2 ready to confirm.' },
  { chapter: '5 · Health Card', route: '/health', spot: 'health-phone', ms: 9000, apply: (j) => j.setDay(j.run.summary.graduatedDay ?? 40),
    caption: 'About six weeks in, after three fast batches, the factory graduates to Meesho\'s normal 7-day payout. No more advances needed.' },
  { chapter: '6 · KPI Control Tower', route: '/control-tower', spot: 'kpis', ms: 12000, apply: (j) => j.setReading('healthy'),
    caption: 'Meesho tracks every factory on 12 KPIs, read at Day 30, 60, 90 and 180, all feeding one North Star: self-sustaining factories per 100 cards shown.' },
  { chapter: '6 · KPI Control Tower', route: '/control-tower', spot: 'wires', ms: 11000, apply: (j) => j.setReading('optimistic'),
    caption: 'When a metric goes off, a pre-agreed action fires. If forecasts over-promise, FIX retrains the model and TIGHTEN cuts the advance to 50%.' },
  { chapter: 'Close', route: '/', spot: 'story', ms: 8000, apply: (j) => j.reset(),
    caption: 'Find, convince, pay, retain, measure. Team Deckheads, IIT Madras. Thank you.' },
];

export const TOTAL_MS = STEPS.reduce((s, x) => s + x.ms, 0);
