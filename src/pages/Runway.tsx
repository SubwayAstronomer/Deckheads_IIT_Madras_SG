import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, ComposedChart } from 'recharts';
import { BadgeIndianRupee, Factory, Landmark, PackageCheck, ShoppingBag, Warehouse } from 'lucide-react';
import { NextStep, PageHead, Seg, SectionTitle } from '../components/ui';
import { useJourney } from '../state/journey';
import { inr, inrCompact } from '../engine/util';
import type { Scenario } from '../engine/runway';

const FLOW = [
  { icon: Factory, title: 'Factory', text: 'Makes one MOQ batch, like for a wholesale buyer' },
  { icon: Warehouse, title: 'Valmo 1st-mile hub', text: 'QC + GRN; lists stock live; ships order by order' },
  { icon: Landmark, title: 'Lender (NBFC via MPPL)', text: 'Advances 60% of batch value within 48 h of GRN' },
  { icon: ShoppingBag, title: 'Buyers', text: 'Each order\'s payment collects in Meesho\'s nodal account' },
  { icon: BadgeIndianRupee, title: 'Repayment waterfall', text: '① lender takes loan + interest ② factory keeps the rest' },
];

const EVENT_COLOR: Record<string, string> = { grn: '#6f5f6b', advance: '#1d8a57', repaid: '#4A1942', po: '#2f6db5', clearance: '#c23b3b', graduated: '#F5A623', 'pilot-release': '#1d8a57', 'pilot-stop': '#c23b3b' };

