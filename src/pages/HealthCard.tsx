import { Check, Clock, MessageCircle } from 'lucide-react';
import { Bar, NextStep, PageHead, Seg, SectionTitle } from '../components/ui';
import { useJourney } from '../state/journey';
import { t, type Lang } from '../i18n/strings';
import { inr } from '../engine/util';
import { DECK_WEEKLY_LOSS, RETURNS_THRESHOLD } from '../engine/safetyNet';
import type { RunwayResult, Scenario } from '../engine/runway';
import type { CardResult } from '../engine/opportunityCard';

export interface Health {
  day: number;
  batchN: number;
  batchUnits: number;
  batchSold: number;
  cumSold: number;
  forecastCum: number;
  ordersVsForecast: number;
  realisedMultiplier: number;
  status: 'onTrack' | 'watch' | 'clearance' | 'graduated';
  advanceDay?: number;
  advanceAmount?: number;
  repaidDay?: number;
  repaidUnits?: number;
  owedNow: number;
  poDue?: { units: number };
  weekReturn: number;
  milestones: { label: string; day?: number }[];
}

/** Everything the Health Card shows, read off the Runway simulation at a given day. */
export function healthAt(run: RunwayResult, card: CardResult, day: number): Health {
  const row = run.days[Math.min(day, run.days.length - 1)];
  // the batch currently selling = oldest batch that still has stock at this day (or the latest one)
  let sellingN = 1;
  let acc = 0;
  for (const b of run.batches.filter((x) => x.grnDay <= day)) { acc += b.units; sellingN = b.n; if (row.cumSold < acc) break; }
  const selling = run.batches.find((b) => b.n === sellingN) ?? run.batches[0];
  const soldBefore = run.batches.filter((b) => b.n < selling.n).reduce((s, b) => s + b.units, 0);
  const batchSold = Math.max(0, Math.min(selling.units, row.cumSold - soldBefore));
  const forecastCum = Math.round((card.demand.batchBand.low / 7) * day);
  const ratio = forecastCum > 0 ? row.cumSold / forecastCum : 1;
  const first = run.loans[0];
  const s = run.summary;
  const status: Health['status'] = s.graduatedDay !== undefined && day >= s.graduatedDay ? 'graduated' : s.clearanceDay !== undefined && day >= s.clearanceDay ? 'clearance' : ratio >= 0.9 || day < 3 ? 'onTrack' : 'watch';
  const poEvent = run.events.find((e) => e.kind === 'po' && e.day === day);
  const nextBatch = poEvent ? run.batches.find((b) => b.poDay === day) : undefined;
  return {
    day, batchN: selling.n, batchUnits: selling.units, batchSold, cumSold: row.cumSold, forecastCum,
    ordersVsForecast: ratio,
    realisedMultiplier: card.earnings.multiplier * Math.min(1.1, ratio),
    status,
    advanceDay: first && first.startDay <= day ? first.startDay : undefined,
    advanceAmount: first?.amount,
    repaidDay: first?.repaidDay !== undefined && first.repaidDay <= day ? first.repaidDay : undefined,
    repaidUnits: first?.unitsSoldAtRepay,
    owedNow: row.owed,
    poDue: nextBatch ? { units: nextBatch.units } : undefined,
    weekReturn: DECK_WEEKLY_LOSS[Math.max(0, Math.min(11, Math.ceil(Math.max(day, 1) / 7) - 1))],
    milestones: [
      { label: 'GRN', day: 0 },
      { label: 'Advance', day: first?.startDay },
      { label: 'Lender repaid', day: first?.repaidDay },
      { label: s.clearanceDay !== undefined ? 'Flash sale' : 'PO 2', day: s.clearanceDay ?? s.po2Day },
      { label: 'Clearance check', day: 21 },
      { label: 'Graduation', day: s.graduatedDay },
    ],
  };
}

