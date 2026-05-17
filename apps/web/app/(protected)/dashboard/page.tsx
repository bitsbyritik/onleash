'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Topbar from '@/components/dashboard/Topbar';
import Sparkline from '@/components/dashboard/Sparkline';
import Icon from '@/components/dashboard/Icon';

// ── types ─────────────────────────────────────────────────────────

interface RecentTransfer {
  id: string;
  createdAt: string;
  walletName: string;
  toAddress: string;
  amount: string;
  token: string;
  status: string;
  memo: string | null;
}

interface WalletSpend {
  walletId: string;
  walletName: string;
  todaySpentLamports: string;
  dailyCapLamports: string;
}

interface Stats {
  activeWallets: number;
  totalWallets: number;
  totalTransfers: number;
  blockedTransfers: number;
  pendingApprovals: number;
  todaySpentLamports: string;
}

interface OverviewData {
  network: string;
  stats: Stats;
  recentTransfers: RecentTransfer[];
  walletSpend: WalletSpend[];
}

// ── helpers ───────────────────────────────────────────────────────

const TOKEN_DECIMALS: Record<string, number> = { SOL: 9, USDC: 6, BONK: 5, JUP: 6 };

function lamportsToDisplay(lamports: string, token: string): string {
  const decimals = TOKEN_DECIMALS[token] ?? 9;
  const n = Number(BigInt(lamports)) / 10 ** decimals;
  return n.toLocaleString('en-US', { minimumFractionDigits: token === 'SOL' ? 4 : 2, maximumFractionDigits: token === 'SOL' ? 4 : 2 });
}

function lamportsToSol(lamports: string): number {
  return Number(BigInt(lamports)) / 1e9;
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
  return `${addr.slice(0, 8)}…${addr.slice(-4)}`;
}

function badgeClass(status: string): string {
  if (status === 'pending_approval') return 'pending';
  if (status === 'expired') return 'rejected';
  return status;
}

// ── CountUp ───────────────────────────────────────────────────────

