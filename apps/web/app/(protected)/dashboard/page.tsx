'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Topbar from '@/components/dashboard/Topbar';
import Sparkline from '@/components/dashboard/Sparkline';
import Icon from '@/components/dashboard/Icon';
import { TRANSFERS, WALLETS, type Transfer } from './data';

function CountUp({
  to, suffix = '', prefix = '', mint = false, dan = false, dur = 1200,
}: {
  to: number; suffix?: string; prefix?: string; mint?: boolean; dan?: boolean; dur?: number;
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
  const cls = mint ? 'val mint' : dan ? 'val dan' : 'val';
  const display = Number.isInteger(to) ? Math.round(v).toLocaleString() : v.toFixed(2);
  return <div className={cls}>{prefix}{display}{suffix}</div>;
}

export default function OverviewPage() {
  const [feed, setFeed] = useState<Transfer[]>(TRANSFERS.slice(0, 6));
  const pendingCount = 2;

  useEffect(() => {
    const id = setInterval(() => {
      setFeed(prev => {
        const base = TRANSFERS[Math.floor(Math.random() * TRANSFERS.length)]!;
        const fresh: Transfer = {
          ...base,
          id: 'live-' + Date.now(),
          time: 'just now',
          _new: true,
        };
        return [fresh, ...prev.slice(0, 5)];
      });
    }, 7000);
    return () => clearInterval(id);
  }, []);

  const spendByWallet = WALLETS.filter(w => w.spent > 0).slice(0, 5).map(w => ({
    name: w.name, val: w.spent, cap: w.cap,
  }));

  return (
    <>
      <Topbar title="Overview" pendingCount={pendingCount} />
      <div className="ds-content">
        <div className="ds-alert">
          <span className="ico"><Icon name="warn" /></span>
          <span className="msg"><b>2 approvals pending</b> · 1 expires in 0:28 · vega-prod requesting 60 USDC above threshold</span>
          <Link className="cta" href="/dashboard/approvals">Review now →</Link>
        </div>

        <div className="ds-metric-grid">
          <div className="ds-metric">
            <div className="lbl"><span className="dot" /> Active wallets</div>
            <CountUp to={6} />
            <div className="sub"><span>of 7 deployed</span><span className="delta">+1 this week</span></div>
            <div style={{ position: 'absolute', right: 14, bottom: 14 }}>
              <Sparkline values={[4,4,5,5,5,6,6,6]} />
            </div>
          </div>
          <div className="ds-metric">
            <div className="lbl"><span className="dot" /> Today&apos;s spend</div>
            <CountUp to={5779.40} prefix="$" mint />
            <div className="sub"><span>across 6 wallets</span><span className="delta">+12% vs avg</span></div>
            <div style={{ position: 'absolute', right: 14, bottom: 14 }}>
              <Sparkline values={[2.1,2.4,3.0,2.8,3.4,4.1,5.2,5.8]} />
            </div>
          </div>
          <div className="ds-metric">
            <div className="lbl"><span className="dot" /> Transfers</div>
            <CountUp to={9504} />
            <div className="sub"><span>last 24h</span><span className="delta">+342</span></div>
            <div style={{ position: 'absolute', right: 14, bottom: 14 }}>
              <Sparkline values={[6,7,5,8,9,8,10,9]} />
            </div>
          </div>
          <div className="ds-metric">
            <div className="lbl dan"><span className="dot" /> Blocked</div>
            <CountUp to={280} dan />
            <div className="sub"><span>by policy</span><span className="delta dan">+18 today</span></div>
            <div style={{ position: 'absolute', right: 14, bottom: 14 }}>
              <Sparkline values={[1,2,1,3,2,4,3,5]} color="#ff3355" />
            </div>
          </div>
        </div>

        <div className="ds-two-col">
          <div className="ds-panel">
            <div className="ds-panel-h">
              <b>Recent transfers</b>
              <Link className="more" href="/dashboard/transfers">View all →</Link>
            </div>
            <div className="ds-panel-body">
              <table className="ds-tt">
                <thead>
                  <tr>
                    <th>Time</th><th>Wallet</th><th>To</th>
                    <th className="right">Amount</th><th className="right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {feed.map(t => (
                    <tr key={t.id} className={t._new ? 'live-in' : ''}>
                      <td className="time">{t.time}</td>
                      <td className="wal">{t.wallet}</td>
                      <td className="addr">
                        {t.to.lbl}{' '}
                        <span style={{ color: 'var(--ink-faint)' }}>· {t.to.to.slice(0, 10)}…</span>
                      </td>
                      <td className={'am' + (t.status === 'blocked' ? ' neg' : '')}>
                        {t.amount.toFixed(2)} {t.token}
                      </td>
                      <td className="right"><span className={`ds-bdg ${t.status}`}>{t.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ds-panel">
            <div className="ds-panel-h">
              <b>Spend by wallet · today</b><span>$ / cap</span>
            </div>
            <div className="ds-spendbars">
              {spendByWallet.map((w, i) => {
                const pct = Math.min(100, (w.val / w.cap) * 100);
                const cls = pct >= 85 ? 'red' : pct >= 60 ? 'amber' : '';
                return (
                  <div className="ds-sb-row" key={i}>
                    <span className="nm">{w.name}</span>
                    <span className="tr"><span className={`fl ${cls}`} style={{ width: pct + '%' }} /></span>
                    <span className={`vl ${cls}`}>${w.val.toFixed(0)}/{w.cap}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
