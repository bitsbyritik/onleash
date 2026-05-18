'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/dashboard/Topbar';

type DbStatus = 'success' | 'blocked' | 'pending_approval' | 'rejected' | 'expired';
type FilterKey = 'all' | DbStatus;

interface Transfer {
  id: string;
  createdAt: string;
  walletName: string;
  toAddress: string;
  amount: string;
  token: string;
  status: DbStatus;
  memo: string | null;
  signature: string | null;
  violationRule: string | null;
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',              label: 'All' },
  { key: 'success',          label: 'Success' },
  { key: 'pending_approval', label: 'Pending' },
  { key: 'blocked',          label: 'Blocked' },
  { key: 'rejected',         label: 'Rejected' },
];

const TOKEN_DECIMALS: Record<string, number> = { SOL: 9, USDC: 6, BONK: 5, JUP: 6 };

function formatAmount(amount: string, token: string): string {
  const decimals = TOKEN_DECIMALS[token] ?? 9;
  const n = Number(BigInt(amount)) / 10 ** decimals;
  return n.toLocaleString('en-US', {
    minimumFractionDigits: token === 'SOL' ? 4 : 2,
    maximumFractionDigits: token === 'SOL' ? 4 : 2,
  });
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 10) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatViolation(rule: string | null): string {
  if (!rule) return '—';
  return rule.replace(/_/g, ' ');
}

// Map DB status → badge CSS class
function badgeClass(status: DbStatus): string {
  if (status === 'pending_approval') return 'pending';
  if (status === 'expired') return 'rejected';
  return status;
}

// Badge label
function badgeLabel(status: DbStatus): string {
  if (status === 'pending_approval') return 'pending';
  return status;
}

// Which DB statuses each filter tab covers
function matchesFilter(status: DbStatus, filter: FilterKey): boolean {
  if (filter === 'all') return true;
  if (filter === 'rejected') return status === 'rejected' || status === 'expired';
  return status === filter;
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [network, setNetwork] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/dashboard/transfers');
      if (!res.ok) throw new Error('Failed to load transfers');
      const data = await res.json() as { transfers: Transfer[]; network: string };
      setTransfers(data.transfers ?? []);
      setNetwork(data.network ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Re-fetch when the workspace network changes (fired by settings page)
  useEffect(() => {
    const handler = () => void load();
    window.addEventListener('onleash:network-change', handler);
    return () => window.removeEventListener('onleash:network-change', handler);
  }, [load]);

  const shown = transfers.filter((t) => matchesFilter(t.status, filter));

  const counts: Record<FilterKey, number> = {
    all:              transfers.length,
    success:          transfers.filter((t) => t.status === 'success').length,
    pending_approval: transfers.filter((t) => t.status === 'pending_approval').length,
    blocked:          transfers.filter((t) => t.status === 'blocked').length,
    rejected:         transfers.filter((t) => t.status === 'rejected' || t.status === 'expired').length,
    expired:          transfers.filter((t) => t.status === 'expired').length,
  };

  return (
    <>
      <Topbar title="Transfers" />
      <div className="ds-content">
        <div className="ds-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`ds-filt${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label} <span className="ct">{counts[f.key]}</span>
            </button>
          ))}
        </div>

        <div className="ds-panel">
          <div className="ds-panel-h">
            <b>{shown.length} transfer{shown.length !== 1 ? 's' : ''}</b>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {network && (
                <span className={`ds-bdg ${network}`} style={{ fontSize: 9 }}>{network.toUpperCase()}</span>
              )}
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--ink-faint)' }}>
                filter · {filter.replace('_', ' ').toUpperCase()}
              </span>
              <button
                onClick={() => void load()}
                style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', fontFamily: 'var(--font-ui)', fontSize: 10, cursor: 'pointer', letterSpacing: '0.1em' }}
              >
                ↻ REFRESH
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: '16px 20px', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--danger)', borderBottom: '1px solid var(--line)' }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ padding: '48px 0', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink-dim)' }}>
              Loading…
            </div>
          ) : shown.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink-faint)' }}>
              {transfers.length === 0 ? 'No transfers yet — activity appears here once agents start sending.' : `No ${filter.replace('_', ' ')} transfers.`}
            </div>
          ) : (
            <table className="ds-tt">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Wallet</th>
                  <th>To Address</th>
                  <th>Reason</th>
                  <th className="right">Amount</th>
                  <th>Token</th>
                  <th className="right">Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((t) => {
                  const isNeg = t.status === 'blocked';
                  return (
                    <tr key={t.id}>
                      <td className="time">{relativeTime(t.createdAt)}</td>
                      <td className="wal">{t.walletName}</td>
                      <td className="addr" title={t.toAddress}>
                        {t.memo ? `${t.memo} · ` : ''}{shortAddr(t.toAddress)}
                      </td>
                      <td className={`reason${isNeg ? ' neg' : ''}`}>
                        {t.violationRule ? formatViolation(t.violationRule) : (t.status === 'pending_approval' ? 'awaiting approval' : '—')}
                      </td>
                      <td className={`am${isNeg ? ' neg' : ''}`}>
                        {formatAmount(t.amount, t.token)}
                      </td>
                      <td style={{ color: 'var(--ink-dim)', fontSize: 11 }}>{t.token}</td>
                      <td className="right">
                        <span className={`ds-bdg ${badgeClass(t.status)}`}>{badgeLabel(t.status)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
