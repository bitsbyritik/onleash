'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { modal } from '@/config/reown';
import Icon from './Icon';

type DashboardNetwork = 'mainnet' | 'devnet' | 'testnet';

const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',  href: '/dashboard',  icon: 'overview' },
  { id: 'wallets',   label: 'Wallets',   href: '/wallets',    icon: 'wallets' },
  { id: 'transfers', label: 'Transfers', href: '/transfers',  icon: 'transfers' },
  { id: 'approvals', label: 'Approvals', href: '/approvals',  icon: 'approvals' },
  { id: 'settings',  label: 'Settings',  href: '/settings',   icon: 'settings' },
];

interface SidebarProps {
  pendingCount?: number;
  workspaceName?: string;
  workspaceSlug?: string;
  network?: DashboardNetwork;
}

export default function Sidebar({
  pendingCount = 0,
  workspaceName = 'Workspace',
  workspaceSlug = 'workspace',
  network = 'devnet',
}: SidebarProps) {
  const pathname = usePathname();
  const [displayNetwork, setDisplayNetwork] = useState(network);

  useEffect(() => {
    setDisplayNetwork(network);
  }, [network]);

  useEffect(() => {
    const updateNetwork = (event: Event) => {
      const next = (event as CustomEvent<{ network: DashboardNetwork }>).detail?.network;
      if (next) setDisplayNetwork(next);
    };
    window.addEventListener('onleash:network-change', updateNetwork);
    return () => window.removeEventListener('onleash:network-change', updateNetwork);
  }, []);

  async function logout() {
    await modal.disconnect();
    await fetch('/api/dashboard/logout', { method: 'POST' });
    window.location.href = '/sign-in';
  }

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
          <span title={workspaceName}>{workspaceSlug}</span>
          <span className={`ds-ws-net ${displayNetwork}`}>{displayNetwork}</span>
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
          <div className="ds-sb-em" title={workspaceName}>{workspaceName}</div>
          <div className="ds-sb-pl">/{workspaceSlug}</div>
        </div>
        <button className="ds-sb-logout" type="button" onClick={logout} aria-label="Log out" title="Log out">
          -&gt;
        </button>
      </div>
    </aside>
  );
}
