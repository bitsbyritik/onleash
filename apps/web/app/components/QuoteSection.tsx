"use client";

import { useState, useEffect, useRef } from "react";

function useCounter(target: number, duration = 800, start = false) {
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

export function QuoteSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const n1 = useCounter(35, 1000, visible);
  const n2 = useCounter(2000, 1000, visible);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="quote-section" ref={ref}>
      <div className="container">
        <div className="quote-inner">
          <div className="quote-mark">&ldquo;</div>
          <blockquote className="quote-text">
            You don&apos;t want to give a credit card to an agent without a lot of control.
          </blockquote>
          <div className="quote-attr">— Privy × Stripe Panel, DAS NYC 2026</div>
          <div className="stats-row">
            <div className="stat-block">
              <div className="stat-num">{n1}%</div>
              <div className="stat-label">of incoming Solana devs</div>
              <div className="stat-sub">are building agentic products</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-block">
              <div className="stat-num">{n2.toLocaleString()}+</div>
              <div className="stat-label">developers</div>
              <div className="stat-sub">already in Solana Agent Kit ecosystem</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