export default function HealthCard() {
  const j = useJourney();
  const h = healthAt(j.run, j.card, j.day);
  const maxDay = 45;
  return (
    <>
      <PageHead
        eyebrow="Step 5 · Retain · in the STAR app and on the factory's WhatsApp"
        title="Health Card"
        lede="The Opportunity Card's promises, checked live against what the factory actually sees. Drag through the days to watch Shree Balaji Kurtis move from first batch to graduation."
        right={<Seg<Scenario> value={j.scenario} onChange={j.setScenario} options={[{ value: 'planned', label: 'As planned' }, { value: 'strong', label: 'Strong' }, { value: 'slow', label: 'Sales stall' }]} />}
      />
      <div className="split">
        <div>
          <div className="card" data-tour="day-slider">
            <div className="row between"><h3>Day {j.day} since batch 1 reached the hub</h3><span className="small muted">{h.cumSold} units sold so far</span></div>
            <input type="range" min={0} max={maxDay} value={j.day} onChange={(e) => j.setDay(Number(e.target.value))} aria-label="Day" style={{ marginTop: 12 }} />
            <div className="row between tiny muted"><span>D0</span><span>D9</span><span>D14</span><span>D21</span><span>D30</span><span>D45</span></div>
            <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
              {[0, 2, 9, 14, 21, 30, j.run.summary.graduatedDay ?? 40].map((d) => <button key={d} className="btn" style={{ padding: '4px 10px', fontSize: 12.5 }} onClick={() => j.setDay(d)}>Day {d}</button>)}
            </div>
          </div>

          <SectionTitle>Each line on the card is a KPI on the control tower</SectionTitle>
          <div className="card">
            <table className="t">
              <thead><tr><th>On the card</th><th>Today's reading</th><th>KPI</th></tr></thead>
              <tbody>
                <tr><td>Orders vs forecast</td><td>{h.cumSold} vs {h.forecastCum} ({Math.round(h.ordersVsForecast * 100)}%)</td><td>KPI 3 · Forecast hit</td></tr>
                <tr><td>Earnings multiplier</td><td>{h.realisedMultiplier.toFixed(1)}x vs {j.card.earnings.multiplier.toFixed(1)}x promised</td><td>KPI 11 · Promise kept</td></tr>
                <tr><td>Advance</td><td>{h.advanceDay !== undefined ? `Paid Day ${h.advanceDay}` : 'Not yet'}</td><td>KPI 5 · Paid upfront</td></tr>
                <tr><td>Lender repaid</td><td>{h.repaidDay !== undefined ? `Day ${h.repaidDay}, after ${h.repaidUnits} units` : `${inr(Math.round(h.owedNow))} still owed`}</td><td>KPI 6 · Lender repaid</td></tr>
                <tr><td>Batch sell-through</td><td>{h.batchSold} of {h.batchUnits} (batch {h.batchN})</td><td>KPI 7 · Sell-through</td></tr>
                <tr><td>Graduation</td><td>{h.status === 'graduated' ? 'Graduated' : `Batch ${Math.min(3, h.batchN)} of 3`}</td><td>KPI 10 · Graduation</td></tr>
                <tr><td>RTO Safety Net</td><td>{Math.round(h.weekReturn * 100)}% returns this week</td><td>KPI 12 · Loss ratio</td></tr>
              </tbody>
            </table>
          </div>

          {h.status === 'watch' && (
            <div className="note" style={{ marginTop: 16 }}>
              <b>Early check (Day 10-15) flags this listing.</b> Orders are below the low end of the forecast. Meesho prescribes one fix at a time: price (where it ranks against rivals), photos, ad credit, or category. The STAR gets a named task; the lender is not yet exposed beyond one batch.
            </div>
          )}
          <NextStep to="/control-tower" label="Next: how Meesho watches hundreds of these" />
        </div>
        <div data-tour="health-phone"><HealthPhone h={h} lang={j.lang} setLang={j.setLang} factory={j.inputs.factoryName} pin={j.inputs.pincode} price={j.inputs.b2bPrice} promised={j.card.earnings.multiplier} /></div>
      </div>
    </>
  );
}

