'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';

const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',  href: '/dashboard',           icon: 'overview' },
  { id: 'wallets',   label: 'Wallets',   href: '/dashboard/wallets',   icon: 'wallets' },
  { id: 'transfers', label: 'Transfers', href: '/dashboard/transfers', icon: 'transfers' },
  { id: 'approvals', label: 'Approvals', href: '/dashboard/approvals', icon: 'approvals' },
  { id: 'settings',  label: 'Settings',  href: '/dashboard/settings',  icon: 'settings' },
];

interface SidebarProps {
  pendingCount?: number;
}

export default function Sidebar({ pendingCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  const getActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="ds-sidebar">
      <Link href="/" className="ds-sb-logo">
        <span className="ds-sb-mark" />
        <span className="ds-sb-name">On<b>Leash</b></span>
      </Link>

      <div className="ds-sb-workspace">
        <div>Workspace</div>
        <div className="ds-ws-row">
          <span>arc-labs</span>
          <span className="ds-ws-net">DEVNET</span>
        </div>
      </div>

      <nav className="ds-sb-nav">
        <div className="ds-nav-section">Dashboard</div>
        {NAV_ITEMS.map(item => {
          const isActive = getActive(item.href);
          const showBadge = item.id === 'approvals' && pendingCount > 0;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`ds-sb-link${isActive ? ' active' : ''}`}
            >
              <span className="ds-ico"><Icon name={item.icon} size={16} /></span>
              <span>{item.label}</span>
              {showBadge && <span className="ds-badge">{pendingCount}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="ds-sb-user">
        <div className="ds-sb-av">M</div>
        <div className="ds-sb-info">
          <div className="ds-sb-em">morgan@arc-labs.io</div>
          <div className="ds-sb-pl">Pro · 5 seats</div>
        </div>
        <button style={{ color: 'var(--ink-faint)', fontSize: 16, padding: '4px 6px', background: 'none', border: 'none', cursor: 'pointer' }} aria-label="account menu">
          <Icon name="menu" />
        </button>
      </div>
    </aside>
  );
}
