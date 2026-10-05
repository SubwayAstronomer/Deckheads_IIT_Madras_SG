import { PenLine, RotateCcw } from 'lucide-react';
import { NextStep, PageHead, SectionTitle } from '../components/ui';
import { useJourney } from '../state/journey';
import { APR, CLEARANCE_BELOW, CLEARANCE_DAY, FIRST_BATCH_CAP, GRADUATE_AFTER, REORDER_AT, laneChecks, type LaneChecks } from '../engine/contract';
import { inr } from '../engine/util';

const CHECKS: { key: keyof LaneChecks; label: string; why: string }[] = [
  { key: 'categorySells', label: 'Does the category sell on Meesho?', why: 'History, or a proxy forecast that is not Low confidence' },
  { key: 'priceInLine', label: 'Is the price in line with rivals?', why: 'Listing within 10% of the 20 closest rival listings' },
  { key: 'ratesWell', label: 'Do sample orders rate well?', why: 'Sample pieces rated 4.0★ or better' },
  { key: 'provenMaker', label: 'Has the maker supplied before?', why: '2+ years of B2B record (GST returns, buyer references)' },
];

const LANE_INFO = {
  high: { name: 'High confidence', pill: 'green', text: 'Full advance on the whole first batch.' },
  mid: { name: 'Mid confidence', pill: 'amber', text: 'The lender funds a 20-unit pilot lot first; the rest is funded only if 14 of 20 sell by Day 15.' },
  low: { name: 'Low confidence', pill: 'red', text: 'No advance, nothing is lent. Meesho observes and moves the maker up once it has a sales record.' },
} as const;