export default function Runway() {
  const j = useJourney();
  const { run, today, terms } = j;
  const s = run.summary;
  const data = run.days.map((d, i) => ({
    day: d.day,
    runway: Math.round(d.factoryCash),
    today: Math.round(today.days[i].factoryCash),
    sold: d.sold,
    owed: Math.round(d.owed),
  }));
  const firstLoan = run.loans[0];

  return (
    <>
      <PageHead
        eyebrow="Step 3 · Pay · Meesho nodal account + partner NBFC"
        title="Runway payments"
        lede="Today the factory pays for the whole batch, then waits for 7-day payouts order by order. With Runway, the lender bridges the wait: cash lands 2 days after the hub accepts the goods, and sales pay the lender back automatically."
        right={<Seg<Scenario> value={j.scenario} onChange={j.setScenario} options={[{ value: 'planned', label: 'Sales as planned' }, { value: 'strong', label: 'Strong sales' }, { value: 'slow', label: 'Sales stall' }]} />}
      />

      <div className="flow" data-tour="flow">
        {FLOW.map((f, i) => (
          <div key={f.title} className={`flow-node ${i === 2 || i === 4 ? 'new' : ''}`}>
            <div className="row" style={{ gap: 8, marginBottom: 6 }}><span className="num-badge">{i + 1}</span><f.icon size={18} color="#4A1942" /></div>
            <b>{f.title}</b>
            <p>{f.text}</p>
          </div>
        ))}
      </div>
      <p className="tiny muted" style={{ marginTop: 6 }}>Amber = new in our model; the rest runs on Meesho today.</p>

      <div className="grid g4" style={{ marginTop: 18 }} data-tour="runway-stats">
        <div className="card stat"><span className="label">Advance paid</span><span className="mid">{firstLoan ? inr(firstLoan.amount) : '₹0'}</span><span className="tiny muted">{firstLoan ? `Day ${firstLoan.startDay} · ${j.safetyNet ? `${inr(Math.round(firstLoan.amount * 0.015))} to Safety Net` : 'no Safety Net'}` : 'Low-confidence lane: nothing lent'}</span></div>
        <div className="card stat"><span className="label">Lender repaid</span><span className="mid">{s.lenderRepaidDay !== undefined ? `Day ${s.lenderRepaidDay}` : '–'}</span><span className="tiny muted">{s.unitsAtFirstRepay !== undefined ? `${s.clearanceDay === s.lenderRepaidDay ? 'from flash-sale proceeds' : `after ${s.unitsAtFirstRepay} units`} · interest ${inr(Math.round(s.firstInterest ?? 0))}` : '–'}</span></div>
        <div className="card stat"><span className="label">{s.clearanceDay !== undefined ? 'Flash sale' : 'Next PO fires'}</span><span className="mid">{s.clearanceDay !== undefined ? `Day ${s.clearanceDay}` : s.po2Day !== undefined ? `Day ${s.po2Day}` : '–'}</span><span className="tiny muted">{s.clearanceDay !== undefined ? `lender loss ${inr(Math.round(s.lenderLoss))} · factory gets back ${Math.round((1 + (run.days[run.days.length - 1].factoryCash) / terms.batchValue) * 100)}% of batch value` : `${s.soldByDay14} of ${terms.units} sold by Day 14`}</span></div>
        <div className="card stat"><span className="label">Graduates</span><span className="mid">{s.graduatedDay !== undefined ? `Day ${s.graduatedDay}` : '–'}</span><span className="tiny muted">{s.graduatedDay !== undefined ? '3 fast batches → 7-day payout' : s.clearanceDay !== undefined ? 'contract closed by clearance' : 'not yet'}</span></div>
      </div>

      <SectionTitle>The factory's cash position, today vs with Runway</SectionTitle>
      <div className="card" data-tour="cash-chart">
        <div className="row between wrap" style={{ marginBottom: 6 }}>
          <div className="small muted">Cumulative cash in and out for this programme: batches made, advances, payouts. Same batches, same sales.</div>
          <div className="row wrap" style={{ gap: 16 }}>
            <span className="small">Avg cash locked, first 30 days: <b>{inrCompact(today.summary.avgCashLocked30)}</b> → <b style={{ color: 'var(--green)' }}>{inrCompact(s.avgCashLocked30)}</b></span>
            <span className="small">Cash-positive: <b>Day {today.summary.breakevenDay ?? '–'}</b> → <b style={{ color: 'var(--green)' }}>Day {s.breakevenDay ?? '–'}</b></span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 10, right: 16, left: 6, bottom: 0 }}>
            <CartesianGrid stroke="#f1e8ef" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: '#e6d6e2' }} tick={{ fontSize: 11, fill: '#6f5f6b' }} label={{ value: 'Day since batch 1 reached the hub', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#a092a0' }} height={36} />
            <YAxis tickFormatter={(v) => inrCompact(v)} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6f5f6b' }} width={64} />
            <Tooltip formatter={(v: number, n: string) => [inr(v), n === 'runway' ? 'With Runway' : 'Today']} labelFormatter={(l) => `Day ${l}`} />
            <Legend verticalAlign="top" height={28} formatter={(v) => (v === 'runway' ? 'With Runway' : 'Today (factory funds the batch, waits for 7-day payouts)')} wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={0} stroke="#a092a0" />
            {run.events.filter((e) => ['advance', 'repaid', 'graduated', 'clearance'].includes(e.kind)).map((e, i) => (
              <ReferenceLine key={i} x={e.day} stroke={EVENT_COLOR[e.kind]} strokeDasharray="3 3" />
            ))}
            <Line type="stepAfter" dataKey="today" stroke="#a092a0" strokeWidth={2} strokeDasharray="5 4" dot={false} animationDuration={500} />
            <Line type="stepAfter" dataKey="runway" stroke="#F5A623" strokeWidth={3} dot={false} animationDuration={500} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid g2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3>Units sold each day, and what is still owed to the lender</h3>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={data} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#f1e8ef" vertical={false} />
              <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 11, fill: '#6f5f6b' }} />
              <YAxis yAxisId="u" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6f5f6b' }} width={28} />
              <YAxis yAxisId="r" orientation="right" tickFormatter={(v) => inrCompact(v)} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6f5f6b' }} width={56} />
              <Tooltip formatter={(v: number, n: string) => (n === 'owed' ? [inr(v), 'Owed to lender'] : [v, 'Units sold'])} labelFormatter={(l) => `Day ${l}`} />
              <Bar yAxisId="u" dataKey="sold" fill="#cbb0c5" radius={[3, 3, 0, 0]} />
              <Line yAxisId="r" type="stepAfter" dataKey="owed" stroke="#4A1942" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="card" data-tour="events">
          <h3>What happened, day by day</h3>
          <div className="stack" style={{ marginTop: 10, maxHeight: 236, overflowY: 'auto', gap: 8 }}>
            {run.events.filter((e) => e.day <= 45).map((e, i) => (
              <div key={i} className="row" style={{ alignItems: 'flex-start' }}>
                <span className="pill" style={{ background: EVENT_COLOR[e.kind], color: '#fff', minWidth: 54, justifyContent: 'center' }}>D{e.day}</span>
                <span className="small">{e.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionTitle>Why the lender is comfortable</SectionTitle>
      <div className="grid g3">
        <div className="card"><PackageCheck size={20} color="#4A1942" /><h3 style={{ marginTop: 6 }}>Goods before money</h3><p className="sub">The advance is released only after the batch passes QC at the hub. The lender is lending against stock it can see.</p></div>
        <div className="card"><Landmark size={20} color="#4A1942" /><h3 style={{ marginTop: 6 }}>Paid first, from sales</h3><p className="sub">Buyer payments sit in Meesho's nodal account; the lender is cleared before the factory sees a rupee. Cash at risk is about a week.</p></div>
        <div className="card"><BadgeIndianRupee size={20} color="#4A1942" /><h3 style={{ marginTop: 6 }}>One batch of risk</h3><p className="sub">Each batch gets a fresh advance only after the last one is repaid. If sales stall, the Day-21 flash sale clears the stock and the debt. Try "Sales stall" above.</p></div>
      </div>
      <NextStep to="/safety-net" label="Next: protect the factory from a bad returns week" />
    </>
  );
}
