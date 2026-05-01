"use client";

import { useState } from "react";

const API_KEYS = [
  { name: "PRODUCTION", key: "onl_live_sk_••••••••••••••••3f9a", created: "2024-01-01", lastUsed: "2 hours ago" },
  { name: "STAGING", key: "onl_test_sk_••••••••••••••••7b2c", created: "2024-01-10", lastUsed: "5 days ago" },
];

const NOTIFICATION_CHANNELS = [
  { label: "EMAIL ALERTS", desc: "you@acme.com", key: "email" },
  { label: "SLACK WEBHOOK", desc: "#onleash-alerts", key: "slack" },
  { label: "APPROVAL REQUIRED EMAILS", desc: "Approval request notifications", key: "approvalEmail" },
];

export default function SettingsPage() {
  const [keys, setKeys] = useState(API_KEYS);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    email: true,
    slack: true,
    approvalEmail: true,
  });
  const [teamName, setTeamName] = useState("Acme Labs");
  const [timezone, setTimezone] = useState("UTC");

  const revokeKey = (name: string) =>
    setKeys((k) => k.filter((key) => key.name !== name));

  const toggleNotification = (key: string) =>
    setNotifications((n) => ({ ...n, [key]: !n[key] }));

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">SETTINGS</div>
      </div>

      <div className="settings-section">
        <div className="settings-title">TEAM</div>
        <div className="settings-row">
          <div className="settings-label">TEAM NAME</div>
          <input
            className="input-sm"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            style={{ width: 240 }}
          />
        </div>
        <div className="settings-row">
          <div className="settings-label">TIMEZONE</div>
          <select
            className="input-sm"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            style={{ width: 240 }}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="America/Los_Angeles">America/Los_Angeles</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Kolkata">Asia/Kolkata</option>
          </select>
        </div>
        <div className="settings-row">
          <div className="settings-label">PLAN</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="plan-badge">PRO</span>
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>$49 / month · renews Feb 1</span>
            <button className="btn-sm btn-ghost">MANAGE →</button>
          </div>
        </div>
        <button className="btn-sm btn-accent" style={{ marginTop: 8 }}>SAVE CHANGES</button>
      </div>

      <div className="settings-section">
        <div className="settings-title">API KEYS</div>
        {keys.map((k) => (
          <div className="api-key-row" key={k.name}>
            <div className="api-key-info">
              <div className="api-key-name">{k.name}</div>
              <div className="td-mono" style={{ fontSize: 12, color: "var(--text-secondary)" }}>{k.key}</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                Created {k.created} · Last used {k.lastUsed}
              </div>
            </div>
            <button
              className="btn-sm btn-danger"
              onClick={() => revokeKey(k.name)}
            >
              REVOKE
            </button>
          </div>
        ))}
        {keys.length === 0 && (
          <div className="empty">NO API KEYS — CREATE ONE BELOW</div>
        )}
        <button className="btn-sm btn-accent" style={{ marginTop: 12 }}>+ CREATE NEW KEY</button>
      </div>

      <div className="settings-section">
        <div className="settings-title">NOTIFICATIONS</div>
        {NOTIFICATION_CHANNELS.map((ch) => (
          <div className="settings-row" key={ch.key}>
            <div>
              <div className="settings-label">{ch.label}</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{ch.desc}</div>
            </div>
            <button
              className={`toggle${notifications[ch.key] ? " on" : ""}`}
              onClick={() => toggleNotification(ch.key)}
            />
          </div>
        ))}
      </div>

      <div className="settings-section danger-zone">
        <div className="settings-title" style={{ color: "var(--blocked)" }}>DANGER ZONE</div>
        <div className="settings-row">
          <div>
            <div className="settings-label">PAUSE ALL WALLETS</div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
              Immediately halt all agent transfers
            </div>
          </div>
          <button className="btn-sm btn-danger">PAUSE ALL</button>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-label">DELETE TEAM</div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
              Permanently delete this team and all associated data
            </div>
          </div>
          <button className="btn-sm btn-danger">DELETE TEAM</button>
        </div>
      </div>
    </div>
  );
}