function CountUp({ to, decimals = 0, prefix = '', suffix = '', mint = false, dan = false, dur = 1200 }: {
  to: number; decimals?: number; prefix?: string; suffix?: string;
  mint?: boolean; dan?: boolean; dur?: number;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf: number;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setV(to * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, dur]);
  const display = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString();
  return (
    <div className={mint ? 'val mint' : dan ? 'val dan' : 'val'}>
      {prefix}{display}{suffix}
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────

const EMPTY_STATS: Stats = {
  activeWallets: 0, totalWallets: 0, totalTransfers: 0,
  blockedTransfers: 0, pendingApprovals: 0, todaySpentLamports: '0',
};

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/overview');
      if (res.ok) setData(await res.json() as OverviewData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const handler = () => void load();
    window.addEventListener('onleash:network-change', handler);
    window.addEventListener('onleash:workspace-change', handler);
    return () => {
      window.removeEventListener('onleash:network-change', handler);
      window.removeEventListener('onleash:workspace-change', handler);
    };
  }, [load]);

  const stats = data?.stats ?? EMPTY_STATS;
  const todaySol = lamportsToSol(stats.todaySpentLamports);
  const network = data?.network ?? '';

  return (
    <>
      <Topbar title="Overview" pendingCount={stats.pendingApprovals} />
      <div className="ds-content">

        {/* Pending approvals alert — only shown when real pending exist */}
        {stats.pendingApprovals > 0 && (
          <div className="ds-alert">
            <span className="ico"><Icon name="warn" /></span>
            <span className="msg">
              <b>{stats.pendingApprovals} approval{stats.pendingApprovals !== 1 ? 's' : ''} pending</b>
              {' '}· transfers awaiting your review
            </span>
            <Link className="cta" href="/approvals">Review now →</Link>
          </div>
        )}

        {/* Metric cards */}
        <div className="ds-metric-grid">
          <div className="ds-metric">
            <div className="lbl"><span className="dot" /> Active wallets</div>
            <CountUp to={stats.activeWallets} />
            <div className="sub">
              <span>of {stats.totalWallets} on {network || '…'}</span>
            </div>
            <div style={{ position: 'absolute', right: 14, bottom: 14 }}>
              <Sparkline values={[0, stats.activeWallets || 1]} />
            </div>
          </div>

          <div className="ds-metric">
            <div className="lbl"><span className="dot" /> Today&apos;s spend</div>
            <CountUp to={todaySol} decimals={4} mint />
            <div className="sub">
              <span>SOL · {stats.totalWallets} wallet{stats.totalWallets !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ position: 'absolute', right: 14, bottom: 14 }}>
              <Sparkline values={[0, todaySol || 1]} />
            </div>
          </div>

          <div className="ds-metric">
            <div className="lbl"><span className="dot" /> Transfers</div>
            <CountUp to={stats.totalTransfers} />
            <div className="sub">
              <span>all time · {network || '…'}</span>
            </div>
            <div style={{ position: 'absolute', right: 14, bottom: 14 }}>
              <Sparkline values={[0, stats.totalTransfers || 1]} />
            </div>
          </div>

          <div className="ds-metric">
            <div className="lbl dan"><span className="dot" /> Blocked</div>
            <CountUp to={stats.blockedTransfers} dan />
            <div className="sub">
              <span>by policy</span>
              {stats.totalTransfers > 0 && (
                <span className="delta dan">
                  {((stats.blockedTransfers / stats.totalTransfers) * 100).toFixed(1)}% block rate
                </span>
              )}
            </div>
            <div style={{ position: 'absolute', right: 14, bottom: 14 }}>
              <Sparkline values={[0, stats.blockedTransfers || 1]} color="#ff3355" />
            </div>
          </div>
        </div>

        <div className="ds-two-col">
          {/* Recent transfers */}
          <div className="ds-panel">
            <div className="ds-panel-h">
              <b>Recent transfers</b>
              <Link className="more" href="/transfers">View all →</Link>
            </div>
            <div className="ds-panel-body">
              {loading ? (
                <div style={{ padding: '32px 0', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink-dim)' }}>Loading…</div>
              ) : !data?.recentTransfers.length ? (
                <div style={{ padding: '32px 0', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink-faint)' }}>
                  No transfers yet on {network || 'this network'}.
                </div>
              ) : (
                <table className="ds-tt">
                  <thead>
                    <tr>
                      <th>Time</th><th>Wallet</th><th>To</th>
                      <th className="right">Amount</th><th className="right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentTransfers.map((t) => (
                      <tr key={t.id}>
                        <td className="time">{relativeTime(t.createdAt)}</td>
                        <td className="wal">{t.walletName}</td>
                        <td className="addr" title={t.toAddress}>
                          {t.memo ? `${t.memo} · ` : ''}{shortAddr(t.toAddress)}
                        </td>
                        <td className={`am${t.status === 'blocked' ? ' neg' : ''}`}>
                          {lamportsToDisplay(t.amount, t.token)} {t.token}
                        </td>
                        <td className="right">
                          <span className={`ds-bdg ${badgeClass(t.status)}`}>{badgeClass(t.status)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Spend by wallet */}
          <div className="ds-panel">
            <div className="ds-panel-h">
              <b>Spend by wallet · today</b>
              <span>SOL / daily cap</span>
            </div>
            {loading ? (
              <div style={{ padding: '32px 0', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink-dim)' }}>Loading…</div>
            ) : !data?.walletSpend.length ? (
              <div style={{ padding: '32px 20px', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink-faint)' }}>
                No wallets with policies on {network || 'this network'}.
              </div>
            ) : (
              <div className="ds-spendbars">
                {data.walletSpend.map((w) => {
                  const spent = lamportsToSol(w.todaySpentLamports);
                  const cap = lamportsToSol(w.dailyCapLamports);
                  const pct = cap > 0 ? Math.min(100, (spent / cap) * 100) : 0;
                  const cls = pct >= 85 ? 'red' : pct >= 60 ? 'amber' : '';
                  return (
                    <div className="ds-sb-row" key={w.walletId}>
                      <span className="nm">{w.walletName}</span>
                      <span className="tr">
                        <span className={`fl ${cls}`} style={{ width: `${pct}%` }} />
                      </span>
                      <span className={`vl ${cls}`}>
                        {spent.toFixed(3)}/{cap.toFixed(3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
