'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import Topbar from '@/components/dashboard/Topbar';

interface WalletDetail {
  id: string;
  name: string;
  publicKey: string;
  network: string;
  isActive: boolean;
  createdAt: string;
  policy: {
    id: string;
    dailyCap: string;
    perVendorCap: string;
    approvalThreshold: string;
    blocklist: string[];
    allowlist: string[];
    allowlistMode: boolean;
  } | null;
}

function EditPolicyModal({ wallet, onClose, onSaved }: { wallet: WalletDetail; onClose: () => void; onSaved: () => void }) {
  const p = wallet.policy;
  const [form, setForm] = useState({
    dailyCap: p?.dailyCap ?? '500000000',
    perVendorCap: p?.perVendorCap ?? '100000000',
    approvalThreshold: p?.approvalThreshold ?? '200000000',
    blocklist: p?.blocklist.join('\n') ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/dashboard/wallets/${wallet.id}/policy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyCap: form.dailyCap,
          perVendorCap: form.perVendorCap,
          approvalThreshold: form.approvalThreshold,
          blocklist: form.blocklist.split('\n').map(s => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed'); return; }
      onSaved();
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  }

  const field = (label: string, key: keyof typeof form, hint?: string) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-dim)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      {hint && <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--ink-faint)', marginBottom: 6 }}>{hint}</div>}
      <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} required
        style={{ width: '100%', background: 'var(--void-3)', border: '1px solid var(--line-strong)', color: 'var(--ink)', fontFamily: 'var(--font-code)', fontSize: 12, padding: '9px 12px', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--void-2)', border: '1px solid var(--line-strong)', padding: 32, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--mint)', textTransform: 'uppercase', marginBottom: 8 }}>Policy</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, textTransform: 'uppercase', color: 'var(--ink)', marginBottom: 24 }}>Edit Policy</div>
        <form onSubmit={handleSubmit}>
          {field('Daily Cap (lamports)', 'dailyCap', '500000000 = 0.5 SOL')}
          {field('Per-Vendor Cap (lamports)', 'perVendorCap', '100000000 = 0.1 SOL')}
          {field('Approval Threshold (lamports)', 'approvalThreshold', '200000000 = 0.2 SOL')}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-dim)', textTransform: 'uppercase', marginBottom: 4 }}>Blocklist</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--ink-faint)', marginBottom: 6 }}>One address per line</div>
            <textarea value={form.blocklist} onChange={e => setForm(p => ({ ...p, blocklist: e.target.value }))} rows={3}
              style={{ width: '100%', background: 'var(--void-3)', border: '1px solid var(--line-strong)', color: 'var(--ink)', fontFamily: 'var(--font-code)', fontSize: 11, padding: '9px 12px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>
          {error && <div style={{ border: '1px solid var(--danger)', background: 'var(--danger-soft)', padding: '9px 12px', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--danger)', marginBottom: 16 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={loading}
              style={{ flex: 1, background: 'var(--mint)', color: 'var(--void)', border: 'none', fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 20px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Saving…' : '→ Save Policy'}
            </button>
            <button type="button" onClick={onClose}
              style={{ background: 'none', color: 'var(--ink-dim)', border: '1px solid var(--line-strong)', fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 20px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WalletDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [wallet, setWallet] = useState<WalletDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/wallets/${id}`);
      if (!res.ok) { setWallet(null); return; }
      const data = await res.json();
      setWallet(data.wallet ?? null);
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const breadcrumb = (
    <><Link href="/dashboard/wallets" style={{ color: 'var(--ink-faint)' }}>Wallets</Link> <b>/ {wallet?.name ?? '…'}</b></>
  );

  if (loading) return (
    <>
      <Topbar title="Wallets" breadcrumb={breadcrumb} pendingCount={0} />
      <div className="ds-content" style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink-dim)', padding: '40px 0' }}>Loading…</div>
    </>
  );

  if (!wallet) return (
    <>
      <Topbar title="Wallets" breadcrumb={breadcrumb} pendingCount={0} />
      <div className="ds-content" style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--danger)', padding: '40px 0' }}>Wallet not found.</div>
    </>
  );

  const p = wallet.policy;
  const sol = (v: string) => (Number(BigInt(v)) / 1e9).toFixed(4);

  return (
    <>
      <Topbar title="Wallets" breadcrumb={breadcrumb} pendingCount={0} />
      {showEdit && <EditPolicyModal wallet={wallet} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); load(); }} />}

      <div className="ds-content">
        <div className="ds-wd-head">
          <div>
            <h1 className="ttl">{wallet.name}</h1>
            <div className="pk">PK <b>{wallet.publicKey}</b></div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`ds-bdg ${wallet.isActive ? 'active' : 'blocked'}`}>{wallet.isActive ? 'active' : 'inactive'}</span>
              <span className="ds-bdg active">{wallet.network}</span>
            </div>
          </div>
          <div className="actions">
            <button className="ds-btn ds-btn-ghost" onClick={() => setShowEdit(true)}>EDIT POLICY</button>
          </div>
        </div>

        {p ? (
          <div className="ds-rules" style={{ marginTop: 24 }}>
            <div className="ds-rule">
              <div className="lbl">Daily Cap</div>
              <div className="val mint">{sol(p.dailyCap)} SOL</div>
              <div className="sub">{p.dailyCap} lamports · resets daily</div>
            </div>
            <div className="ds-rule">
              <div className="lbl">Per-Vendor Cap</div>
              <div className="val mint">{sol(p.perVendorCap)} SOL</div>
              <div className="sub">{p.perVendorCap} lamports · per address per day</div>
            </div>
            <div className="ds-rule">
              <div className="lbl">Approval Threshold</div>
              <div className="val warn">{sol(p.approvalThreshold)} SOL</div>
              <div className="sub">{p.approvalThreshold} lamports · triggers HITL</div>
            </div>
            <div className="ds-rule">
              <div className="lbl">Blocklist</div>
              <div className="val">{p.blocklist.length}</div>
              <div className="sub">{p.blocklist.length > 0 ? p.blocklist.map(a => `${a.slice(0,6)}…`).join(', ') : 'No blocked addresses'}</div>
            </div>
          </div>
        ) : (
          <div style={{ border: '1px dashed var(--line-strong)', padding: 32, textAlign: 'center', marginTop: 24 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink-dim)', marginBottom: 16 }}>No policy set yet.</div>
            <button onClick={() => setShowEdit(true)} className="ds-btn ds-btn-mint">+ Set Policy</button>
          </div>
        )}

        <div style={{ marginTop: 24, fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--ink-faint)', border: '1px solid var(--line)', padding: '10px 14px' }}>
          Wallet ID: <b style={{ color: 'var(--ink-dim)' }}>{wallet.id}</b>
          <button onClick={() => navigator.clipboard.writeText(wallet.id)}
            style={{ marginLeft: 12, background: 'none', border: '1px solid var(--line-strong)', color: 'var(--mint)', fontFamily: 'var(--font-ui)', fontSize: 10, padding: '3px 8px', cursor: 'pointer', letterSpacing: '0.1em' }}>COPY</button>
        </div>
      </div>
    </>
  );
}
