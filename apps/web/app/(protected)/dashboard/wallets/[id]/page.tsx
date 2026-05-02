"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Badge from "@/components/dashboard/Badge";
import TransferTable from "@/components/dashboard/TransferTable";
import SpendGauge from "@/components/dashboard/SpendGauge";
import { WALLETS, TRANSFERS } from "@/components/dashboard/data";

const BLOCKLIST = [
  "9xQ8f3...rT4mK",
  "3nPw7v...hY2bL",
  "7kMr5s...dX9cN",
];

const POLICY_RULES = [
  { label: "MAX PER TRANSFER", value: "$500.00" },
  { label: "DAILY CAP", value: "$2,000.00" },
  { label: "ALLOWED TOKENS", value: "SOL, USDC" },
  { label: "REQUIRE APPROVAL ABOVE", value: "$100.00" },
  { label: "ALLOWED HOURS", value: "00:00 – 23:59 UTC" },
  { label: "BLOCKLIST", value: `${BLOCKLIST.length} addresses` },
];

const VERSIONS = [
  { v: "v3", ts: "2024-01-15 14:23", by: "you@acme.com", note: "Raised daily cap to $2,000" },
  { v: "v2", ts: "2024-01-10 09:11", by: "you@acme.com", note: "Added USDC to allowed tokens" },
  { v: "v1", ts: "2024-01-01 00:00", by: "you@acme.com", note: "Initial policy" },
];

type Tab = "overview" | "transfers" | "policy";

export default function WalletDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("overview");
  const [blocklist, setBlocklist] = useState(BLOCKLIST);
  const [newAddr, setNewAddr] = useState("");

  const wallet = WALLETS.find((w) => w.id === id) ?? WALLETS[0]!;
  const walletTransfers = TRANSFERS.filter((_, i) => i % 2 === 0).slice(0, 6);

  const addToBlocklist = () => {
    if (newAddr.trim()) {
      setBlocklist((b) => [...b, newAddr.trim()]);
      setNewAddr("");
    }
  };

  return (
    <div className="page">
      <div className="wallet-header">
        <div className="wallet-header-left">
          <div className="wallet-header-name">{wallet.name}</div>
          <div className="td-mono" style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            {wallet.key}
          </div>
        </div>
        <div className="wallet-header-right">
          <Badge status={wallet.status} />
          <button className="btn-sm btn-ghost">EDIT POLICY</button>
          <button className="btn-sm btn-danger">PAUSE WALLET</button>
        </div>
      </div>

      <div className="tab-row">
        {(["overview", "transfers", "policy"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`tab${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="two-col">
          <div>
            <SpendGauge spend={wallet.spend} cap={wallet.cap} />
            <div className="panel" style={{ marginTop: 16 }}>
              <div className="panel-header"><span>QUICK STATS</span></div>
              <div className="policy-grid">
                <div className="policy-item"><div className="policy-label">TRANSFERS</div><div className="policy-value">{wallet.transfers}</div></div>
                <div className="policy-item"><div className="policy-label">BLOCKED</div><div className="policy-value" style={{ color: "var(--blocked)" }}>{wallet.blocked}</div></div>
                <div className="policy-item"><div className="policy-label">POLICY</div><div className="policy-value">{wallet.policy}</div></div>
                <div className="policy-item"><div className="policy-label">RATE LIMIT</div><div className="policy-value">{wallet.rate}</div></div>
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-header"><span>RECENT ACTIVITY</span></div>
            <TransferTable rows={walletTransfers} />
          </div>
        </div>
      )}

      {tab === "transfers" && (
        <div className="panel">
          <div className="panel-header"><span>ALL TRANSFERS</span></div>
          <TransferTable rows={walletTransfers} />
        </div>
      )}

      {tab === "policy" && (
        <div className="two-col">
          <div>
            <div className="panel">
              <div className="panel-header"><span>POLICY RULES</span></div>
              <div className="policy-grid">
                {POLICY_RULES.map((r) => (
                  <div className="policy-item" key={r.label}>
                    <div className="policy-label">{r.label}</div>
                    <div className="policy-value">{r.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel" style={{ marginTop: 16 }}>
              <div className="panel-header"><span>BLOCKLIST</span></div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                  className="input-sm"
                  placeholder="Add address..."
                  value={newAddr}
                  onChange={(e) => setNewAddr(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addToBlocklist()}
                />
                <button className="btn-sm btn-accent" onClick={addToBlocklist}>ADD</button>
              </div>
              {blocklist.map((addr) => (
                <div className="blocklist-row" key={addr}>
                  <span className="td-mono">{addr}</span>
                  <button
                    className="btn-sm btn-ghost"
                    style={{ padding: "2px 8px", fontSize: 10 }}
                    onClick={() => setBlocklist((b) => b.filter((a) => a !== addr))}
                  >
                    REMOVE
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header"><span>VERSION HISTORY</span></div>
            {VERSIONS.map((ver) => (
              <div className="version-row" key={ver.v}>
                <div className="version-badge">{ver.v}</div>
                <div className="version-info">
                  <div className="version-note">{ver.note}</div>
                  <div className="version-meta">{ver.ts} · {ver.by}</div>
                </div>
                {ver.v !== "v3" && (
                  <button className="btn-sm btn-ghost" style={{ fontSize: 10 }}>RESTORE</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
