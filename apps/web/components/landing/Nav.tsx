"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Me {
  walletAddress?: string;
  email?: string;
  name?: string;
}

export default function Nav() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { user?: Me } | null) => {
        if (data?.user) setMe(data.user);
      })
      .catch(() => null);
  }, []);

  const label = me?.name ?? me?.email ?? (me?.walletAddress ? `${me.walletAddress.slice(0, 6)}…${me.walletAddress.slice(-4)}` : null);

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

        {label ? (
          <Link
            href="/dashboard"
            className="nav-cta"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span style={{ width: 6, height: 6, background: 'var(--mint)', borderRadius: '50%', boxShadow: '0 0 6px var(--mint)' }} />
            {label}
          </Link>
        ) : (
          <Link href="/sign-in" className="nav-cta">
            Get Started &nbsp;<span className="cta-arr">→</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
