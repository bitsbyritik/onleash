'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/dashboard/Topbar';
import AddWalletModal from '@/components/dashboard/AddWalletModal';

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

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/wallets');
      const data = await res.json() as { wallets?: Wallet[] };
      setWallets(data.wallets ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <>
      <Topbar title="Wallets" />
      {showModal && (
        <AddWalletModal
          onClose={() => setShowModal(false)}
          onSuccess={() => void load()}
        />
      )}

      <div className="ds-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8, marginBottom: 22, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--mint)', textTransform: 'uppercase' }}>Fleet</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 48px)', margin: '8px 0 0', letterSpacing: '0.005em', textTransform: 'uppercase', lineHeight: 1, color: 'var(--ink)' }}>
              {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
            </h2>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: 'var(--mint)', color: 'var(--void)', border: 'none', fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '10px 20px', cursor: 'pointer' }}
          >
            + New Wallet
          </button>
        </div>

        {loading ? (
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink-dim)', padding: '40px 0', textAlign: 'center' }}>Loading…</div>
        ) : wallets.length === 0 ? (
          <div style={{ border: '1px dashed var(--line-strong)', padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, textTransform: 'uppercase', color: 'var(--ink-faint)', marginBottom: 12 }}>No wallets yet</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink-dim)', marginBottom: 20 }}>Register your first agent wallet to get started.</div>
            <button
              onClick={() => setShowModal(true)}
              style={{ background: 'var(--mint)', color: 'var(--void)', border: 'none', fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '12px 24px', cursor: 'pointer' }}
            >
              + Register First Wallet
            </button>
          </div>
        ) : (
          <div className="ds-wal-list">
            {wallets.map((w) => (
              <div key={w.id} className="ds-wal-row" style={{ cursor: 'default' }}>
                <div className="nm">
                  <span className="n">{w.name}</span>
                  <span className="pk">{w.publicKey.slice(0, 18)}…{w.publicKey.slice(-6)}</span>
                </div>
                <span className="ds-wal-badges">
                  <span className={`ds-bdg ${w.isActive ? 'active' : 'blocked'}`}>{w.isActive ? 'active' : 'inactive'}</span>
                  <span className={`ds-bdg ${w.network}`}>{w.network}</span>
                </span>
                {w.policy && (
                  <div className="pol">
                    <span className="cap">{(Number(BigInt(w.policy.dailyCap)) / 1e9).toFixed(3)} SOL/day</span>
                    <span className="pn">threshold: {(Number(BigInt(w.policy.approvalThreshold)) / 1e9).toFixed(3)} SOL</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <span style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--ink-faint)' }}>
                    {w.id}
                  </span>
                  <button
                    onClick={() => { void navigator.clipboard.writeText(w.id); }}
                    style={{ background: 'none', border: '1px solid var(--line-strong)', color: 'var(--ink-dim)', fontFamily: 'var(--font-ui)', fontSize: 10, padding: '2px 8px', cursor: 'pointer', letterSpacing: '0.1em' }}
                  >
                    COPY ID
                  </button>
                  <a
                    href={`/wallets/${w.id}`}
                    style={{ background: 'none', border: '1px solid var(--mint)', color: 'var(--mint)', fontFamily: 'var(--font-ui)', fontSize: 10, padding: '2px 8px', cursor: 'pointer', letterSpacing: '0.1em', textDecoration: 'none' }}
                  >
                    EDIT POLICY →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
