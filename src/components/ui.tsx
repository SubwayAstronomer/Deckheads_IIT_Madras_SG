import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function PageHead({ eyebrow, title, lede, right }: { eyebrow: string; title: string; lede: ReactNode; right?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p className="lede">{lede}</p>
      </div>
      {right}
    </div>
  );
}

export const SectionTitle = ({ children }: { children: ReactNode }) => <div className="section-title">{children}</div>;

export function Seg<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => (
        <button key={o.value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)} role="tab" aria-selected={o.value === value}>{o.label}</button>
      ))}
    </div>
  );
}

export function NextStep({ to, label }: { to: string; label: string }) {
  return (
    <div className="row" style={{ justifyContent: 'flex-end', marginTop: 28 }}>
      <Link className="btn primary" to={to}>{label} <ArrowRight size={16} /></Link>
    </div>
  );
}

export function Bar({ value, max = 1, notch, color }: { value: number; max?: number; notch?: number; color?: string }) {
  const w = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="bar">
      <span style={{ width: `${w}%`, background: color }} />
      {notch !== undefined && <i className="notch" style={{ left: `${Math.min(100, (notch / max) * 100)}%` }} />}
    </div>
  );
}
