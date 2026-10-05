import { CheckCircle2, Star, XCircle } from 'lucide-react';
import { PageHead, Seg, SectionTitle } from '../components/ui';
import { GATES, KPIS, READINGS, fmtKpi, gateResult, tripWires, type ScenarioId } from '../engine/cohort';
import { useJourney } from '../state/journey';

const STAGES = [
  { id: 'Onboarding', q: 'Does the pitch convert, and is the card honest?' },
  { id: 'Activation', q: 'Does batch 1 sell before the lender is exposed?' },
  { id: 'Retention', q: 'Does the factory stay once the support comes off?' },
] as const;

const SCALE = [
  { when: 'D0-90', name: 'Pilot', n: '60', where: '4 clusters, 4 categories', add: '12 STARs, 1 lender', gate: 'Pilot launch' },
  { when: 'M4-M6', name: 'Replicate', n: '600', where: '12 clusters, same 4 categories', add: '40 STARs; churned sellers at full scale', gate: 'Day-90 check passes' },
  { when: 'M7-M12', name: 'Extend', n: '6,000', where: '30 clusters, 7 categories', add: 'WhatsApp self-serve card; 3 lenders', gate: '7+ of every 100 still selling at D180' },
  { when: 'Year 2', name: 'Default', n: '35,000', where: 'All eligible categories', add: 'Contract becomes the standard sign-up', gate: 'Lender losses under 2% at 6,000' },
];

export default function ControlTower() {
  const { reading: id, setReading: setId } = useJourney();
  const r = READINGS.find((x) => x.id === id)!;
  const wires = tripWires(r);
  const nsPass = r.northStar >= 7;

  return (
    <>
      <PageHead
        eyebrow="Step 6 · Measure · Meesho's C2M team"
        title="KPI Control Tower"
        lede="Twelve KPIs follow every factory from the STAR's visit to Day 180. Each is read at a fixed gate in the 30-60-90 pilot, and each trip-wire maps to one pre-agreed action. Switch the pilot reading to see the dashboard react."
        right={<Seg<ScenarioId> value={id} onChange={setId} options={READINGS.map((x) => ({ value: x.id, label: x.label }))} />}
      />
      <div className="note plum" style={{ marginBottom: 16 }}><b>{r.label}.</b> {r.blurb} <span className="muted">Illustrative pilot readings, not forecasts.</span></div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 18 }}>
        <div className="card" data-tour="gates">
          <h3>Review gates · how we call success</h3>
          <div className="grid g4" style={{ marginTop: 12, gap: 10 }}>
            {GATES.map((g) => {
              const ok = gateResult(r, g.day);
              return (
                <div key={g.day} className={`kpi ${ok ? '' : 'fail'}`}>
                  <div className="top"><b style={{ fontSize: 18, color: 'var(--plum)' }}>D{g.day}</b>{ok ? <CheckCircle2 size={20} color="#1d8a57" /> : <XCircle size={20} color="#c23b3b" />}</div>
                  <div className="small" style={{ fontWeight: 600 }}>{g.question}</div>
                  <div className="tiny muted">{g.day === 180 ? 'North Star ≥7 per 100 cards' : `KPIs ${g.kpis.join(', ')}`}</div>
                  {!ok && <div className="tiny" style={{ color: 'var(--red)' }}>If missed: {g.ifMissed}</div>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="card" data-tour="north-star" style={{ background: nsPass ? '#fffaf0' : '#fffafa', borderColor: nsPass ? '#f6d79b' : '#efb7b4' }}>
          <div className="row" style={{ gap: 8 }}><Star size={18} color="#F5A623" fill="#F5A623" /><span className="eyebrow" style={{ margin: 0 }}>North Star</span></div>
          <h3 style={{ marginTop: 6 }}>Self-sustaining factories per 100 cards shown</h3>
          <div className="row" style={{ alignItems: 'baseline', gap: 8, marginTop: 6 }}><span className="big" style={{ color: nsPass ? 'var(--plum)' : 'var(--red)' }}>{r.northStar.toFixed(1)}</span><span className="muted">target ≥7</span></div>
          <p className="tiny muted" style={{ marginTop: 6 }}>Graduated and still shipping at D180 on the 7-day payout, no NBFC advance. {r.holding} of {r.graduates} graduates hold ({Math.round((r.holding / r.graduates) * 100)}%, quality check ≥70%) from {r.cardsShown} cards.</p>
        </div>
      </div>

      <SectionTitle>The 12 KPIs, read against their pilot targets</SectionTitle>
      <div className="grid g3" data-tour="kpis">
        {STAGES.map((st) => (
          <div key={st.id} className="stack">
            <div><span className="pill plum">{st.id.toUpperCase()}</span><div className="small muted" style={{ marginTop: 4 }}>{st.q}</div></div>
            {KPIS.filter((k) => k.stage === st.id).map((k) => {
              const v = r.values[k.n];
              const ok = k.pass(v);
              return (
                <div key={k.n} className={`kpi ${ok ? '' : 'fail'}`}>
                  <div className="top">
                    <div className="row" style={{ gap: 8 }}><span className="num-badge">{k.n}</span><span className="name">{k.name}</span></div>
                    <span className="tiny muted">{k.when}</span>
                  </div>
                  <div className="row between" style={{ alignItems: 'baseline' }}>
                    <span className={`val ${ok ? 'ok' : 'bad'}`}>{fmtKpi(k, v)}</span>
                    <span className="small muted">target {k.target}</span>
                  </div>
                  <div className="tiny muted">{k.definition}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <SectionTitle>Trip-wires · the action each one triggers</SectionTitle>
      <div className="stack" data-tour="wires">
        {wires.map((w) => (
          <div key={w.id} className={`wire ${w.fired ? 'on' : ''}`}>
            <div className="act">{w.action}</div>
            <div className="row between wrap">
              <div><b className="small">{w.rule}</b> <span className="small muted">→ {w.what}</span></div>
              <span className={`pill ${w.fired ? 'amber' : 'grey'}`}>{w.fired ? 'FIRED · ' : ''}{w.detail}</span>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>How the program scales once the gates pass</SectionTitle>
      <div className="grid g4">
        {SCALE.map((s, i) => (
          <div key={s.name} className="card" style={i === 0 ? { borderColor: 'var(--amber)' } : undefined}>
            <div className="row between"><span className="pill plum">{s.when}</span><span className="tiny muted">{s.name}</span></div>
            <div className="mid" style={{ marginTop: 8 }}>{s.n} <span className="small muted" style={{ fontWeight: 500 }}>factories</span></div>
            <p className="tiny muted" style={{ marginTop: 6 }}><b>Where:</b> {s.where}<br /><b>Adds:</b> {s.add}<br /><b>Starts when:</b> {s.gate}</p>
          </div>
        ))}
      </div>
    </>
  );
}