export default function Contract() {
  const j = useJourney();
  const { card, terms, checks } = j;
  const auto = laneChecks(card, j.facts);
  const lane = LANE_INFO[terms.lane];
  const byCap = Math.floor(FIRST_BATCH_CAP / terms.price);
  const byDemand = card.demand.batchBand.low * 3;
  const sigs = [j.inputs.ownerName, 'T Ahmed', 'S Iyer'];

  return (
    <>
      <PageHead
        eyebrow="Step 2 · Convince · signed by maker, Meesho and lender"
        title="Demand Contract"
        lede="One deal that turns a demand signal into a first purchase order: sized to the low end of the forecast, at the factory's own B2B rate, with cash upfront, a repayment from sales, and an agreed exit if sales stall."
      />
      <div className="split">
        <div>
          <div className="card" data-tour="lanes">
            <h3>Layer 1 · Sort before we lend: four checks pick the confidence lane</h3>
            <p className="sub">Pre-filled from the card and the visit. Untick one to see how the lender's cash at risk shrinks.</p>
            <div className="grid g2" style={{ marginTop: 12, gap: 10 }}>
              {CHECKS.map((c) => (
                <label key={c.key} className={`check ${checks[c.key] ? 'on' : ''}`}>
                  <input type="checkbox" checked={checks[c.key]} onChange={(e) => j.setChecksOverride({ ...j.checksOverride, [c.key]: e.target.checked })} />
                  <span><b style={{ fontSize: 13.5 }}>{c.label}</b><br /><span className="tiny muted">{c.why}{checks[c.key] !== auto[c.key] ? ' · changed by you' : ''}</span></span>
                </label>
              ))}
            </div>
            <div className="row between wrap" style={{ marginTop: 14 }}>
              <div className="row" style={{ gap: 10 }}>
                <span className={`pill ${lane.pill}`} style={{ fontSize: 13 }}>{lane.name}</span>
                <span className="small muted">{lane.text}</span>
              </div>
              {Object.keys(j.checksOverride).length > 0 && <button className="btn ghost" onClick={() => j.setChecksOverride({})}><RotateCcw size={14} /> Reset checks</button>}
            </div>
            <div className="grid g3" style={{ marginTop: 14 }}>
              <div className="stat"><span className="label">Lender cash at risk on Day 2</span><span className="mid">{inr(terms.cashAtRiskDay2)}</span></div>
              <div className="stat"><span className="label">Total funding if it sells</span><span className="mid">{inr(terms.advanceTotal)}</span></div>
              <div className="stat"><span className="label">Batch value</span><span className="mid">{inr(terms.batchValue)}</span></div>
            </div>
          </div>

          <SectionTitle>How the first batch is sized</SectionTitle>
          <div className="card">
            <table className="t">
              <tbody>
                <tr><td>3 weeks at the <b>low</b> end of the band ({card.demand.batchBand.low}/wk)</td><td style={{ textAlign: 'right' }}>{byDemand} units</td></tr>
                <tr><td>First-batch limit {inr(FIRST_BATCH_CAP)} ÷ ₹{terms.price}</td><td style={{ textAlign: 'right' }}>{byCap} units</td></tr>
                <tr><td>Two weeks of factory capacity</td><td style={{ textAlign: 'right' }}>{j.inputs.weeklyCapacity * 2} units</td></tr>
                <tr><td><b>First batch = the smallest of the three</b></td><td style={{ textAlign: 'right' }}><b>{terms.units} units</b></td></tr>
              </tbody>
            </table>
            <p className="tiny muted" style={{ marginTop: 8 }}>Seller, Meesho and lender all start small. The PO is close to the maker's usual B2B MOQ, so nothing about the factory floor changes.</p>
          </div>

          <SectionTitle>Options the maker chooses</SectionTitle>
          <div className="grid g2">
            <label className={`check ${j.safetyNet ? 'on' : ''}`}>
              <input type="checkbox" checked={j.safetyNet} onChange={(e) => j.setSafetyNet(e.target.checked)} />
              <span><b>Join the Return Safety Net</b><br /><span className="tiny muted">1.5% of the advance ({inr(terms.safetyNetContribution)}) into a shared pool that pays returns, RTO and fraud above 6% of a week's sales.</span></span>
            </label>
            <label className={`check ${j.adCredit ? 'on' : ''}`}>
              <input type="checkbox" checked={j.adCredit} onChange={(e) => j.setAdCredit(e.target.checked)} />
              <span><b>Take ₹2,000 of the advance as ad credit</b><br /><span className="tiny muted">Meesho Ads for the new catalogue in its first 3 weeks (we assume +20% orders).</span></span>
            </label>
          </div>
          <NextStep to="/runway" label="Signed: watch the money move" />
        </div>

        <div className="paper" data-tour="paper">
          <div className="paper-head"><b>DEMAND CONTRACT</b><span className={`pill ${lane.pill}`}>{lane.name}</span></div>
          <div className="paper-body">
            <div className="small"><b>Seller:</b> {j.inputs.factoryName}, {card.local.place.split(', ').pop()}<br /><b>Marketplace:</b> Meesho · 0% commission<br /><b>Financier:</b> MPPL partner NBFC</div>
            <div>
              <div className="eyebrow">The order</div>
              <div className="terms">
                <div className="term"><div className="v">{terms.units} units</div><div className="l">First batch</div></div>
                <div className="term"><div className="v">₹{terms.price}</div><div className="l">Price / unit · no cut</div></div>
              </div>
            </div>
            <div>
              <div className="eyebrow">The money</div>
              <div className="terms">
                <div className="term risk"><div className="v">{terms.tranches[0] ? `${Math.round(terms.tranches[0].pct * 100)}%` : '0%'}</div><div className="l">{terms.lane === 'mid' ? 'Pilot-lot advance' : 'Advance'} · 48 h of GRN</div></div>
                <div className="term"><div className="v">{Math.round(APR * 100)}% p.a.</div><div className="l">Interest, daily, only while out</div></div>
                <div className="term"><div className="v" style={{ fontSize: 15, paddingTop: 5 }}>Lender first</div><div className="l">Repaid directly from sales</div></div>
                <div className="term risk"><div className="v">{j.safetyNet ? '1.5%' : 'Off'}</div><div className="l">Returns Safety Net</div></div>
              </div>
            </div>
            <div>
              <div className="eyebrow">The triggers</div>
              <div className="terms">
                <div className="term"><div className="v">{REORDER_AT * 100}%</div><div className="l">Sold → next PO fires</div></div>
                <div className="term"><div className="v">&lt;{CLEARANCE_BELOW * 100}% · D{CLEARANCE_DAY}</div><div className="l">Flash sale clears stock and debt</div></div>
              </div>
              <div className="term" style={{ marginTop: 10 }}><div className="v">{GRADUATE_AFTER} batches</div><div className="l">Sold to 75% in 14 days → graduate to 7-day payout</div></div>
            </div>
            <div className="small muted" style={{ lineHeight: 1.5 }}>
              Flash sale at ~₹{terms.flashPrice} nets ~₹{terms.flashNet} a unit vs ~₹{terms.owedPerUnit} principal owed per unit, so the loan clears from the stock itself and the factory is not left holding dead stock.
            </div>
            <div className="sign">
              {['Seller', 'Meesho', 'Financier'].map((who, i) => (
                <div key={who}><div className="sig">{j.signed ? sigs[i] : ''}</div>{who}</div>
              ))}
            </div>
            <button className={`btn ${j.signed ? '' : 'primary'}`} style={{ justifyContent: 'center' }} onClick={() => j.setSigned(!j.signed)}><PenLine size={15} /> {j.signed ? 'Signed by all three · undo' : 'Sign as all three parties'}</button>
          </div>
        </div>
      </div>
    </>
  );
}
