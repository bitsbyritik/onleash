'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/dashboard/Topbar';
import { APPROVALS_PENDING, APPROVALS_RESOLVED, type Approval } from '../data';

function ApprovalCard({ a }: { a: Approval }) {
  const [resolved, setResolved] = useState<'approved' | 'rejected' | null>(null);
  const [t, setT] = useState(a.secondsLeft);

  useEffect(() => {
    if (resolved) return;
    const id = setInterval(() => setT(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(id);
  }, [resolved]);

  if (resolved) {
    const colors = { approved: 'var(--mint)', rejected: 'var(--danger)' };
    return (
      <div className="ds-appr-card" style={{ borderColor: colors[resolved], background: resolved === 'approved' ? 'var(--mint-soft)' : 'var(--danger-soft)' }}>
        <div className="head">
          <div>
            <div className="nm" style={{ color: colors[resolved] }}>{resolved.toUpperCase()}</div>
            <div className="req">{a.wallet} · {a.amount} {a.token}</div>
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink-dim)' }}>
          Receipt logged · sha256 a4f1c2…
        </div>
      </div>
    );
  }

  const m = Math.floor(t / 60);
  const s = String(t % 60).padStart(2, '0');

  return (
    <div className={`ds-appr-card${a.urgent ? ' urgent' : ''}`}>
      <div className="head">
        <div>
          <div className="nm">{a.wallet}</div>
          <div className="req">{a.requestedAt}</div>
        </div>
        <div className="timer">
          <span className="pulse" />EXPIRES {m}:{s}
        </div>
      </div>
      <div className="agrid">
        <div className="k">Amount</div><div className="v amount">{a.amount.toFixed(2)} {a.token}</div>
        <div className="k">To</div><div className="v">{a.to} <span className="dim">· {a.toLabel}</span></div>
        <div className="k">Memo</div><div className="v dim">&quot;{a.memo}&quot;</div>
        <div className="k">Flagged</div><div className="v warn">{a.reason}</div>
      </div>
      <div className="aactions">
        <button className="ds-btn ds-btn-mint" onClick={() => setResolved('approved')}>✓ APPROVE</button>
        <button className="ds-btn ds-btn-danger" onClick={() => setResolved('rejected')}>✕ REJECT</button>
      </div>
    </div>
  );
}

export default function ApprovalsPage() {
  return (
    <>
      <Topbar title="Approvals" pendingCount={2} hideCta />
      <div className="ds-content">
        <div className="ds-section-h" style={{ marginTop: 8 }}>
          <h2>Pending · 2</h2>
          <span className="lbl">human-in-the-loop · 5:00 window</span>
        </div>

        <div className="ds-appr-grid">
          {APPROVALS_PENDING.map(a => <ApprovalCard key={a.id} a={a} />)}
        </div>

        <div className="ds-section-h" style={{ marginTop: 40 }}>
          <h2>Resolved · today</h2>
          <span className="lbl">{APPROVALS_RESOLVED.length} approvals</span>
        </div>
        <div className="ds-panel">
          {APPROVALS_RESOLVED.map(r => (
            <div className="ds-appr-resolved-row" key={r.id}>
              <span className="nm">{r.wallet}</span>
              <span className="am">{r.amount}</span>
              <span className="by">by <b style={{ color: 'var(--ink)' }}>{r.by}</b></span>
              <span className="tm">{r.time}</span>
              <span className="right"><span className={`ds-bdg ${r.status}`}>{r.status}</span></span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
