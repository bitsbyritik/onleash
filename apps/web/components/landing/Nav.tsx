"use client";

import Link from "next/link";

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand" style={{ gap: 0 }}>
          <span style={{
            fontFamily: 'var(--display), "Bebas Neue", sans-serif',
            fontSize: 26,
            letterSpacing: '0.08em',
            lineHeight: 1,
            textTransform: 'uppercase',
          }}>
            <span style={{ color: 'var(--ink-dim)' }}>On</span>
            <span style={{ color: 'var(--mint)' }}>Leash</span>
          </span>
        </Link>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#demo">Live Demo</a>
          <a href="#code">SDK</a>
          <a href="#hitl">HITL</a>
        </div>

        <a href="#get-started" className="nav-cta">
          Get Started &nbsp;<span className="cta-arr">→</span>
        </a>
      </div>
    </nav>
  );
}
