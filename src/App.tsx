import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Play } from 'lucide-react';
import { JourneyProvider } from './state/journey';
import { DemoProvider, DemoTour, useDemo } from './demo/DemoTour';
import Overview from './pages/Overview';
import OpportunityCard from './pages/OpportunityCard';
import Contract from './pages/Contract';
import Runway from './pages/Runway';
import SafetyNet from './pages/SafetyNet';
import HealthCard from './pages/HealthCard';
import ControlTower from './pages/ControlTower';

export const NAV = [
  { group: 'Start here', items: [{ to: '/', label: 'Overview', n: '0' }] },
  { group: 'Find & convince', items: [{ to: '/card', label: 'Opportunity Card', n: '1' }, { to: '/contract', label: 'Demand Contract', n: '2' }] },
  { group: 'Pay', items: [{ to: '/runway', label: 'Runway payments', n: '3' }] },
  { group: 'Retain', items: [{ to: '/safety-net', label: 'Return Safety Net', n: '4' }, { to: '/health', label: 'Health Card', n: '5' }] },
  { group: 'Measure', items: [{ to: '/control-tower', label: 'KPI Control Tower', n: '6' }] },
];

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#fff" />
      <path d="M8 22V10l8 7 8-7v12" stroke="#4A1942" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="25.5" r="2" fill="#F5A623" />
    </svg>
  );
}

function Shell() {
  const demo = useDemo();
  const items = NAV.flatMap((g) => g.items);
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">
          <Logo />
          <div>
            <b>C2M Launchpad</b>
            <small>Meesho DICE S3 · Team Deckheads</small>
          </div>
        </div>
        <button className="play" onClick={demo.start}><Play size={16} /> Play guided demo</button>
        <nav className="nav">
          {NAV.map((g) => (
            <div key={g.group}>
              <div className="nav-group">{g.group}</div>
              {g.items.map((it) => (
                <NavLink key={it.to} to={it.to} end className={({ isActive }) => (isActive ? 'active' : '')}>
                  <span className="num">{it.n}</span>{it.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="side-foot">
          Prototype with simulated data, built on the worked example in our deck. Numbers are illustrative.
          <br />IIT Madras · Kalp Shah, Mithun M R
        </div>
      </aside>
      <div style={{ minWidth: 0 }}>
        <div className="topbar-mobile">
          <a href="#" onClick={(e) => { e.preventDefault(); demo.start(); }} style={{ background: '#F5A623', color: '#3a2400', fontWeight: 700 }}>▶ Demo</a>
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} end className={({ isActive }) => (isActive ? 'active' : '')}>{it.label}</NavLink>
          ))}
        </div>
        <main className="main">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/card" element={<OpportunityCard />} />
            <Route path="/contract" element={<Contract />} />
            <Route path="/runway" element={<Runway />} />
            <Route path="/safety-net" element={<SafetyNet />} />
            <Route path="/health" element={<HealthCard />} />
            <Route path="/control-tower" element={<ControlTower />} />
            <Route path="*" element={<Overview />} />
          </Routes>
        </main>
      </div>
      <DemoTour />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <JourneyProvider>
        <DemoProvider>
          <Shell />
        </DemoProvider>
      </JourneyProvider>
    </HashRouter>
  );
}
