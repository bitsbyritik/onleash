'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';

type DashboardNetwork = 'mainnet' | 'devnet' | 'testnet';

interface TopbarProps {
  title: string;
  breadcrumb?: React.ReactNode;
  pendingCount?: number;
  hideCta?: boolean;
}

export default function Topbar({ title, breadcrumb, pendingCount = 0, hideCta = false }: TopbarProps) {
  const [network, setNetwork] = useState<DashboardNetwork>('devnet');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    setMounted(true);
    const loadNetwork = () => {
      fetch('/api/dashboard/me', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (active && data?.team?.defaultNetwork) {
            setNetwork(data.team.defaultNetwork);
          }
        })
        .catch(() => undefined);
    };
    const updateNetwork = (event: Event) => {
      const next = (event as CustomEvent<{ network: DashboardNetwork }>).detail?.network;
      if (next) setNetwork(next);
    };
    const updateWorkspace = () => loadNetwork();
    window.addEventListener('onleash:network-change', updateNetwork);
    window.addEventListener('onleash:workspace-change', updateWorkspace);
    loadNetwork();
    return () => {
      active = false;
      window.removeEventListener('onleash:network-change', updateNetwork);
      window.removeEventListener('onleash:workspace-change', updateWorkspace);
    };
  }, []);

  const displayedNetwork = mounted ? network : 'devnet';
  const networkLabel = mounted ? displayedNetwork.toUpperCase() : displayedNetwork;

  return (
    <header className="ds-topbar">
      <div className="ds-tb-left">
        <h1 className="ds-tb-title">{title}</h1>
        {breadcrumb && <span className="ds-tb-bread">{breadcrumb}</span>}
      </div>
      <div className="ds-tb-right">
        <span className={`ds-tb-net ${mounted ? displayedNetwork : ''}`}>
          <span className={`dot ${mounted ? displayedNetwork : ''}`} />{networkLabel}
        </span>
        <button className="ds-tb-bell" aria-label="notifications">
          <Icon name="bell" size={16} />
          {pendingCount > 0 && <span className="dot" />}
        </button>
        {!hideCta && (
          <button className="ds-tb-cta">
            <Icon name="plus" size={14} />
            <span>NEW WALLET</span>
          </button>
        )}
      </div>
    </header>
  );
}
