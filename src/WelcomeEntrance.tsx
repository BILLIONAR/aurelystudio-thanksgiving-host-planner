import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import './WelcomeEntrance.css';

const INTRO_DURATION = 4000;

function HarvestSculpture() {
  const id = useId().replace(/:/g, '');
  return <div className="entrance-scene" aria-hidden="true">
    <div className="entrance-scene-caption"><span>THE ART OF GATHERING</span><i /></div>
    <div className="entrance-plinth" />
    <div className="entrance-sculpture">
      <div className="glass-pumpkin">
        {Array.from({ length: 8 }, (_, index) => <div className="pumpkin-rib" key={index} style={{ '--rib-angle': `${index * 22.5}deg` } as CSSProperties} />)}
        <div className="pumpkin-stem" /><div className="pumpkin-glint" />
      </div>
      {[0, 1, 2].map(index => <svg key={index} className={`entrance-leaf leaf-${index}`} viewBox="-115 -130 245 335">
        <defs><linearGradient id={`${id}-leaf-${index}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--accent)" stopOpacity=".85" /><stop offset=".48" stopColor="var(--main)" stopOpacity=".4" /><stop offset="1" stopColor="var(--accent)" stopOpacity=".9" /></linearGradient></defs>
        <path d="M0 143-15 86-57 105-40 64-89 45-44 26-70-9-28 5-24-46-3-26 0-106 21-37 42-60 37-8 77-17 59 22 107 33 65 62 77 98 34 83 14 145 7 182-1 182Z" fill={`url(#${id}-leaf-${index})`} stroke="var(--accent)" strokeWidth="1.5" />
        <path d="M0 186 0-70M0 40-49 18M0 67 58 39M0 98-39 67M0 17 30-17" fill="none" stroke="var(--card)" strokeWidth="2" opacity=".65" />
      </svg>)}
      <svg className="entrance-wheat" viewBox="0 0 130 300"><g fill="none" stroke="var(--accent)" strokeWidth="1.8"><path d="M65 290Q60 148 86 18M44 282Q34 178 16 94M76 282Q109 174 117 116" />{Array.from({ length: 8 }, (_, index) => <g key={index} transform={`translate(${75 - index * 1.4} ${42 + index * 23})`}><path d="M0 18Q-30 3-16-13Q3-4 0 18Z" fill="var(--accent)" fillOpacity=".2" /><path d="M0 19Q29 6 21-12Q4-4 0 19Z" fill="var(--accent)" fillOpacity=".25" /></g>)}</g></svg>
    </div>
    <span className="entrance-scene-note">a little autumn, a little wonder</span>
  </div>;
}

export function WelcomeEntrance({ name, brand, onName, onComplete }: {
  name: string; brand: ReactNode; onName: (name: string) => void; onComplete: () => void;
}) {
  const [phase, setPhase] = useState<'name' | 'intro'>(() => name.trim() ? 'intro' : 'name');
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const greeting = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === 'name') { input.current?.focus({ preventScroll: true }); return; }
    greeting.current?.focus({ preventScroll: true });
    // A real timer keeps the entrance at four seconds, including in calm mode.
    const timer = window.setTimeout(onComplete, INTRO_DURATION);
    return () => window.clearTimeout(timer);
  }, [phase, onComplete]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = draft.trim();
    if (!value) { setError('Add your name or nickname to continue.'); input.current?.focus(); return; }
    onName(value);
    setPhase('intro');
  }

  return <section className={`welcome-entrance entrance-${phase}`} aria-label="Welcome to your Thanksgiving Host Planner">
    <header className="entrance-header">{brand}<span className="entrance-header-note">A SEASON TO GATHER</span></header>
    <div className="entrance-layout">
      <div className="entrance-copy">
        {phase === 'name' ? <form onSubmit={submit} noValidate>
          <span className="eyebrow">A PLACE AT YOUR TABLE</span>
          <h1>Let’s make<br />this yours.</h1>
          <p className="entrance-description">Good food. Warm company.<br />A little more room to enjoy it all.</p>
          <label className="entrance-name-label" htmlFor="entrance-name">Your name or nickname</label>
          <input id="entrance-name" ref={input} value={draft} maxLength={80} autoComplete="given-name" placeholder="What should we call you?" required aria-invalid={Boolean(error)} aria-describedby={error ? 'entrance-name-error entrance-privacy' : 'entrance-privacy'} onChange={event => { setDraft(event.target.value); setError(''); }} />
          {error && <p id="entrance-name-error" className="form-error" role="alert">{error}</p>}
          <button className="entrance-enter" type="submit">Enter my planner <span aria-hidden="true">↗</span></button>
          <p id="entrance-privacy" className="entrance-privacy">Your name stays in this browser. No account needed.</p>
        </form> : <div className={`entrance-greeting ${name.trim().length > 24 ? 'entrance-long-name' : ''}`} ref={greeting} tabIndex={-1}>
          <span className="eyebrow">YOUR PLACE IS READY</span>
          <h1>Welcome to<br />your table,<br /><em>{name.trim()}.</em></h1>
          <p className="entrance-description">Let’s make room for what matters.</p>
          <div className="entrance-progress" role="status"><span>Opening your planner</span><span className="entrance-progress-track" aria-hidden="true"><i /></span></div>
          <button className="entrance-skip" onClick={onComplete}>Skip intro <span aria-hidden="true">→</span></button>
        </div>}
      </div>
      <HarvestSculpture />
    </div>
    <footer className="entrance-footer"><span>THANKSGIVING HOST PLANNER</span><span>Made for moments together.</span></footer>
  </section>;
}
