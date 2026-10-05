# Assumptions and data sources

Everything in the prototype is simulated unless marked **deck** (taken from our submitted deck) or **research** (from our primary research: 15 manufacturer calls, 11 categories, 2 marketplaces benchmarked, 2 interviews).

## Opportunity Card

| Input | Value | Source |
|---|---|---|
| Weeks per month | 4.33 | standard |
| B2B capacity utilisation | 50% | research: makers we called run about half their line for wholesale orders |
| Demand cap | 80% of weekly capacity | deck: "capped at capacity so a STAR never over-promises" |
| Top kurti makers' Meesho earnings | ₹4.5 L / month at ~430 pieces/wk | deck (slide 6 card) |
| New-listing share of matched demand, first month | 12.5% (likely); low end 70% / 55% / 40% of that for High / Medium / Low confidence | assumption, set so the deck example plans on 35-50 orders a week |
| kNN | k = 3, inverse-distance weights, 5 signals scored 0-10 | deck (slide 6); the signal scores are simulated |
| Proxy confidence | Medium if mean distance ≤ 1.7 and neighbour demand within 4x; else Low | assumption |
| Product demand, earnings, pincode counts | simulated | – |

## Demand Contract

| Term | Value | Source |
|---|---|---|
| First-batch cap | ₹26,000 | deck |
| Batch size | min(3 weeks × low band, ₹26k ÷ price, 2 weeks of capacity) | deck: "sized on the bottom of the band, capped at capacity and the ₹26k limit" |
| Advance | 60% of batch value within 48 h of GRN | deck |
| Interest | 18% p.a., charged daily, only while the advance is out | deck |
| Reorder | at 75% sold | deck |
| Clearance | under 40% sold by Day 21 → flash sale | deck |
| Graduation | 3 batches sold to 75% within 14 days → 7-day payout | deck |
| Lanes | 4 checks: all pass = high (full advance); 3 = mid (20-unit pilot lot at 50%, rest released if 14 of 20 sell by Day 15); ≤2 = low (no advance) | deck (slide 10) |
| Per-order deductions | ₹63: Valmo fulfilment ~₹43, GST on fees ~₹11, TCS/TDS and payment ~₹9 | calibrated to deck: "₹229 nets ₹166" |
| Kurti listing price | ₹439 | assumption, consistent with ₹229 flash price (52% of list) and 42 units to repay |
| Flash price | 52% of listing price | calibrated to deck (₹439 → ₹229) |

## Runway simulation

| Assumption | Value |
|---|---|
| Daily orders | new listing ramps from half to the full "likely" rate over 14 days, then grows up to 1.6x as ratings build |
| Scenarios | Strong = 1.4x, Sales stall = 0.28x the planned rate |
| PO to GRN | 4 days (research: kurti dispatch 3-4 days) |
| Next batch | same size or larger: max(previous batch, 2 weeks of the last 7 days' sales), capped at 2 weeks of capacity |
| Escrow | buyer payments for an open advance collect in the nodal account; the lender is repaid in one go when they cover principal + interest |
| Today's model | factory pays for the batch at GRN and receives each sale's payout 7 days later |
| Batch cost | valued at the factory's B2B rate |
| Ad credit option | ₹2,000 of the first advance; assumed +20% orders for the first 21 days |
| Returns | not modelled in Runway (they are on the Safety Net screen) |

## Return Safety Net

| Term | Value | Source |
|---|---|---|
| Contribution | 1.5% of the NBFC advance on day 1 (onboarding), 1.5% of net escrow on every payout after graduation | deck |
| Threshold | factory carries returns up to 6% of the week's net sales; the pool pays the rest | deck |
| Weekly pattern | 5, 7, 23, 5, 4, 5.5, 4.5, 5, 30, 5, 5.5, 5 (%) | read off deck slide 7 |
| Weekly net sales | likely orders/wk × net per order | simulated |

## KPI Control Tower

The 12 KPIs, targets, gates, North Star and trip-wire rules are from the deck (slides 8 and 9). The three pilot readings (on plan, forecasts over-promise, bad RTO month) are **illustrative numbers**, chosen to show how the dashboard and trip-wires react. They are not forecasts.

## Known simplifications

- One SKU per factory; one cluster per category in the pilot.
- Interest is charged on the full advance until it is repaid in one go from escrow, matching the deck's "~₹54 by Day 9".
- The deck uses Day 21 for the clearance check on the contract slide and Day 45 on the KPI slide. The prototype uses Day 21 throughout.
