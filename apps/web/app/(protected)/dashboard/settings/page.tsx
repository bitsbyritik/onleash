"use client";

import { useState } from "react";

const API_KEYS = [
  {
    id: "1",
    env: "LIVE",
    name: "Production",
    key: "onl_live_sk_••••••••••••••••3f9a",
    created: "Jan 1, 2024",
    lastUsed: "2 hours ago",
  },
  {
    id: "2",
    env: "TEST",
    name: "Staging",
    key: "onl_test_sk_••••••••••••••••7b2c",
    created: "Jan 10, 2024",
    lastUsed: "5 days ago",
  },
];

const NOTIFICATIONS = [
  {
    key: "blocked",
    label: "Transfer Blocked",
    desc: "When a transfer is stopped by policy",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
      </svg>
    ),
  },
  {
    key: "approval",
    label: "Approval Required",
    desc: "When a transfer needs your review",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  {
    key: "cap_warning",
    label: "Cap Warning",
    desc: "Alert at 80% of daily spend limit",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    key: "wallet_pause",
    label: "Wallet Paused",
    desc: "When any wallet status changes",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
      </svg>
    ),
  },
];

const CHANNELS = [
  {
    key: "email",
    label: "Email",
    value: "you@acme.com",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
  {
    key: "slack",
    label: "Slack",
    value: "#onleash-alerts",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/>
        <path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/>
        <path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/>
        <path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/>
        <path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
        <path d="M10 9.5C10 8.67 9.33 8 8.5 8H3.5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"/>
        <path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"/>
      </svg>
    ),
  },
];

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

