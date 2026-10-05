// Guided demo: walks the whole story on its own (about 3 minutes), so it can be screen-recorded
// for the submission video. Space = pause/resume, arrow keys = previous/next, Esc = exit.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import { useJourney } from '../state/journey';
import { HERO_INPUTS } from '../engine/opportunityCard';
import { STEPS, type DemoStep } from './steps';

interface DemoCtx { active: boolean; index: number; start: () => void; stop: () => void; }
const Ctx = createContext<DemoCtx>({ active: false, index: 0, start: () => {}, stop: () => {} });
export const useDemo = () => useContext(Ctx);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  return (
    <Ctx.Provider value={{ active, index, start: () => { setIndex(0); setActive(true); }, stop: () => setActive(false) }}>
      <IndexBridge.Provider value={{ setIndex }}>{children}</IndexBridge.Provider>
    </Ctx.Provider>
  );
}
const IndexBridge = createContext<{ setIndex: (i: number) => void }>({ setIndex: () => {} });

export function DemoTour() {
  const { active, index, stop } = useDemo();
  const { setIndex } = useContext(IndexBridge);
  const j = useJourney();
  const navigate = useNavigate();
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const step: DemoStep | undefined = STEPS[index];
  const jRef = useRef(j);
  jRef.current = j;

  // apply the step: route, state, highlight
  useEffect(() => {
    if (!active || !step) return;
    setElapsed(0);
    navigate(step.route);
    step.apply?.(jRef.current, HERO_INPUTS);
    const tm = setTimeout(() => {
      document.querySelectorAll('.spot').forEach((el) => el.classList.remove('spot'));
      if (step.spot) {
        const el = document.querySelector(`[data-tour="${step.spot}"]`);
        if (el) { el.classList.add('spot'); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      } else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 350);
    return () => clearTimeout(tm);
  }, [active, index]); // eslint-disable-line react-hooks/exhaustive-deps

  // clean up on exit
  useEffect(() => {
    if (!active) document.querySelectorAll('.spot').forEach((el) => el.classList.remove('spot'));
  }, [active]);

  // timer
  useEffect(() => {
    if (!active || paused || !step) return;
    const iv = setInterval(() => setElapsed((e) => e + 100), 100);
    return () => clearInterval(iv);
  }, [active, paused, step]);
  useEffect(() => {
    if (!active || !step || elapsed < step.ms) return;
    if (index < STEPS.length - 1) setIndex(index + 1); else stop();
  }, [elapsed]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = useCallback((d: number) => setIndex(Math.max(0, Math.min(STEPS.length - 1, index + d))), [index, setIndex]);
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stop();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === ' ') { e.preventDefault(); setPaused((p) => !p); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, go, stop]);

  if (!active || !step) return null;
  return (
    <div className="tour" role="dialog" aria-label="Guided demo">
      <div className="cap">{step.caption}</div>
      <div className="prog"><span style={{ width: `${Math.min(100, (elapsed / step.ms) * 100)}%` }} /></div>
      <div className="meta">
        <small>Guided demo · {index + 1} / {STEPS.length} · {step.chapter}</small>
        <div className="row" style={{ gap: 6 }}>
          <button onClick={() => go(-1)} aria-label="Previous"><ChevronLeft size={15} /></button>
          <button onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Resume' : 'Pause'}>{paused ? <Play size={15} /> : <Pause size={15} />}{paused ? 'Resume' : 'Pause'}</button>
          <button onClick={() => go(1)} aria-label="Next"><ChevronRight size={15} /></button>
          <button onClick={stop} aria-label="Exit demo"><X size={15} /></button>
        </div>
      </div>
    </div>
  );
}
