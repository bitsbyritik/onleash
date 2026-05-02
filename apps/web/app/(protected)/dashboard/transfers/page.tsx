"use client";

import { useState } from "react";
import TransferTable from "@/app/components/dashboard/TransferTable";
import { TRANSFERS, type TransferStatus } from "@/app/components/dashboard/data";

const FILTERS: { label: string; value: TransferStatus | "all" }[] = [
  { label: "ALL", value: "all" },
  { label: "SUCCESS", value: "success" },
  { label: "PENDING", value: "pending" },
  { label: "BLOCKED", value: "blocked" },
  { label: "REJECTED", value: "rejected" },
];

export default function TransfersPage() {
  const [filter, setFilter] = useState<TransferStatus | "all">("all");

  const rows = filter === "all" ? TRANSFERS : TRANSFERS.filter((t) => t.status === filter);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">TRANSFERS</div>
          <div className="page-sub">{TRANSFERS.length} total · last 30 days</div>
        </div>
        <button className="btn-sm btn-ghost">EXPORT CSV</button>
      </div>

      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`filter-btn${filter === f.value ? " active" : ""}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
            {f.value !== "all" && (
              <span className="filter-count">
                {TRANSFERS.filter((t) => t.status === f.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="panel">
        <TransferTable rows={rows} />
        {rows.length === 0 && (
          <div className="empty">NO TRANSFERS MATCH THIS FILTER</div>
        )}
      </div>
    </div>
  );
}