function HealthPhone({ h, lang, setLang, factory, pin, price, promised }: { h: Health; lang: Lang; setLang: (l: Lang) => void; factory: string; pin: string; price: number; promised: number }) {
  const statusText = { onTrack: t('onTrack', lang), watch: t('watch', lang), clearance: t('clearance', lang), graduated: t('graduated', lang) }[h.status];
  const statusBg = { onTrack: 'var(--amber-soft)', watch: 'var(--red-soft)', clearance: 'var(--red-soft)', graduated: 'var(--green-soft)' }[h.status];
  const shareText = lang === 'hi'
    ? `${factory} - दिन ${h.day}: ${h.cumSold} बिके (अनुमान ${h.forecastCum})। कमाई ${h.realisedMultiplier.toFixed(1)}x।`
    : `${factory} - Day ${h.day}: ${h.cumSold} sold vs ${h.forecastCum} forecast. Earnings ${h.realisedMultiplier.toFixed(1)}x vs ${promised.toFixed(1)}x promised.`;
  return (
    <div className="phone">
      <div className="phone-screen">
        <div className="phone-bar">
          <b>{t('health', lang)}</b>
          <div className="row" style={{ gap: 0 }}>
            <span className="live">● LIVE</span>
            <span className="lang"><button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button><button className={lang === 'hi' ? 'on' : ''} onClick={() => setLang('hi')}>हि</button></span>
          </div>
        </div>
        <div className={`phone-body ${lang === 'hi' ? 'hi' : ''}`}>
          <div className="row between">
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--plum)' }}>{factory}</div>
              <div className="tiny muted">{pin} · batch {h.batchN} · {h.batchUnits} × ₹{price}</div>
            </div>
            <span className="pill plum" style={{ fontSize: 13 }}>{t('day', lang)} {h.day}</span>
          </div>
          <div style={{ background: statusBg, borderRadius: 10, padding: '9px 12px', fontSize: 13, fontWeight: 700 }}>
            {statusText.toUpperCase()} · {t('soldOf', lang)(h.batchSold, h.batchUnits)}{h.poDue ? ` · PO ${h.batchN + 1}` : ''}
          </div>
          <div>
            <div className="tiny muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{t('promise', lang)}</div>
            <div className="row between small" style={{ marginTop: 6 }}><span>{t('earnings', lang)}</span><b style={{ color: 'var(--plum)' }}>{h.realisedMultiplier.toFixed(1)}x <span className="muted" style={{ fontWeight: 400 }}>vs {promised.toFixed(1)}x</span></b></div>
            <Bar value={h.realisedMultiplier} max={2.6} notch={promised} />
            <div className="row between small" style={{ marginTop: 8 }}><span>{t('ordersVs', lang)}</span><b style={{ color: 'var(--plum)' }}>{h.cumSold} <span className="muted" style={{ fontWeight: 400 }}>vs {h.forecastCum} · {Math.round(h.ordersVsForecast * 100)}%</span></b></div>
            <Bar value={Math.min(h.ordersVsForecast, 1.5)} max={1.5} notch={1} color={h.ordersVsForecast < 0.9 ? '#c23b3b' : undefined} />
          </div>
          <div>
            <div className="tiny muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{t('money', lang)}</div>
            <div className="row small" style={{ marginTop: 6 }}>{h.advanceDay !== undefined ? <Check size={16} color="#1d8a57" /> : <Clock size={16} color="#a092a0" />}<span style={{ flex: 1 }}>{h.advanceAmount ? inr(h.advanceAmount) : '₹0'} {h.advanceDay !== undefined ? t('advancePaid', lang) : t('advanceDue', lang)}</span><span className="tiny muted">{h.advanceDay !== undefined ? `D${h.advanceDay}` : ''}</span></div>
            <div className="row small" style={{ marginTop: 6 }}>{h.repaidDay !== undefined ? <Check size={16} color="#1d8a57" /> : <Clock size={16} color="#a092a0" />}<span style={{ flex: 1 }}>{h.repaidDay !== undefined ? t('lenderRepaid', lang) : `${t('lenderOwed', lang)}: ${inr(Math.round(h.owedNow))}`}</span><span className="tiny muted">{h.repaidDay !== undefined ? `D${h.repaidDay} · ${h.repaidUnits}u` : ''}</span></div>
          </div>
          <div>
            <div className="tiny muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{t('journey', lang)}</div>
            <div className="timeline" style={{ paddingTop: 10 }}>
              {h.milestones.filter((m) => m.day !== undefined).map((m) => {
                const done = m.day! <= h.day;
                return <div key={m.label} className={`tl-step ${done ? 'done' : ''}`}><div className="tl-dot" /><b>D{m.day}</b></div>;
              })}
            </div>
            <div className="tiny muted" style={{ marginTop: 6 }}>{h.status === 'graduated' ? t('graduated', lang) : t('batchOf', lang)(Math.min(3, h.batchN))}</div>
          </div>
          <div style={{ border: '1px solid var(--plum-line)', borderRadius: 10, padding: '8px 12px', fontSize: 12.5 }}>
            <b>{t('safety', lang)}</b> · {Math.round(h.weekReturn * 100)}% {h.weekReturn <= RETURNS_THRESHOLD ? t('safetyD', lang) : lang === 'hi' ? 'रिटर्न 6% से ऊपर - अतिरिक्त हिस्सा पूल देगा।' : 'returns this week; the pool pays the part above 6%.'}
          </div>
          <div className="row" style={{ gap: 8, marginTop: 'auto' }}>
            <button className="btn primary" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }} disabled={!h.poDue}>{h.poDue ? t('confirmPo', lang)(h.poDue.units) : 'PO: —'}</button>
            <a className="btn" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }} href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
}
