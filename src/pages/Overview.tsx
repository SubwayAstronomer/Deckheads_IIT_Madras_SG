import { Link } from 'react-router-dom';
import { ArrowRight, BadgeIndianRupee, Gauge, HeartPulse, Play, ScrollText, ShieldCheck, Sparkles } from 'lucide-react';
import { PageHead, SectionTitle } from '../components/ui';
import { useDemo } from '../demo/DemoTour';
import { COHORTS } from '../data/categories';

const TOOLS = [
  { q: 'Q1 · Find', title: 'Opportunity Card', to: '/card', icon: Sparkles, text: 'A STAR types 4 facts at the factory gate and gets 3 proof points named for that factory: earnings vs its B2B run-rate, matched weekly demand, and makers nearby already selling.' },
  { q: 'Q2 · Convince', title: 'Demand Contract', to: '/contract', icon: ScrollText, text: 'One deal signed by maker, Meesho and lender: a small first batch at the factory\'s own B2B rate, cash upfront, repaid from sales, with an exit if sales stall.' },
  { q: 'Q3 · Pay', title: 'Runway payments', to: '/runway', icon: BadgeIndianRupee, text: '60% of the batch value lands within 48 h of GRN at the Valmo hub. Sales repay the lender first, then every payout is the factory\'s.' },
  { q: 'Q4 · Retain', title: 'Return Safety Net', to: '/safety-net', icon: ShieldCheck, text: 'A 1.5% shared pool pays returns, RTO and fraud above 6% of a week\'s sales, so one bad week never drives a new seller off.' },
  { q: 'Q4 · Retain', title: 'Health Card', to: '/health', icon: HeartPulse, text: 'The card\'s promises, checked live: orders vs forecast, money received, the road to graduation. On the STAR app and the factory\'s WhatsApp.' },
  { q: 'Measure', title: 'KPI Control Tower', to: '/control-tower', icon: Gauge, text: '12 KPIs from onboarding to retention, the North Star, the D30-60-90-180 gates, and the trip-wires that tell Meesho when to scale, fix or tighten.' },
];

const STORY = [
  { d: 'Visit', t: 'STAR shows the card' },
  { d: 'Day 0', t: '100 kurtis pass QC at the hub' },
  { d: 'Day 2', t: '₹15,600 advance paid' },
  { d: 'Day 9', t: 'Lender repaid after 42 units' },
  { d: 'Day 14', t: '75% sold, PO 2 fires' },
  { d: '~Day 40', t: 'Graduates to 7-day payout' },
];

export default function Overview() {
  const demo = useDemo();
  return (
    <>
      <PageHead
        eyebrow="Meesho DICE Challenge S3 · Business track · Prototype round"
        title="C2M Launchpad: bring a factory onto Meesho and keep it there"
        lede={<>Large manufacturers stay offline because B2C means unproven demand, inventory risk and a cash-flow hole. This prototype runs our answer end to end, following one Surat kurti maker from the STAR's first visit to graduating off support.</>}
        right={<button className="btn amber" onClick={demo.start}><Play size={16} /> Play guided demo (3 min)</button>}
      />

      <div className="card" data-tour="story" style={{ background: 'linear-gradient(135deg,#4a1942,#6b2a60)', color: '#fff', border: 0 }}>
        <div className="row between wrap">
          <div>
            <div className="tiny" style={{ letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f5d9ec', fontWeight: 700 }}>Follow one factory</div>
            <h2 style={{ fontSize: 22, marginTop: 4 }}>Shree Balaji Kurtis · Ring Road, Surat 395003</h2>
            <p style={{ color: '#f2dcec', marginTop: 4, fontSize: 14 }}>B2B rate ₹260 a kurti · 500 a week capacity · 9 years supplying wholesalers · never sold online</p>
          </div>
          <Link to="/card" className="btn amber">Start with the STAR visit <ArrowRight size={16} /></Link>
        </div>
        <div className="row wrap" style={{ gap: 0, marginTop: 18 }}>
          {STORY.map((s, i) => (
            <div key={s.d} style={{ flex: '1 1 140px', borderLeft: i ? '1px solid rgba(255,255,255,0.2)' : 0, padding: '4px 14px' }}>
              <div style={{ color: '#F5A623', fontWeight: 800, fontSize: 13 }}>{s.d}</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>{s.t}</div>
            </div>
          ))}
        </div>
      </div>

      <SectionTitle>The problem tree, and the tool that answers each branch</SectionTitle>
      <div className="grid g3" data-tour="tools">
        {TOOLS.map((tool) => (
          <Link key={tool.to} to={tool.to} className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="row between">
              <span className="pill plum">{tool.q}</span>
              <tool.icon size={20} color="#4A1942" />
            </div>
            <h3 style={{ fontSize: 17 }}>{tool.title}</h3>
            <p className="sub">{tool.text}</p>
            <span className="small" style={{ color: 'var(--plum)', fontWeight: 600, marginTop: 'auto' }}>Open <ArrowRight size={13} style={{ verticalAlign: -2 }} /></span>
          </Link>
        ))}
      </div>

      <SectionTitle>Which barriers each cohort faces, and what removes them</SectionTitle>
      <div className="grid g3">
        {COHORTS.map((c) => (
          <div className="card" key={c.id}>
            <div className="row between"><h3>{c.name}</h3></div>
            <span className="pill amber" style={{ marginTop: 4 }}>{c.pilotRole}</span>
            <div className="stack" style={{ marginTop: 12 }}>
              {c.barriers.map((b) => (
                <div key={b.title} style={{ borderTop: '1px solid #f1e8ef', paddingTop: 8 }}>
                  <div className="row between">
                    <b style={{ fontSize: 13.5 }}>{b.title}</b>
                    <span className={`pill ${b.solvedBy[0] === 'none' ? 'grey' : 'green'}`}>{b.solvedBy[0] === 'none' ? 'Not solved here' : b.solvedBy.map(label).join(' + ')}</span>
                  </div>
                  <p className="tiny muted" style={{ marginTop: 3 }}>{b.gate === 'onboarding' ? 'Onboarding · ' : 'Scale-up · '}{b.line}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="tiny muted" style={{ marginTop: 10 }}>Barriers from our 15 manufacturer calls and 2 interviews (deck slide 3). We say plainly which barriers this prototype does not touch.</p>
    </>
  );
}

function label(k: string) {
  return ({ card: 'Card', contract: 'Contract', runway: 'Runway', safetynet: 'Safety Net' } as Record<string, string>)[k] ?? k;
}
