'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Topbar from '@/components/dashboard/Topbar';
import { WALLETS, TRANSFERS } from '../../data';

type Tab = 'overview' | 'transfers' | 'policy';

export default function WalletDetailPage({ params }: { params: { id: string } }) {
  const [tab, setTab] = useState<Tab>('overview');
  const w = WALLETS.find(x => x.id === params.id);
  if (!w) return notFound();

  const transfers = TRANSFERS.filter(t => t.wallet === w.name);
  const pct = (w.spent / w.cap) * 100;

  const breadcrumb = (
    <>
      <Link href="/dashboard/wallets" style={{ color: 'var(--ink-faint)' }}>Wallets</Link>
      {' '}<b>/ {w.name}</b>
    </>
  );

  return (
    <>
      <Topbar title="Wallets" breadcrumb={breadcrumb} pendingCount={2} />
      <div className="ds-content">
        <div className="ds-wd-head">
          <div>
            <h1 className="ttl">{w.name}</h1>
            <div className="pk">PK <b>{w.pk}</b></div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`ds-bdg ${w.status}`}>{w.status}</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.12em' }}>
                POLICY · {w.policy.toUpperCase()}
              </span>
              {w.created && (
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.12em' }}>
                  CREATED · {w.created}
                </span>
              )}
            </div>
          </div>
          <div className="actions">
            <button className="ds-btn ds-btn-ghost">EDIT POLICY</button>
            <button className="ds-btn ds-btn-warn">PAUSE WALLET</button>
          </div>
        </div>

        <div className="ds-tabs">
          {(['overview','transfers','policy'] as Tab[]).map(k => (
            <button
              key={k}
              className={`ds-tab${tab === k ? ' active' : ''}`}
              onClick={() => setTab(k)}
            >
              {k.charAt(0).toUpperCase() + k.slice(1)}
              {k === 'transfers' && <span className="ct">{transfers.length}</span>}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            <div className="ds-gauge-big">
              <div className="row">
                <span>Today&apos;s spend · resets 00:00 UTC</span>
                <span style={{ color: 'var(--warn)' }}>87% · approaching cap</span>
              </div>
              <div className="vrow">
                <div className="left">${w.spent.toFixed(2)}</div>
                <div className="right">of ${w.cap}.00 · ${(w.cap - w.spent).toFixed(2)} remaining</div>
              </div>
              <div className="tr"><div className="fl" style={{ width: pct + '%' }} /></div>
              <div className="markers">
                <span className="m" style={{ left: '60%' }}>60%</span>
                <span className="m" style={{ left: '85%', color: 'var(--warn)' }}>85% AMBER</span>
              </div>
            </div>

            <div className="ds-section-h">
              <h2>Recent activity</h2>
              <span className="lbl">{transfers.length} transfers · last 24h</span>
            </div>
            <div className="ds-panel">
              <table className="ds-tt">
                <thead>
                  <tr><th>Time</th><th>To</th><th className="right">Amount</th><th className="right">Status</th></tr>
                </thead>
                <tbody>
                  {transfers.map(t => (
                    <tr key={t.id}>
                      <td className="time">{t.time}</td>
                      <td className="addr">{t.to.lbl} · {t.to.to.slice(0, 12)}…</td>
                      <td className={`am${t.status === 'blocked' ? ' neg' : ''}`}>{t.amount.toFixed(2)} {t.token}</td>
                      <td className="right"><span className={`ds-bdg ${t.status}`}>{t.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'transfers' && (
          <div className="ds-panel">
            <table className="ds-tt">
              <thead>
                <tr><th>Time</th><th>To</th><th>Reason</th><th className="right">Amount</th><th className="right">Status</th></tr>
              </thead>
              <tbody>
                {transfers.map(t => (
                  <tr key={t.id}>
                    <td className="time">{t.time}</td>
                    <td className="addr">{t.to.lbl} · {t.to.to.slice(0, 14)}…</td>
                    <td style={{ color: 'var(--ink-faint)', fontSize: 11 }}>{t.reason || '—'}</td>
                    <td className={`am${t.status === 'blocked' ? ' neg' : ''}`}>{t.amount.toFixed(2)} {t.token}</td>
                    <td className="right"><span className={`ds-bdg ${t.status}`}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'policy' && w.rules && (
          <>
            <div className="ds-rules">
              <div className="ds-rule">
                <div className="lbl">Max single transfer</div>
                <div className="val mint">${w.rules.maxTx}</div>
                <div className="sub">USDC equivalent · per call</div>
              </div>
              <div className="ds-rule">
                <div className="lbl">Daily cap</div>
                <div className="val mint">${w.rules.dailyCap}</div>
                <div className="sub">resets 00:00 UTC</div>
              </div>
              <div className="ds-rule">
                <div className="lbl">HITL threshold</div>
                <div className="val warn">${w.rules.hitlAt}</div>
                <div className="sub">routed to @OnLeashBot · 5:00 window</div>
              </div>
              <div className="ds-rule">
                <div className="lbl">Allowed tokens</div>
                <div className="chips">
                  {w.rules.tokens.map(t => <span key={t} className="chip mint">{t}</span>)}
                  <span className="chip">+ 4 more</span>
                </div>
                <div className="sub">7 of 1.2M whitelisted</div>
              </div>
              <div className="ds-rule">
                <div className="lbl">Allowed hours</div>
                <div className="val" style={{ fontSize: 24 }}>00:00–23:59</div>
                <div className="sub">UTC · always-on</div>
              </div>
              <div className="ds-rule">
                <div className="lbl">Blocklist</div>
                <div className="chips">
                  <span className="chip dan">4vLi…drainer</span>
                  <span className="chip dan">pumpFunVault…</span>
                  <span className="chip">+ 12</span>
                </div>
                <div className="sub">14 addresses · global + local</div>
              </div>
            </div>

            <div className="ds-section-h"><h2>Version history</h2><span className="lbl">3 versions</span></div>
            <div className="ds-panel">
              {[
                { v: 'v1.4.2', d: '2026-04-28', n: 'morgan tightened HITL to $50 (was $100)' },
                { v: 'v1.4.1', d: '2026-04-12', n: 'added pumpFunVault to blocklist' },
                { v: 'v1.4.0', d: '2026-03-30', n: 'initial deploy · pda 7gXq…4mJp' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 110px 1fr 80px', gap: 16, padding: '14px 18px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-ui)', fontSize: 12 }}>
                  <span style={{ color: 'var(--mint)' }}>{r.v}</span>
                  <span style={{ color: 'var(--ink-faint)' }}>{r.d}</span>
                  <span style={{ color: 'var(--ink-dim)' }}>{r.n}</span>
                  <span style={{ color: 'var(--ink-faint)', fontSize: 10, textAlign: 'right' }}>{i === 0 ? 'CURRENT' : 'ROLLBACK'}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
