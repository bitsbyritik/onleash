"use client";

import { useState, useEffect } from "react";

type TabType = "success" | "blocked" | "pending";

function useDateStr() {
  const [str, setStr] = useState("");
  useEffect(() => {
    setStr(
      new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, []);
  return str;
}

function TxCard({ tab, seconds, onApprove, onReject }: {
  tab: TabType;
  seconds: number;
  onApprove: () => void;
  onReject: () => void;
}) {
  const dateStr = useDateStr();
  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className={`tx-card tx-card-${tab}`}>
      <div className="tx-eyebrow">
        <span className="tx-label">TRANSFER</span>
        {tab === "success" && (
          <span className="tx-badge tx-badge-success">✓ CONFIRMED</span>
        )}
        {tab === "blocked" && (
          <span className="tx-badge tx-badge-blocked">✗ BLOCKED</span>
        )}
        {tab === "pending" && (
          <span className="tx-badge tx-badge-pending">⏳ AWAITING APPROVAL</span>
        )}
      </div>

      <div className="tx-route">
        <span style={{ color: "var(--text-tertiary)" }}>7xKr...9dQp</span>
        <span className="tx-arrow">→</span>
        <span>Bz3q...FgNm</span>
      </div>

      <div className="tx-amount">
        $3.00<span className="tx-token">USDC</span>
      </div>
      <div className="tx-meta">{dateStr} · memo: API credits</div>

      <div className="tx-divider" />

      {tab === "success" && (
        <>
          <div className="tx-detail-label">SIGNATURE</div>
          <div className="tx-sig">
            <span>3mNp8kLwxK2p9mNd7qRs...</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ cursor: "pointer", opacity: 0.5 }}>
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </div>
        </>
      )}

      {tab === "blocked" && (
        <>
          <div className="tx-detail-label">REASON</div>
          <div className="tx-reason">Daily cap exceeded ($8.40 / $10.00)</div>
          <div className="progress-track">
            <div className="progress-fill" />
          </div>
        </>
      )}

      {tab === "pending" && (
        <>
          <div className="tx-detail-label">EXPIRES IN</div>
          <div
            className="countdown"
            style={{ color: seconds < 60 ? "var(--blocked)" : "var(--pending)" }}
          >
            {fmt(seconds)}
          </div>
          <div className="approval-btns">
            <button className="btn-approve" onClick={onApprove}>
              APPROVE
            </button>
            <button className="btn-reject" onClick={onReject}>
              REJECT
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function Demo() {
  const [tab, setTab] = useState<TabType>("success");
  const [rejected, setRejected] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [seconds, setSeconds] = useState(272);

  useEffect(() => {
    if (tab !== "pending") return;
    setSeconds(272);
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [tab]);

  const handleApprove = () => {
    setTransitioning(true);
    setTimeout(() => {
      setTab("success");
      setTransitioning(false);
    }, 300);
  };

  const handleReject = () => {
    setRejected(true);
    setTimeout(() => setRejected(false), 3000);
  };

  const switchTab = (t: TabType) => {
    setTab(t);
    setRejected(false);
  };

  return (
    <section className="demo-section">
      <div className="container">
        <div className="section-eyebrow">LIVE DEMO</div>
        <div className="section-head">
          <div>SEE IT IN ACTION</div>
        </div>
        <div className="demo-tabs">
          {(
            [
              ["success", "SUCCESS"],
              ["blocked", "BLOCKED"],
              ["pending", "PENDING APPROVAL"],
            ] as [TabType, string][]
          ).map(([k, l]) => (
            <button
              key={k}
              className={`demo-tab${tab === k ? " demo-tab-active" : ""}`}
              onClick={() => switchTab(k)}
            >
              {l}
            </button>
          ))}
        </div>

        <div style={{ opacity: transitioning ? 0 : 1, transition: "opacity 0.3s" }}>
          {rejected ? (
            <div className="rejected-msg">
              Transfer rejected. The transaction was not submitted. Your policy log has been updated.
            </div>
          ) : (
            <TxCard
              tab={tab}
              seconds={seconds}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
        </div>
      </div>
    </section>
  );
}
