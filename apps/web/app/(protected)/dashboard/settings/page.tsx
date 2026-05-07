'use client';

import { useState } from 'react';
import Topbar from '@/components/dashboard/Topbar';
import Icon from '@/components/dashboard/Icon';

const TEAM = [
  { av: 'M', em: 'morgan@arc-labs.io',   role: 'Owner',     last: 'just now' },
  { av: 'P', em: 'priya@arc-labs.io',    role: 'Approver',  last: '14m ago' },
  { av: 'D', em: 'dev@arc-labs.io',      role: 'Developer', last: '2h ago' },
  { av: 'R', em: 'read-only@arc-labs.io', role: 'Viewer',   last: '3d ago' },
];

export default function SettingsPage() {
  const [showLive, setShowLive] = useState(false);
  const [showTest, setShowTest] = useState(false);

  const liveKey = showLive
    ? 'onl_sk_live_a4f1c29b8d6e3f7a2c5b1d8e9f0a2c4b'
    : 'onl_sk_live_••••••••••••••••••••••••••••••';
  const testKey = showTest
    ? 'onl_sk_test_3f7a2c5b1d8e9f0a2c4ba4f1c29b8d6e'
    : 'onl_sk_test_••••••••••••••••••••••••••••••';

  return (
    <>
      <Topbar title="Settings" pendingCount={2} hideCta />
      <div className="ds-content">
        <div className="ds-set-grid">
          <div>
            <div className="ds-set-card">
              <div className="h">API Keys <span className="desc">Server-side only · rotate every 90 days</span></div>
              <div className="ds-set-row">
                <span className="k">Live · prod</span>
                <span className="v">{liveKey}</span>
                <span className="sactions">
                  <button className="ds-btn ds-btn-ghost" onClick={() => setShowLive(!showLive)}>
                    <Icon name={showLive ? 'eye-off' : 'eye'} size={12} />{showLive ? 'HIDE' : 'SHOW'}
                  </button>
                  <button className="ds-btn ds-btn-ghost">REGEN</button>
                </span>
              </div>
              <div className="ds-set-row">
                <span className="k">Test · devnet</span>
                <span className="v dim">{testKey}</span>
                <span className="sactions">
                  <button className="ds-btn ds-btn-ghost" onClick={() => setShowTest(!showTest)}>
                    <Icon name={showTest ? 'eye-off' : 'eye'} size={12} />{showTest ? 'HIDE' : 'SHOW'}
                  </button>
                  <button className="ds-btn ds-btn-ghost">REGEN</button>
                </span>
              </div>
              <div className="ds-set-row">
                <span className="k">Last rotated</span>
                <span className="v dim">2026-04-12 · 25 days ago</span>
                <span />
              </div>
            </div>

            <div className="ds-set-card">
              <div className="h">Notification Channels <span className="desc">Where HITL approvals fire</span></div>
              <div className="ds-set-row">
                <span className="k">Telegram bot token</span>
                <input className="ds-input" defaultValue="6483912047:AAH-x9k2LpQ3rN8mTvW7yE1bC5dF6gH9iJ" />
                <span className="sactions"><span className="ds-bdg active" style={{ borderColor: 'var(--mint)' }}>connected</span></span>
              </div>
              <div className="ds-set-row">
                <span className="k">Telegram chat ID</span>
                <input className="ds-input" defaultValue="-1001284318431" />
                <span className="sactions"><button className="ds-btn ds-btn-ghost">TEST PING</button></span>
              </div>
              <div className="ds-set-row">
                <span className="k">Slack webhook</span>
                <input className="ds-input" defaultValue="https://hooks.slack.com/services/T01/B02/x9k2LpQ3rN8mTvW7yE1b" />
                <span className="sactions"><span className="ds-bdg active" style={{ borderColor: 'var(--mint)' }}>connected</span></span>
              </div>
              <div className="ds-set-row">
                <span className="k">Discord webhook</span>
                <input className="ds-input" placeholder="not configured" />
                <span className="sactions"><span className="ds-bdg rejected">disconnected</span></span>
              </div>
            </div>

            <div className="ds-set-card">
              <div className="h">Team Members <span className="desc">Approvers can sign HITL requests</span></div>
              {TEAM.map((t, i) => (
                <div className="ds-team-row" key={i}>
                  <div className="tnm">
                    <div className="av">{t.av}</div>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink)' }}>{t.em}</span>
                  </div>
                  <span style={{ color: 'var(--ink-dim)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{t.role}</span>
                  <span style={{ color: 'var(--ink-faint)', fontSize: 10, letterSpacing: '0.1em' }}>SEEN {t.last.toUpperCase()}</span>
                  <button className="ds-btn ds-btn-ghost" style={{ padding: '6px 10px', fontSize: 10 }}>MENU</button>
                </div>
              ))}
              <div style={{ marginTop: 14 }}>
                <button className="ds-btn ds-btn-mint">+ INVITE MEMBER</button>
              </div>
            </div>
          </div>

          <div>
            <div className="ds-plan-card">
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.22em', color: 'var(--mint)', textTransform: 'uppercase' }}>Current plan</div>
              <div className="pl">PRO</div>
              <div className="desc">5 seats · unlimited wallets · priority HITL routing</div>
              <div className="stats">
                <div className="st"><div className="lbl">Used wallets</div><div className="vl">7 / ∞</div></div>
                <div className="st"><div className="lbl">HITL/mo</div><div className="vl">428</div></div>
                <div className="st"><div className="lbl">API calls</div><div className="vl">9.5k</div></div>
                <div className="st"><div className="lbl">Renews</div><div className="vl" style={{ fontSize: 18 }}>JUN 12</div></div>
              </div>
              <button className="ds-btn ds-btn-mint" style={{ width: '100%', justifyContent: 'center' }}>UPGRADE TO ENTERPRISE</button>
            </div>

            <div className="ds-set-card" style={{ marginTop: 16 }}>
              <div className="h">Quick links</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'var(--font-ui)', fontSize: 12 }}>
                {[
                  '→ Audit log',
                  '→ Webhooks · 3 active',
                  '→ Anchor program · 7gXq…4mJp',
                  '→ Billing · invoices',
                  '→ Delete workspace',
                ].map(lnk => (
                  <li key={lnk}><a href="#" style={{ color: 'var(--ink-dim)' }}>{lnk}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