export default function SettingsPage() {
  const [keys, setKeys] = useState(API_KEYS);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    blocked: true, approval: true, cap_warning: true, wallet_pause: false,
  });
  const [channels, setChannels] = useState<Record<string, boolean>>({
    email: true, slack: true,
  });
  const [teamName, setTeamName] = useState("Acme Labs");
  const [timezone, setTimezone] = useState("UTC");
  const [copied, setCopied] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const revokeKey = (id: string) => setKeys((k) => k.filter((key) => key.id !== id));

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page settings-page">
      {/* ── Page header ─── */}
      <div className="settings-page-header">
        <div>
          <div className="page-title">SETTINGS</div>
          <div className="page-sub">Manage your team, keys, and preferences</div>
        </div>
      </div>

      <div className="settings-layout">

        {/* ── LEFT COLUMN ─────────────────────────────────── */}
        <div className="settings-col-main">

          {/* GENERAL */}
          <div className="stg-card">
            <div className="stg-card-head">
              <span className="stg-card-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              <span className="stg-card-title">GENERAL</span>
            </div>

            <div className="stg-field">
              <div className="stg-field-left">
                <div className="stg-field-label">TEAM NAME</div>
                <div className="stg-field-desc">Displayed across your dashboard and invoices</div>
              </div>
              <input
                className="stg-input"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <div className="stg-field">
              <div className="stg-field-left">
                <div className="stg-field-label">TIMEZONE</div>
                <div className="stg-field-desc">Used for transfer timestamps and report windows</div>
              </div>
              <select
                className="stg-input stg-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Kolkata">Asia/Kolkata</option>
              </select>
            </div>

            <div className="stg-card-footer">
              <button
                className={`stg-save-btn${saved ? " saved" : ""}`}
                onClick={handleSave}
              >
                {saved ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    SAVED
                  </>
                ) : "SAVE CHANGES"}
              </button>
            </div>
          </div>

          {/* API KEYS */}
          <div className="stg-card">
            <div className="stg-card-head">
              <span className="stg-card-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
              </span>
              <span className="stg-card-title">API KEYS</span>
              <button className="stg-add-btn">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                NEW KEY
              </button>
            </div>

            {keys.length === 0 ? (
              <div className="stg-empty">No API keys — create one to get started</div>
            ) : (
              keys.map((k) => (
                <div className="stg-key-row" key={k.id}>
                  <div className="stg-key-env-badge" data-env={k.env}>{k.env}</div>
                  <div className="stg-key-info">
                    <div className="stg-key-name">{k.name}</div>
                    <div className="stg-key-value">{k.key}</div>
                    <div className="stg-key-meta">Created {k.created} · Last used {k.lastUsed}</div>
                  </div>
                  <div className="stg-key-actions">
                    <button
                      className="stg-icon-btn"
                      title="Copy key"
                      onClick={() => handleCopy(k.id, k.key)}
                    >
                      {copied === k.id ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : <CopyIcon />}
                    </button>
                    <button
                      className="stg-revoke-btn"
                      onClick={() => revokeKey(k.id)}
                    >
                      REVOKE
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* NOTIFICATIONS */}
          <div className="stg-card">
            <div className="stg-card-head">
              <span className="stg-card-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </span>
              <span className="stg-card-title">NOTIFICATIONS</span>
            </div>

            <div className="stg-notif-sub">DELIVERY CHANNELS</div>
            {CHANNELS.map((ch) => (
              <div className="stg-field stg-field-sm" key={ch.key}>
                <div className="stg-field-left stg-field-row-inner">
                  <span className="stg-notif-icon">{ch.icon}</span>
                  <div>
                    <div className="stg-field-label">{ch.label}</div>
                    <div className="stg-field-desc">{ch.value}</div>
                  </div>
                </div>
                <button
                  className={`stg-toggle${channels[ch.key] ? " on" : ""}`}
                  onClick={() => setChannels((c) => ({ ...c, [ch.key]: !c[ch.key] }))}
                />
              </div>
            ))}

            <div className="stg-notif-divider" />

            <div className="stg-notif-sub">ALERT EVENTS</div>
            {NOTIFICATIONS.map((n) => (
              <div className="stg-field stg-field-sm" key={n.key}>
                <div className="stg-field-left stg-field-row-inner">
                  <span className="stg-notif-icon">{n.icon}</span>
                  <div>
                    <div className="stg-field-label">{n.label}</div>
                    <div className="stg-field-desc">{n.desc}</div>
                  </div>
                </div>
                <button
                  className={`stg-toggle${notifications[n.key] ? " on" : ""}`}
                  onClick={() => setNotifications((p) => ({ ...p, [n.key]: !p[n.key] }))}
                />
              </div>
            ))}
          </div>

          {/* DANGER ZONE */}
          <div className="stg-card stg-danger-card">
            <div className="stg-card-head">
              <span className="stg-card-icon stg-danger-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </span>
              <span className="stg-card-title stg-danger-title">DANGER ZONE</span>
            </div>

            <div className="stg-danger-row">
              <div>
                <div className="stg-danger-label">PAUSE ALL WALLETS</div>
                <div className="stg-danger-desc">Immediately halt all outgoing agent transfers</div>
              </div>
              <button className="stg-danger-btn">PAUSE ALL</button>
            </div>

            <div className="stg-danger-row stg-danger-row-last">
              <div>
                <div className="stg-danger-label">DELETE TEAM</div>
                <div className="stg-danger-desc">Permanently remove this team and all data</div>
              </div>
              <button className="stg-danger-btn stg-danger-btn-strong">DELETE TEAM</button>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────── */}
        <div className="settings-col-side">

          {/* PLAN */}
          <div className="stg-card stg-plan-card">
            <div className="stg-plan-badge-row">
              <span className="stg-plan-badge">PRO</span>
              <span className="stg-plan-status-dot" />
              <span className="stg-plan-status-text">ACTIVE</span>
            </div>
            <div className="stg-plan-price">$49<span className="stg-plan-period">/mo</span></div>
            <div className="stg-plan-renew">Renews February 1, 2026</div>

            <div className="stg-plan-divider" />

            <div className="stg-plan-features">
              {[
                "Unlimited wallets",
                "Custom policy rules",
                "Human approval flows",
                "Slack & email alerts",
                "API access",
              ].map((f) => (
                <div className="stg-plan-feature" key={f}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {f}
                </div>
              ))}
            </div>

            <div className="stg-plan-divider" />

            <div className="stg-plan-usage">
              <div className="stg-plan-usage-row">
                <span>API calls this month</span>
                <span>8,241 / 50,000</span>
              </div>
              <div className="stg-plan-bar-track">
                <div className="stg-plan-bar-fill" style={{ width: "16.5%" }} />
              </div>
            </div>

            <button className="stg-upgrade-btn">UPGRADE TO ENTERPRISE →</button>
          </div>

          {/* SECURITY */}
          <div className="stg-card">
            <div className="stg-card-head">
              <span className="stg-card-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </span>
              <span className="stg-card-title">SECURITY</span>
            </div>
            <div className="stg-security-row">
              <div className="stg-security-label">2FA</div>
              <span className="stg-security-badge stg-security-on">ENABLED</span>
            </div>
            <div className="stg-security-row">
              <div className="stg-security-label">LAST LOGIN</div>
              <span className="stg-security-val">Today, 09:14 UTC</span>
            </div>
            <div className="stg-security-row">
              <div className="stg-security-label">IP</div>
              <span className="stg-security-val">103.xx.xx.14</span>
            </div>
            <div className="stg-security-row stg-security-row-last">
              <div className="stg-security-label">SESSIONS</div>
              <button className="stg-revoke-btn">REVOKE ALL</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
