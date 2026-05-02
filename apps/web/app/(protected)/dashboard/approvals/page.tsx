"use client";

import { useState } from "react";
import CountdownTimer from "@/components/dashboard/CountdownTimer";
import Badge from "@/components/dashboard/Badge";
import { APPROVALS } from "@/components/dashboard/data";

export default function ApprovalsPage() {
  const [resolved, setResolved] = useState<Record<string, "approved" | "rejected">>({});

  const pending = APPROVALS.filter((a) => !resolved[a.id]);
  const done = APPROVALS.filter((a) => resolved[a.id]);

  const resolve = (id: string, decision: "approved" | "rejected") =>
    setResolved((r) => ({ ...r, [id]: decision }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">APPROVALS</div>
          <div className="page-sub">{pending.length} pending · {done.length} resolved</div>
        </div>
      </div>

      <div className="approvals-list">
        {pending.length === 0 && (
          <div className="panel">
            <div className="empty">ALL CAUGHT UP — NO PENDING APPROVALS</div>
          </div>
        )}

        {pending.map((a) => (
          <div className="approval-card" key={a.id}>
            <div className="approval-header">
              <div className="approval-wallet">{a.wallet}</div>
              <CountdownTimer initSeconds={a.expires} />
            </div>
            <div className="approval-body">
              <div className="approval-field">
                <div className="approval-label">TO</div>
                <div className="td-mono">{a.to}</div>
              </div>
              <div className="approval-field">
                <div className="approval-label">AMOUNT</div>
                <div className="approval-amount">
                  {a.amount} <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>{a.token}</span>
                </div>
              </div>
              <div className="approval-field">
                <div className="approval-label">MEMO</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{a.memo}</div>
              </div>
              <div className="approval-field">
                <div className="approval-label">REASON FLAGGED</div>
                <div style={{ fontSize: 12, color: "var(--pending)" }}>{a.reason}</div>
              </div>
            </div>
            <div className="approval-footer">
              <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                Requested {a.created}
              </div>
              <div className="approval-actions">
                <button
                  className="btn-sm btn-danger"
                  onClick={() => resolve(a.id, "rejected")}
                >
                  REJECT
                </button>
                <button
                  className="btn-sm btn-accent"
                  onClick={() => resolve(a.id, "approved")}
                >
                  APPROVE
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {done.length > 0 && (
        <div className="panel" style={{ marginTop: 24 }}>
          <div className="panel-header"><span>RESOLVED</span></div>
          <table>
            <thead>
              <tr>
                <th>WALLET</th>
                <th>AMOUNT</th>
                <th>MEMO</th>
                <th>DECISION</th>
              </tr>
            </thead>
            <tbody>
              {done.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontSize: 12 }}>{a.wallet}</td>
                  <td>
                    <span className="td-amount">{a.amount}</span>{" "}
                    <span style={{ color: "var(--text-tertiary)", fontSize: 10 }}>{a.token}</span>
                  </td>
                  <td style={{ fontSize: 11, color: "var(--text-secondary)" }}>{a.memo}</td>
                  <td><Badge status={resolved[a.id]!} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
