"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TransferTable from "./_components/TransferTable";
import { WALLETS, TRANSFERS } from "./_components/data";

function useCounter(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            setValue(Math.round(p * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { ref, value };
}

function MetricCard({ label, value, sub, accent }: { label: string; value: number; sub: string; accent?: boolean }) {
  const { ref, value: displayed } = useCounter(value);
  return (
    <div className="metric" ref={ref}>
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={accent ? { color: "var(--accent)" } : undefined}>
        {displayed.toLocaleString()}
      </div>
      <div className="metric-sub">{sub}</div>
    </div>
  );
}

export default function OverviewPage() {
  const totalSpend = WALLETS.reduce((s, w) => s + w.spend, 0);
  const totalCap = WALLETS.reduce((s, w) => s + w.cap, 0);
  const activeWallets = WALLETS.filter((w) => w.status === "active").length;
  const pendingApprovals = TRANSFERS.filter((t) => t.status === "pending").length;

  return (
    <div className="page">
      <div className="alert-bar">
        <span>⚠ {pendingApprovals} TRANSFERS PENDING APPROVAL</span>
        <Link href="/dashboard/approvals">
          <span className="alert-action">REVIEW NOW →</span>
        </Link>
      </div>

      <div className="metrics">
        <MetricCard label="ACTIVE WALLETS" value={activeWallets} sub={`of ${WALLETS.length} total`} />
        <MetricCard label="TODAY'S SPEND" value={Math.round(totalSpend)} sub={`$${totalCap.toFixed(0)} cap`} accent />
        <MetricCard label="TRANSFERS" value={TRANSFERS.length} sub="last 24 hours" />
        <MetricCard label="BLOCKED" value={TRANSFERS.filter((t) => t.status === "blocked").length} sub="policy violations" />
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-header">
            <span>RECENT TRANSFERS</span>
            <Link href="/dashboard/transfers">
              <span className="panel-link">VIEW ALL →</span>
            </Link>
          </div>
          <TransferTable rows={TRANSFERS.slice(0, 5)} />
        </div>

        <div className="panel">
          <div className="panel-header">
            <span>SPEND BY WALLET</span>
          </div>
          <div className="spend-bars">
            {WALLETS.map((w) => {
              const pct = Math.min((w.spend / w.cap) * 100, 100);
              const color =
                pct < 60 ? "var(--success)" : pct < 85 ? "var(--pending)" : "var(--blocked)";
              return (
                <div className="spend-bar-row" key={w.id}>
                  <div className="spend-bar-label">
                    <span className="spend-bar-name">{w.name}</span>
                    <span className="spend-bar-amount" style={{ color }}>
                      ${w.spend.toFixed(0)}
                      <span style={{ color: "var(--text-tertiary)", fontSize: 10 }}>
                        {" "}/ ${w.cap}
                      </span>
                    </span>
                  </div>
                  <div className="spend-bar-track">
                    <div
                      className="spend-bar-fill"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
