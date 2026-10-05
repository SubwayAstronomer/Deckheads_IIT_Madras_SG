// One factory's journey, shared by every screen: what the STAR types into the Opportunity Card
// flows into the Demand Contract, the Runway simulation, the Safety Net and the Health Card.
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { computeCard, HERO_INPUTS, type CardInputs, type CardResult } from '../engine/opportunityCard';
import { buildContract, HERO_FACTS, laneChecks, laneFor, type ContractTerms, type FactoryFacts, type LaneChecks } from '../engine/contract';
import { simulateRunway, type RunwayResult, type Scenario } from '../engine/runway';
import type { Lang } from '../i18n/strings';
import type { ScenarioId } from '../engine/cohort';

interface JourneyState {
  inputs: CardInputs; setInputs: (i: CardInputs) => void;
  facts: FactoryFacts; setFacts: (f: FactoryFacts) => void;
  checksOverride: Partial<LaneChecks>; setChecksOverride: (c: Partial<LaneChecks>) => void;
  safetyNet: boolean; setSafetyNet: (b: boolean) => void;
  adCredit: boolean; setAdCredit: (b: boolean) => void;
  scenario: Scenario; setScenario: (s: Scenario) => void;
  day: number; setDay: (d: number) => void;
  lang: Lang; setLang: (l: Lang) => void;
  signed: boolean; setSigned: (b: boolean) => void;
  reading: ScenarioId; setReading: (r: ScenarioId) => void;
  reset: () => void;
  // derived
  card: CardResult;
  checks: LaneChecks;
  terms: ContractTerms;
  run: RunwayResult;
  today: RunwayResult;
}

const Ctx = createContext<JourneyState | null>(null);

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<CardInputs>(HERO_INPUTS);
  const [facts, setFacts] = useState<FactoryFacts>(HERO_FACTS);
  const [checksOverride, setChecksOverride] = useState<Partial<LaneChecks>>({});
  const [safetyNet, setSafetyNet] = useState(true);
  const [adCredit, setAdCredit] = useState(false);
  const [scenario, setScenario] = useState<Scenario>('planned');
  const [day, setDay] = useState(14);
  const [lang, setLang] = useState<Lang>('en');
  const [signed, setSigned] = useState(false);
  const [reading, setReading] = useState<ScenarioId>('healthy');

  const derived = useMemo(() => {
    const card = computeCard(inputs);
    const checks = { ...laneChecks(card, facts), ...checksOverride };
    const terms = buildContract(card, laneFor(checks), safetyNet);
    const base = {
      lane: terms.lane, price: terms.price, netPerUnit: terms.netPerUnit, flashNet: terms.flashNet,
      batch1Units: terms.units, weeklyCapacity: inputs.weeklyCapacity, likelyPerWeek: card.demand.batchBand.likely,
      scenario, safetyNetOptIn: safetyNet, adCredit: adCredit ? 2000 : 0, horizon: 45,
    };
    const run = simulateRunway({ ...base, mode: 'runway' });
    const today = simulateRunway({ ...base, mode: 'today', adCredit: 0 });
    return { card, checks, terms, run, today };
  }, [inputs, facts, checksOverride, safetyNet, adCredit, scenario]);

  const reset = () => {
    setInputs(HERO_INPUTS); setFacts(HERO_FACTS); setChecksOverride({}); setSafetyNet(true);
    setAdCredit(false); setScenario('planned'); setDay(14); setSigned(false); setReading('healthy'); setLang('en');
  };

  return (
    <Ctx.Provider value={{ inputs, setInputs, facts, setFacts, checksOverride, setChecksOverride, safetyNet, setSafetyNet, adCredit, setAdCredit, scenario, setScenario, day, setDay, lang, setLang, signed, setSigned, reading, setReading, reset, ...derived }}>
      {children}
    </Ctx.Provider>
  );
}

export function useJourney() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useJourney outside provider');
  return c;
}
