'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/dashboard/Topbar';

interface WalletPolicy {
  dailyCap: string;
  perVendorCap: string;
  approvalThreshold: string;
}

interface Wallet {
  id: string;
  name: string;
  publicKey: string;
  network: string;
  isActive: boolean;
  createdAt: string;
  policy: WalletPolicy | null;
}

const SOL = 1_000_000_000n;

function CreateWalletModal({ onClose, onCreated }: { onClose: () => void; onCreated: (walletId: string) => void }) {
  const [form, setForm] = useState({
    name: '',
    network: 'devnet',
    dailyCap: '500000000',
    perVendorCap: '100000000',
    approvalThreshold: '200000000',
  });
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/dashboard/me')
      .then(r => r.json())
      .then(d => setWalletAddress(d.user?.walletAddress ?? ''));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/dashboard/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, publicKey: walletAddress }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to create wallet'); return; }
      onCreated(data.walletId);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  const field = (label: string, key: keyof typeof form, placeholder?: string) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-dim)', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <input
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        required
        style={{ width: '100%', background: 'var(--void-3)', border: '1px solid var(--line-strong)', color: 'var(--ink)', fontFamily: 'var(--font-code)', fontSize: 12, padding: '9px 12px', outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--void-2)', border: '1px solid var(--line-strong)', padding: 32, width: '100%', maxWidth: 480 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--mint)', textTransform: 'uppercase', marginBottom: 8 }}>New Agent Wallet</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, textTransform: 'uppercase', color: 'var(--ink)', marginBottom: 24 }}>Create Wallet</div>

        <div style={{ border: '1px solid var(--line-strong)', background: 'var(--void-3)', padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 7, height: 7, background: 'var(--mint)', borderRadius: '50%', boxShadow: '0 0 8px var(--mint)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--ink-dim)', letterSpacing: '0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {walletAddress || 'Loading wallet…'}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {field('Wallet Name', 'name', 'e.g. Trading Bot Alpha')}

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-dim)', textTransform: 'uppercase', marginBottom: 6 }}>Network</div>
            <select
              value={form.network}
              onChange={e => setForm(p => ({ ...p, network: e.target.value }))}
              style={{ width: '100%', background: 'var(--void-3)', border: '1px solid var(--line-strong)', color: 'var(--ink)', fontFamily: 'var(--font-code)', fontSize: 12, padding: '9px 12px', outline: 'none' }}
            >
              <option value="devnet">devnet</option>
              <option value="mainnet">mainnet</option>
            </select>
          </div>

          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--mint)', textTransform: 'uppercase', marginBottom: 12, marginTop: 8 }}>Policy (lamports)</div>
          {field('Daily Cap', 'dailyCap', '500000000 = 0.5 SOL')}
          {field('Per-Vendor Cap', 'perVendorCap', '100000000 = 0.1 SOL')}
          {field('Approval Threshold', 'approvalThreshold', '200000000 = 0.2 SOL')}

          {error && (
            <div style={{ border: '1px solid var(--danger)', background: 'var(--danger-soft)', padding: '9px 12px', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--danger)', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="submit" disabled={loading}
              style={{ flex: 1, background: 'var(--mint)', color: 'var(--void)', border: 'none', fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 20px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Creating…' : '→ Create Wallet'}
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

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/wallets');
      const data = await res.json();
      setWallets(data.wallets ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleCreated(walletId: string) {
    setShowCreate(false);
    setCreatedId(walletId);
    load();
  }

  return (
    <>
      <Topbar title="Wallets" pendingCount={0} />
      {showCreate && <CreateWalletModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}

      <div className="ds-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8, marginBottom: 22, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--mint)', textTransform: 'uppercase' }}>Fleet</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 48px)', margin: '8px 0 0', letterSpacing: '0.005em', textTransform: 'uppercase', lineHeight: 1, color: 'var(--ink)' }}>
              {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
            </h2>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ background: 'var(--mint)', color: 'var(--void)', border: 'none', fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '10px 20px', cursor: 'pointer' }}>
            + New Wallet
          </button>
        </div>

        {createdId && (
          <div style={{ border: '1px solid var(--mint)', background: 'var(--mint-soft)', padding: '12px 16px', marginBottom: 20, fontFamily: 'var(--font-code)', fontSize: 12, color: 'var(--mint)' }}>
            ✓ Wallet created — ID: <b>{createdId}</b>
            <button onClick={() => { navigator.clipboard.writeText(createdId); }} style={{ marginLeft: 12, background: 'none', border: '1px solid var(--mint)', color: 'var(--mint)', fontFamily: 'var(--font-ui)', fontSize: 10, padding: '3px 8px', cursor: 'pointer', letterSpacing: '0.1em' }}>COPY</button>
          </div>
        )}

        {loading ? (
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink-dim)', padding: '40px 0', textAlign: 'center' }}>Loading…</div>
        ) : wallets.length === 0 ? (
          <div style={{ border: '1px dashed var(--line-strong)', padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, textTransform: 'uppercase', color: 'var(--ink-faint)', marginBottom: 12 }}>No wallets yet</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink-dim)', marginBottom: 20 }}>Create your first agent wallet to get started.</div>
            <button onClick={() => setShowCreate(true)} style={{ background: 'var(--mint)', color: 'var(--void)', border: 'none', fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '12px 24px', cursor: 'pointer' }}>
              + Create First Wallet
            </button>
          </div>
        ) : (
          <div className="ds-wal-list">
            {wallets.map(w => (
              <div key={w.id} className="ds-wal-row" style={{ cursor: 'default' }}>
                <div className="nm">
                  <span className="n">{w.name}</span>
                  <span className="pk">{w.publicKey.slice(0, 18)}…{w.publicKey.slice(-6)}</span>
                </div>
                <span className="ds-wal-badges">
                  <span className={`ds-bdg ${w.isActive ? 'active' : 'blocked'}`}>{w.isActive ? 'active' : 'inactive'}</span>
                  <span className="ds-bdg active">{w.network}</span>
                </span>
                {w.policy && (
                  <div className="pol">
                    <span className="cap">{(BigInt(w.policy.dailyCap) * 1000n / SOL).toString()}m SOL/day</span>
                    <span className="pn">threshold: {(BigInt(w.policy.approvalThreshold) * 1000n / SOL).toString()}m SOL</span>
                  </div>
                )}
                <div style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--ink-faint)', marginTop: 4 }}>
                  ID: {w.id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
