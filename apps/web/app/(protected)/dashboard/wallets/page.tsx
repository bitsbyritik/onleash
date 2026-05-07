'use client';

import { useState } from 'react';
import Link from 'next/link';
import Topbar from '@/components/dashboard/Topbar';
import { WALLETS, type WalletStatus } from '../data';

const FILTERS: { key: WalletStatus | 'all'; label: string }[] = [
  { key: 'all',     label: 'ALL' },
  { key: 'active',  label: 'ACTIVE' },
  { key: 'paused',  label: 'PAUSED' },
  { key: 'blocked', label: 'BLOCKED' },
];

export default function WalletsPage() {
  const [filter, setFilter] = useState<WalletStatus | 'all'>('all');

  const counts = {
    all:     WALLETS.length,
    active:  WALLETS.filter(w => w.status === 'active').length,
    paused:  WALLETS.filter(w => w.status === 'paused').length,
    blocked: WALLETS.filter(w => w.status === 'blocked').length,
  };

  const shown = filter === 'all' ? WALLETS : WALLETS.filter(w => w.status === filter);

  return (
    <>
      <Topbar title="Wallets" pendingCount={2} />
      <div className="ds-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8, marginBottom: 22, gap: 16, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--mint)', textTransform: 'uppercase' }}>Fleet</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 48px)', margin: '8px 0 0', letterSpacing: '0.005em', textTransform: 'uppercase', lineHeight: 1, wordBreak: 'break-word', color: 'var(--ink)' }}>
              {WALLETS.length} wallets <span style={{ color: 'var(--ink-faint)' }}>· 1 quarantined</span>
            </h2>
          </div>
        </div>

        <div className="ds-filters">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`ds-filt${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label} <span className="ct">{counts[f.key]}</span>
            </button>
          ))}
        </div>

        <div className="ds-wal-list">
          {shown.map(w => {
            const pct = Math.min(100, (w.spent / w.cap) * 100);
            const cls = pct >= 85 ? 'red' : pct >= 60 ? 'amber' : '';
            const role = w.hierarchy?.role ?? 'parent';
            return (
              <Link key={w.id} href={`/dashboard/wallets/${w.id}`} className="ds-wal-row">
                <div className="nm">
                  <span className="n">{w.name}</span>
                  <span className="pk">{w.pk.slice(0, 18)}…{w.pk.slice(-6)}</span>
                </div>
                <span className="ds-wal-badges">
                  <span className={`ds-bdg ${w.status}`}>{w.status}</span>
                  <span className={`ds-bdg ${role === 'child' ? 'pending' : 'active'}`}>{role}</span>
                </span>
                <div className="ct">
                  <span><b>{w.transfers.toLocaleString()}</b> transfers</span>
                  <span className={w.blocked > 0 ? 'blk' : ''}>{w.blocked} blocked</span>
                </div>
                <div className="gauge">
                  <div className="lb"><b>${w.spent.toFixed(0)}</b><span>{Math.round(pct)}% used</span></div>
                  <div className="tr"><div className={`fl ${cls}`} style={{ width: pct + '%' }} /></div>
                </div>
                <div className="pol">
                  <span className="cap">${w.cap}/day</span>
                  <span className="pn">{w.policy}</span>
                </div>
                <span className="arr">→</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
