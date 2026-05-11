'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/dashboard/Topbar';

interface ApprovalItem {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expiresAt: string;
  createdAt: string;
  resolvedAt: string | null;
  transfer: { id: string; amount: string; token: string; toAddress: string; memo: string | null };
  wallet: { id: string; name: string };
}

function countdown(expiresAt: string) {
  const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  const m = Math.floor(diff / 60);
  const s = String(diff % 60).padStart(2, '0');
  return { diff, label: `${m}:${s}` };
}

function ApprovalCard({ a, onResolved }: { a: ApprovalItem; onResolved: () => void }) {
  const [t, setT] = useState(() => countdown(a.expiresAt));
  const [loading, setLoading] = useState<'approved' | 'rejected' | null>(null);

  useEffect(() => {
    if (a.status !== 'pending') return;
    const id = setInterval(() => setT(countdown(a.expiresAt)), 1000);
    return () => clearInterval(id);
  }, [a.expiresAt, a.status]);

  async function resolve(action: 'approved' | 'rejected') {
    setLoading(action);
    try {
      await fetch(`/api/dashboard/approvals/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      onResolved();
    } finally {
      setLoading(null);
    }
  }

  const lamports = BigInt(a.transfer.amount);
  const sol = Number(lamports) / 1e9;
  const shortAddr = `${a.transfer.toAddress.slice(0, 6)}…${a.transfer.toAddress.slice(-4)}`;

  if (a.status !== 'pending') {
    const color = a.status === 'approved' ? 'var(--mint)' : 'var(--danger)';
    return (
      <div className="ds-appr-card" style={{ borderColor: color, background: a.status === 'approved' ? 'var(--mint-soft)' : 'var(--danger-soft)', opacity: 0.8 }}>
        <div className="head">
          <div>
            <div className="nm" style={{ color }}>{a.status.toUpperCase()}</div>
            <div className="req">{a.wallet.name} · {sol.toFixed(4)} {a.transfer.token}</div>
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink-dim)' }}>
          {a.resolvedAt ? new Date(a.resolvedAt).toLocaleTimeString() : ''}
        </div>
      </div>
    );
  }

  return (
    <div className={`ds-appr-card${t.diff < 60 ? ' urgent' : ''}`}>
      <div className="head">
        <div>
          <div className="nm">{a.wallet.name}</div>
          <div className="req">{new Date(a.createdAt).toLocaleTimeString()}</div>
        </div>
        <div className="timer">
          <span className="pulse" />EXPIRES {t.label}
        </div>
      </div>
      <div className="agrid">
        <div className="k">Amount</div>
        <div className="v amount">{sol.toFixed(4)} {a.transfer.token}</div>
        <div className="k">To</div>
        <div className="v">{shortAddr}</div>
        {a.transfer.memo && <><div className="k">Memo</div><div className="v dim">&quot;{a.transfer.memo}&quot;</div></>}
        <div className="k">Flagged</div>
        <div className="v warn">Above approval threshold</div>
      </div>
      <div className="aactions">
        <button
          className="ds-btn ds-btn-mint"
          onClick={() => resolve('approved')}
          disabled={!!loading}
        >
          {loading === 'approved' ? '…' : '✓ APPROVE'}
        </button>
        <button
          className="ds-btn ds-btn-danger"
          onClick={() => resolve('rejected')}
          disabled={!!loading}
        >
          {loading === 'rejected' ? '…' : '✕ REJECT'}
        </button>
      </div>
    </div>
  );
}

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/approvals');
      const data = await res.json();
      setItems(data.approvals ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [load]);

  const pending = items.filter(a => a.status === 'pending');
  const resolved = items.filter(a => a.status !== 'pending');

  return (
    <>
      <Topbar title="Approvals" pendingCount={pending.length} hideCta />
      <div className="ds-content">
        <div className="ds-section-h" style={{ marginTop: 8 }}>
          <h2>Pending · {pending.length}</h2>
          <span className="lbl">human-in-the-loop · 5:00 window</span>
        </div>

        {loading ? (
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink-dim)', padding: '32px 0' }}>Loading…</div>
        ) : pending.length === 0 ? (
          <div style={{ border: '1px dashed var(--line-strong)', padding: '32px', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink-dim)' }}>
            No pending approvals
          </div>
        ) : (
          <div className="ds-appr-grid">
            {pending.map(a => <ApprovalCard key={a.id} a={a} onResolved={load} />)}
          </div>
        )}

        {resolved.length > 0 && (
          <>
            <div className="ds-section-h" style={{ marginTop: 40 }}>
              <h2>Resolved · today</h2>
              <span className="lbl">{resolved.length} approvals</span>
            </div>
            <div className="ds-panel">
              {resolved.map(r => (
                <div className="ds-appr-resolved-row" key={r.id}>
                  <span className="nm">{r.wallet.name}</span>
                  <span className="am">{(Number(BigInt(r.transfer.amount)) / 1e9).toFixed(4)} {r.transfer.token}</span>
                  <span className="tm">{r.resolvedAt ? new Date(r.resolvedAt).toLocaleTimeString() : ''}</span>
                  <span className="right"><span className={`ds-bdg ${r.status}`}>{r.status}</span></span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
