import { useState } from 'react';
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Camera, CheckCircle2, ScanLine } from 'lucide-react';
import { NextStep, PageHead, SectionTitle } from '../components/ui';
import { useJourney } from '../state/journey';
import { DECK_WEEKLY_LOSS, RETURNS_THRESHOLD, simulateSafetyNet } from '../engine/safetyNet';
import { inr } from '../engine/util';

export default function SafetyNet() {
  const j = useJourney();
  const [threshold, setThreshold] = useState(RETURNS_THRESHOLD);
  const [rates, setRates] = useState(DECK_WEEKLY_LOSS);
  const advance = j.terms.tranches[0]?.amount ?? 15600;
  const weeklyNet = Math.round(j.card.demand.batchBand.likely * j.terms.netPerUnit);
  const weeks = simulateSafetyNet({ lossRates: rates, weeklyNetEscrow: weeklyNet, advance, graduationWeek: 5, threshold, optIn: j.safetyNet });
  const data = weeks.map((w) => ({
    week: w.week,
    carried: Math.round(Math.min(w.lossRate, threshold) * 1000) / 10,
    pool: j.safetyNet ? Math.round(Math.max(0, w.lossRate - threshold) * 1000) / 10 : 0,
    exposed: j.safetyNet ? 0 : Math.round(Math.max(0, w.lossRate - threshold) * 1000) / 10,
    factory: Math.round(w.factoryPctWith * 1000) / 10,
  }));
  const worst = weeks.reduce((a, b) => (b.lossRate > a.lossRate ? b : a));
  const contributed = weeks.reduce((s, w) => s + w.contribution, 0);
  const poolPaid = weeks.reduce((s, w) => s + w.poolPays, 0);
  const toggleSpike = (wk: number) => setRates(rates.map((r, i) => (i === wk - 1 ? (r > 0.12 ? 0.05 : 0.28) : r)));

  return (
    <>
      <PageHead
        eyebrow="Step 4 · Retain · voluntary, shared by every seller on the program"
        title="Return Safety Net"
        lede="Collective insurance for sellers. Everyone chips in 1.5%. Returns up to 6% of a week's sales are business as usual; above that, the pool pays for reverse shipping, lost or swapped parcels and zone-wide RTO spikes."
        right={<label className={`check ${j.safetyNet ? 'on' : ''}`} style={{ minWidth: 220 }}><input type="checkbox" checked={j.safetyNet} onChange={(e) => j.setSafetyNet(e.target.checked)} /><span><b>{j.inputs.factoryName} has opted in</b></span></label>}
      />

      <div className="grid g4" data-tour="sn-stats">
        <div className="card stat"><span className="label">Phase 1 · day 1</span><span className="mid">{inr(Math.round(advance * 0.015))}</span><span className="tiny muted">1.5% of the NBFC advance. A new seller has no settlements yet, so a bad first batch never touches its ledger.</span></div>
        <div className="card stat"><span className="label">Phase 2 · every payout</span><span className="mid">1.5%</span><span className="tiny muted">of net escrow after fees and taxes, so the seller pays only on revenue it actually earned.</span></div>
        <div className="card stat"><span className="label">Worst week (week {worst.week})</span><span className="mid" style={{ color: j.safetyNet ? 'var(--green)' : 'var(--red)' }}>{(worst.factoryPctWith * 100).toFixed(1)}%</span><span className="tiny muted">of that week's sales borne by the factory, instead of {(worst.lossRate * 100).toFixed(0)}% without the net</span></div>
        <div className="card stat"><span className="label">12 weeks, this factory</span><span className="mid">{inr(Math.round(poolPaid))}</span><span className="tiny muted">paid out by the pool vs {inr(Math.round(contributed))} put in. The pool spreads that across every seller.</span></div>
      </div>

      <SectionTitle>12 weeks of returns, RTO and fraud for this factory</SectionTitle>
      <div className="card" data-tour="sn-chart">
        <div className="row between wrap">
          <p className="small muted">Bars: what returns cost each week, as % of that week's net sales ({inr(weeklyNet)}). <b>Click a bar</b> to add or remove a bad week.</p>
          <div className="row" style={{ gap: 8, minWidth: 260 }}>
            <span className="small">Threshold <b>{Math.round(threshold * 100)}%</b></span>
            <input type="range" min={0.04} max={0.1} step={0.01} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} aria-label="Returns threshold" />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 14, right: 10, left: 0, bottom: 0 }} onClick={(e) => e?.activeLabel && toggleSpike(Number(e.activeLabel))}>
            <CartesianGrid stroke="#f1e8ef" vertical={false} />
            <ReferenceArea x1={1} x2={4} fill="#f4ebf2" fillOpacity={0.6} label={{ value: 'Phase 1 · onboarding', position: 'insideTopLeft', fontSize: 11, fill: '#4A1942' }} />
            <XAxis dataKey="week" tickLine={false} tick={{ fontSize: 11, fill: '#6f5f6b' }} label={{ value: 'week', position: 'insideBottomRight', offset: -2, fontSize: 11, fill: '#a092a0' }} />
            <YAxis unit="%" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6f5f6b' }} width={40} />
            <Tooltip formatter={(v: number, n: string) => [`${v}%`, ({ carried: 'Factory carries (normal returns)', pool: 'Pool pays', exposed: 'Factory carries (no net)', factory: 'Factory total incl. 1.5%' } as Record<string, string>)[n]]} labelFormatter={(l) => `Week ${l}${Number(l) === 5 ? ' · graduation' : ''}`} />
            <Legend formatter={(v) => ({ carried: 'Normal returns (factory)', pool: 'Paid by the pool', exposed: 'Spike the factory eats (not opted in)', factory: 'What the factory actually carries' } as Record<string, string>)[v]} wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={threshold * 100} stroke="#4A1942" strokeDasharray="4 3" label={{ value: `threshold ${Math.round(threshold * 100)}%`, position: 'insideTopRight', fontSize: 11, fill: '#4A1942' }} />
            <Bar dataKey="carried" stackId="a" fill="#cbb0c5" cursor="pointer" />
            <Bar dataKey="pool" stackId="a" fill="#F5A623" fillOpacity={0.55} cursor="pointer" />
            <Bar dataKey="exposed" stackId="a" fill="#c23b3b" fillOpacity={0.6} cursor="pointer" />
            {j.safetyNet && <Line type="stepAfter" dataKey="factory" stroke="#4A1942" strokeWidth={2.5} dot={false} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <SectionTitle>A claim pays only when the proof is there</SectionTitle>
      <div className="grid g3" data-tour="claim">
        <div className="card">
          <div className="row between"><h3>Claim SN-0912 · week 9</h3><span className="pill green">Approved</span></div>
          <p className="sub" style={{ marginTop: 4 }}>Courier breakdown in one delivery zone sent back 30% of the week's orders.</p>
          <table className="t" style={{ marginTop: 8 }}>
            <tbody>
              <tr><td>Week's net sales</td><td style={{ textAlign: 'right' }}>{inr(weeklyNet)}</td></tr>
              <tr><td>Factory carries ({Math.round(threshold * 100)}% threshold)</td><td style={{ textAlign: 'right' }}>{inr(Math.round(threshold * weeklyNet))}</td></tr>
              <tr><td><b>Pool pays</b></td><td style={{ textAlign: 'right' }}><b>{inr(Math.round(Math.max(0, 0.3 - threshold) * weeklyNet))}</b></td></tr>
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Proof checked automatically</h3>
          <div className="stack" style={{ marginTop: 8 }}>
            <div className="row"><Camera size={18} color="#4A1942" /><span className="small">QC photo taken at GRN when the batch reached the hub</span><CheckCircle2 size={16} color="#1d8a57" /></div>
            <div className="row"><ScanLine size={18} color="#4A1942" /><span className="small">Return scan at the hub matches the original item</span><CheckCircle2 size={16} color="#1d8a57" /></div>
            <div className="row"><CheckCircle2 size={18} color="#4A1942" /><span className="small">Spike is zone-wide, not one seller's packaging</span><CheckCircle2 size={16} color="#1d8a57" /></div>
          </div>
        </div>
        <div className="card">
          <h3>The pool keeps itself honest</h3>
          <p className="sub" style={{ marginTop: 4 }}>KPI 12 tracks pool payouts ÷ contributions every month. If payouts outrun contributions (loss ratio above 1.0), the threshold is raised, which the RESET trip-wire on the control tower does automatically.</p>
        </div>
      </div>
      <NextStep to="/health" label="Next: what the factory sees every day" />
    </>
  );
}
