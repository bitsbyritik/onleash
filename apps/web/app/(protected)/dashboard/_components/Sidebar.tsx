"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard",           label: "OVERVIEW",   icon: "◈" },
  { href: "/dashboard/wallets",   label: "WALLETS",    icon: "◉" },
  { href: "/dashboard/transfers", label: "TRANSFERS",  icon: "↔" },
  { href: "/dashboard/approvals", label: "APPROVALS",  icon: "◷", badge: 2 },
  { href: "/dashboard/settings",  label: "SETTINGS",   icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <span className="logo-on">ON</span>
          <span className="logo-leash">LEASH</span>
        </div>
        <div className="sidebar-team">Acme Labs</div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-group-label">// MAIN</div>
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={`nav-item${isActive(item.href) ? " active" : ""}`}>
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
              {item.badge != null && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </div>
          </Link>
        ))}

        <div className="nav-group-label" style={{ marginTop: 12 }}>// RESOURCES</div>
        <Link href="/docs">
          <div className="nav-item">
            <span className="nav-item-icon">📄</span>DOCS
          </div>
        </Link>
        <Link href="/">
          <div className="nav-item">
            <span className="nav-item-icon">↗</span>MARKETING
          </div>
        </Link>
      </div>

      <div className="sidebar-bottom">
        <div className="plan-badge">PRO</div>
        <div className="user-row">
          <div className="user-avatar">YO</div>
          <div className="user-info">
            <div className="user-name">you@acme.com</div>
            <div className="user-email">Owner</div>
          </div>
        </div>
      </div>
    </div>
  );
}
