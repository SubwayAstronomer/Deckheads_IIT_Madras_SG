import { useState } from 'react';
import { Check, Copy, MapPin, MessageCircle } from 'lucide-react';
import { NextStep, PageHead, SectionTitle } from '../components/ui';
import { useJourney } from '../state/journey';
import { PRODUCTS, SIGNAL_NAMES } from '../data/products';
import { HERO_INPUTS, distance, nearestListed, type CardInputs, type CardResult } from '../engine/opportunityCard';
import { inrCompact } from '../engine/util';
import { pitchText, t, type Lang } from '../i18n/strings';

const PRESETS: { label: string; inputs: CardInputs }[] = [
  { label: 'Surat kurti maker (deck example)', inputs: HERO_INPUTS },
  { label: 'Agra sandal maker', inputs: { ownerName: 'M Qureshi', factoryName: 'Agra Step Footwear', productId: 'sandals', b2bPrice: 130, weeklyCapacity: 300, pincode: '282002' } },
  { label: 'New product, no Meesho history', inputs: { ownerName: 'S Goyal', factoryName: 'Panipat Sleep Co', productId: 'pillow', b2bPrice: 140, weeklyCapacity: 400, pincode: '132103' } },
];

export default function OpportunityCard() {
  const j = useJourney();
  const { inputs, card } = j;
  const set = (patch: Partial<CardInputs>) => j.setInputs({ ...inputs, ...patch });

  return (
    <>
      <PageHead
        eyebrow="Step 1 · Find and convince · used by the Meesho STAR at the factory"
        title="Opportunity Card"
        lede="Four inputs captured on the visit become three proof points named for this factory, in English or Hindi, ready to send on WhatsApp. If the product has never sold on Meesho, demand is borrowed from its nearest look-alikes."
      />
      <div className="split">
        <div>
          <div className="card" data-tour="inputs">
            <div className="row between wrap">
              <h3>What the STAR captures on the visit</h3>
              <div className="row wrap" style={{ gap: 6 }}>
                {PRESETS.map((p) => (
                  <button key={p.label} className={`btn ${inputs.productId === p.inputs.productId && inputs.pincode === p.inputs.pincode ? 'primary' : ''}`} style={{ padding: '5px 10px', fontSize: 12.5 }} onClick={() => j.setInputs(p.inputs)}>{p.label}</button>
                ))}
              </div>
            </div>
            <div className="grid g2" style={{ marginTop: 14, gap: 12 }}>
              <div className="field"><label>Factory</label><input value={inputs.factoryName} onChange={(e) => set({ factoryName: e.target.value })} /></div>
              <div className="field"><label>Owner</label><input value={inputs.ownerName} onChange={(e) => set({ ownerName: e.target.value })} /></div>
              <div className="field">
                <label>① Product category</label>
                <select value={inputs.productId} onChange={(e) => set({ productId: e.target.value })}>
                  <optgroup label="Already sells on Meesho">
                    {PRODUCTS.filter((p) => p.hasHistory).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </optgroup>
                  <optgroup label="New to Meesho (no sales history)">
                    {PRODUCTS.filter((p) => !p.hasHistory).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </optgroup>
                </select>
              </div>
              <div className="field"><label>② B2B price per unit (₹)</label><input type="number" min={10} value={inputs.b2bPrice} onChange={(e) => set({ b2bPrice: Math.max(1, Number(e.target.value) || 0) })} /></div>
              <div className="field"><label>③ Weekly capacity (units)</label><input type="number" min={10} value={inputs.weeklyCapacity} onChange={(e) => set({ weeklyCapacity: Math.max(1, Number(e.target.value) || 0) })} /></div>
              <div className="field"><label>④ Factory pincode</label><input inputMode="numeric" maxLength={6} value={inputs.pincode} onChange={(e) => set({ pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} /></div>
            </div>
          </div>

          <SectionTitle>How each proof point is worked out</SectionTitle>
          <div className="grid g3" data-tour="math">
            <div className="card">
              <span className="num-badge">1</span>
              <h3 style={{ marginTop: 8 }}>Earnings multiplier</h3>
              <p className="sub">{card.demand.source === 'proxy' ? 'Makers of the 3 look-alike products' : `Top ${card.product.name.toLowerCase()} makers`} earn {inrCompact(card.earnings.topMakerMonthly)} a month on Meesho. Scaled to this factory's capacity: <b>{inrCompact(card.earnings.meeshoMonthly)}</b>. Its B2B run-rate at ₹{inputs.b2bPrice} × {inputs.weeklyCapacity}/wk, half the line busy: <b>{inrCompact(card.earnings.b2bMonthly)}</b>.</p>
            </div>
            <div className="card">
              <span className="num-badge">2</span>
              <h3 style={{ marginTop: 8 }}>Factory-matched demand</h3>
              <p className="sub">{card.demand.source === 'history' ? 'Weekly Meesho orders for products like this' : 'Weighted from the 3 nearest listed products'}: {card.demand.signalPerWeek}/wk, {card.demand.cappedByCapacity ? <>capped at 80% of capacity so a STAR never over-promises → <b>{card.demand.matchedPerWeek}/wk</b>.</> : <b>within capacity.</b>}</p>
            </div>
            <div className="card">
              <span className="num-badge">3</span>
              <h3 style={{ marginTop: 8 }}>Local proof</h3>
              <p className="sub">Makers of this category already live {card.local.level === 'pincode' ? <>in pincode <b>{inputs.pincode}</b></> : card.local.level === 'district' ? <>in the same district ({card.local.place})</> : card.local.level === 'region' ? <>in the {card.local.place}</> : 'nearby: none yet'}. Falls back from pincode to district to region.</p>
            </div>
          </div>

          {card.demand.source === 'proxy' ? <ProxyPanel card={card} /> : (
            <div className="note plum" style={{ marginTop: 18 }}>
              <b>No sales history? </b>Pick a product marked "(new)" or the third preset to see how the card borrows demand from look-alike products (kNN, k = 3).
            </div>
          )}
          <NextStep to="/contract" label="Owner is interested: draft the Demand Contract" />
        </div>
        <div data-tour="phone"><CardPhone card={card} lang={j.lang} setLang={j.setLang} /></div>
      </div>
    </>
  );
}

function CardPhone({ card, lang, setLang }: { card: CardResult; lang: Lang; setLang: (l: Lang) => void }) {
  const [copied, setCopied] = useState(false);
  const p = card.product;
  const mult = `${card.earnings.multiplier.toFixed(1)}x`;
  const catName = lang === 'hi' ? card.category.nameHi : card.category.name.toLowerCase();
  const place = lang === 'hi' ? card.local.placeHi : card.local.place;
  const text = pitchText(lang, {
    owner: card.inputs.ownerName, factory: card.inputs.factoryName, mult, b2b: inrCompact(card.earnings.b2bMonthly), meesho: inrCompact(card.earnings.meeshoMonthly),
    matched: card.demand.matchedPerWeek, product: lang === 'hi' ? p.nameHi : p.name.toLowerCase(), local: card.local.count, place, lo: card.demand.batchBand.low, li: card.demand.batchBand.likely,
  });
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ }
  };
  const confColor = card.demand.confidence === 'High' ? 'green' : card.demand.confidence === 'Medium' ? 'amber' : 'red';
  const cls = lang === 'hi' ? 'hi' : '';
  return (
    <div className="phone">
      <div className="phone-screen">
        <div className="phone-bar">
          <b>Opportunity Card</b>
          <div className="row" style={{ gap: 0 }}>
            <span className="live">● LIVE</span>
            <span className="lang"><button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button><button className={lang === 'hi' ? 'on' : ''} onClick={() => setLang('hi')}>हि</button></span>
          </div>
        </div>
        <div className={`phone-body ${cls}`}>
          <div>
            <div className="tiny muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{t('preparedFor', lang)}</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--plum)' }}>{card.inputs.factoryName}</div>
            <div className="tiny muted row" style={{ gap: 4 }}><MapPin size={12} /> {card.inputs.pincode} · {lang === 'hi' ? p.nameHi : p.name} · ₹{card.inputs.b2bPrice} · {card.inputs.weeklyCapacity}/wk</div>
          </div>
          <div className="proof">
            <div className="k"><span className="num-badge">1</span>{t('earnings', lang)}</div>
            <div className="v">{mult}</div>
            <div className="d">{t('earningsD', lang)(inrCompact(card.earnings.b2bMonthly), inrCompact(card.earnings.meeshoMonthly))}</div>
          </div>
          <div className="proof">
            <div className="k"><span className="num-badge">2</span>{t('matched', lang)}</div>
            <div className="v">~{card.demand.matchedPerWeek} <span style={{ fontSize: 15, color: 'var(--muted)' }}>{t('perWeek', lang)}</span></div>
            <div className="d">
              {card.demand.cappedByCapacity ? t('matchedD', lang)(80, card.inputs.weeklyCapacity) : card.demand.source === 'history' ? t('matchedHist', lang) : null}
              {card.demand.source === 'proxy' && <div style={{ marginTop: 4 }}><span className="pill amber">PROXY</span> {t('proxy', lang)(card.demand.neighbours.map((n) => (lang === 'hi' ? n.product.nameHi : n.product.name.toLowerCase())).join(', '))}</div>}
              <div style={{ marginTop: 6 }}>{t('confidence', lang)}: <span className={`pill ${confColor}`}>{card.demand.confidence}</span></div>
            </div>
          </div>
          <div className="proof">
            <div className="k"><span className="num-badge">3</span>{t('local', lang)}</div>
            {card.local.count > 0 ? (
              <>
                <div className="v">{card.local.count}</div>
                <div className="d">{t('localD', lang)(catName, place)}</div>
                <div className="dots">{Array.from({ length: Math.min(card.local.count, 20) }).map((_, i) => <i key={i} />)}</div>
              </>
            ) : <div className="d" style={{ marginTop: 6 }}>{t('localNone', lang)}</div>}
          </div>
          <div className="note" style={{ fontSize: 12.5 }}><b>{t('firstBatch', lang)}: </b>{t('firstBatchD', lang)(card.demand.batchBand.low, card.demand.batchBand.likely)}</div>
          <a className="wa" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer"><MessageCircle size={17} /> {t('sendWa', lang)}</a>
          <button className="btn" style={{ justifyContent: 'center' }} onClick={copy}>{copied ? <><Check size={15} /> {t('copied', lang)}</> : <><Copy size={15} /> {t('copy', lang)}</>}</button>
        </div>
      </div>
    </div>
  );
}

function ProxyPanel({ card }: { card: CardResult }) {
  const target = card.product;
  const nbrs = nearestListed(target);
  const ranked = PRODUCTS.filter((p) => p.hasHistory)
    .map((p) => ({ p, d: distance(p.signals, target.signals) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 8);
  const maxD = ranked[ranked.length - 1].d;
  return (
    <div className="card" style={{ marginTop: 18 }} data-tour="knn">
      <div className="row between wrap">
        <h3>Cold start: "{target.name}" has never sold on Meesho</h3>
        <span className={`pill ${card.demand.confidence === 'Medium' ? 'amber' : 'red'}`}>{card.demand.confidence} confidence</span>
      </div>
      <p className="sub" style={{ marginTop: 4 }}>Every product is a point on five signals ({SIGNAL_NAMES.join(', ').toLowerCase()}). Similar products sit closer. The 3 closest listed products lend their demand, weighted by closeness. Far-apart or uneven neighbours mean lower confidence, so the first batch is planned smaller.</p>
      <div className="grid g2" style={{ gap: 18, marginTop: 12 }}>
        <div className="stack" style={{ gap: 7 }}>
          <div className="tiny muted" style={{ fontWeight: 600 }}>Distance from the new product (shorter = more similar)</div>
          {ranked.map(({ p, d }, i) => (
            <div key={p.id} className="row" style={{ gap: 8 }}>
              <span className="small" style={{ width: 150, flex: 'none', fontWeight: i < 3 ? 700 : 400, color: i < 3 ? 'var(--plum)' : 'var(--muted)' }}>{p.name}</span>
              <div style={{ flex: 1, height: 10, background: '#f3ecf1', borderRadius: 6 }}>
                <div style={{ width: `${(d / maxD) * 100}%`, height: '100%', borderRadius: 6, background: i < 3 ? '#F5A623' : '#d9c9d5' }} />
              </div>
              <span className="tiny" style={{ width: 30, textAlign: 'right' }}>{d.toFixed(1)}</span>
            </div>
          ))}
        </div>
        <table className="t">
          <thead><tr><th>Nearest 3</th><th>Weight</th><th>Orders/wk</th></tr></thead>
          <tbody>
            {nbrs.map((n) => (
              <tr key={n.product.id}><td>{n.product.name}</td><td>{Math.round(n.weight * 100)}%</td><td>{n.product.weeklyDemand}</td></tr>
            ))}
            <tr><td><b>Borrowed demand</b></td><td /><td><b>{card.demand.signalPerWeek}</b></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
