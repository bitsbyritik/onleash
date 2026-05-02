type BadgeStatus =
  | "success" | "approved"
  | "blocked" | "rejected"
  | "pending" | "expired"
  | "active"  | "inactive";

const STATUS_MAP: Record<BadgeStatus, { cls: string; dot: string; label: string }> = {
  success:  { cls: "b-success",  dot: "var(--success)", label: "SUCCESS"  },
  approved: { cls: "b-success",  dot: "var(--success)", label: "APPROVED" },
  blocked:  { cls: "b-blocked",  dot: "var(--blocked)", label: "BLOCKED"  },
  rejected: { cls: "b-rejected", dot: "var(--blocked)", label: "REJECTED" },
  pending:  { cls: "b-pending",  dot: "var(--pending)", label: "PENDING"  },
  expired:  { cls: "b-expired",  dot: "var(--expired)", label: "EXPIRED"  },
  active:   { cls: "b-active",   dot: "var(--accent)",  label: "ACTIVE"   },
  inactive: { cls: "b-inactive", dot: "var(--expired)", label: "INACTIVE" },
};

export default function Badge({ status }: { status: BadgeStatus }) {
  const m = STATUS_MAP[status] ?? STATUS_MAP.expired;
  return (
    <span className={`badge ${m.cls}`}>
      <span className="badge-dot" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}
