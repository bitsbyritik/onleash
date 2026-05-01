"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/dashboard":             "OVERVIEW",
  "/dashboard/wallets":     "WALLETS",
  "/dashboard/transfers":   "TRANSFERS",
  "/dashboard/approvals":   "APPROVALS",
  "/dashboard/settings":    "SETTINGS",
};

export default function Topbar() {
  const pathname = usePathname();

  const isWalletDetail = pathname.startsWith("/dashboard/wallets/");
  const title = isWalletDetail
    ? null
    : (TITLES[pathname] ?? "DASHBOARD");

  return (
    <div className="topbar">
      <div className="topbar-title">
        {isWalletDetail ? (
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 14 }}>
            <Link href="/dashboard/wallets">
              <span style={{ color: "var(--text-tertiary)", cursor: "pointer" }}>WALLETS</span>
            </Link>
            <span style={{ color: "var(--text-tertiary)" }}> /</span>
            <span style={{ color: "var(--text-primary)" }}>
              {pathname.split("/").pop()}
            </span>
          </span>
        ) : (
          title
        )}
      </div>
      <div className="topbar-right">
        <div className="topbar-network">
          <div className="network-dot" />
          MAINNET-BETA
        </div>
        <div className="topbar-bell">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="bell-dot" />
        </div>
        <Link href="/dashboard/wallets">
          <button className="btn-sm btn-accent">+ NEW WALLET</button>
        </Link>
      </div>
    </div>
  );
}
