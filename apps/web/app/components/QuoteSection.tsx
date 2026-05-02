"use client";

import { useState, useEffect, useRef } from "react";

function useCounter(target: number, duration = 900, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [start, target, duration]);
  return value;
}

const STATS = [
  { target: 35,   suffix: "%",  label: "of new Solana devs",    sub: "building agentic products" },
  { target: 2000, suffix: "+",  label: "developers",             sub: "in Solana Agent Kit ecosystem" },
  { target: 100,  suffix: "ms", label: "avg policy check",       sub: "zero extra latency" },
];

export function QuoteSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const n0 = useCounter(STATS[0]!.target, 900, visible);
  const n1 = useCounter(STATS[1]!.target, 1100, visible);
  const n2 = useCounter(STATS[2]!.target, 700, visible);
  const values = [n0, n1, n2];

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) setVisible(true); },
      { threshold: 0.25 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="quote-section" ref={ref}>
      <div className="container">

        <div className="quote-card reveal">
          <div className="quote-card-bg" />
          <div className="quote-card-inner">
            <div className="quote-glyph">&ldquo;</div>
            <blockquote className="quote-text">
              You don&apos;t want to give a credit card to an agent
              without a <em>lot</em> of control.
            </blockquote>
            <div className="quote-attr-row">
              <div className="quote-attr-avatar">P×S</div>
              <div>
                <div className="quote-attr-name">Privy × Stripe Panel</div>
                <div className="quote-attr-event">DAS New York, 2026</div>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-grid reveal">
          {STATS.map((s, i) => (
            <div key={s.label} className="stat-card">
              <div className="stat-num">
                {values[i]!.toLocaleString()}{s.suffix}
              </div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
