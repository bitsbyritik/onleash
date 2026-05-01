"use client";

import Link from "next/link";
import Badge from "../_components/Badge";
import { WALLETS } from "../_components/data";

export default function WalletsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">AGENT WALLETS</div>
          <div className="page-sub">{WALLETS.length} wallets · {WALLETS.filter((w) => w.status === "active").length} active</div>
        </div>
        <button className="btn-sm btn-accent">+ NEW WALLET</button>
      </div>

      <div className="wallet-list">
        {WALLETS.map((w) => {
          const pct = Math.min((w.spend / w.cap) * 100, 100);
          const color = pct < 60 ? "var(--success)" : pct < 85 ? "var(--pending)" : "var(--blocked)";
          return (
            <Link key={w.id} href={`/dashboard/wallets/${w.id}`}>
              <div className="wallet-row-item">
                <div className="wallet-row-top">
                  <div className="wallet-row-left">
                    <div className="wallet-row-name">{w.name}</div>
                    <div className="wallet-row-key td-mono">{w.key}</div>
                  </div>
                  <div className="wallet-row-right">
                    <Badge status={w.status} />
                    <div className="wallet-row-stats">
                      <span>{w.transfers} txns</span>
                      <span style={{ color: "var(--blocked)" }}>{w.blocked} blocked</span>
                    </div>
                  </div>
                </div>
                <div className="wallet-row-gauge">
                  <div className="gauge-track" style={{ marginTop: 8 }}>
                    <div className="gauge-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <div className="gauge-meta">
                    <span style={{ color }}>
                      ${w.spend.toFixed(0)} spent
                    </span>
                    <span>${w.cap} cap · {w.rate} / policy: {w.policy}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
