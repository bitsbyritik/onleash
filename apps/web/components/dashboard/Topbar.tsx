'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';

type DashboardNetwork = 'mainnet' | 'devnet' | 'testnet';

const NETWORKS: DashboardNetwork[] = ['mainnet', 'devnet', 'testnet'];

interface TopbarProps {
  title: string;
  breadcrumb?: React.ReactNode;
  pendingCount?: number;
  hideCta?: boolean;
}

export default function Topbar({ title, breadcrumb, pendingCount, hideCta = false }: TopbarProps) {
  const router = useRouter();
  const [network, setNetwork] = useState<DashboardNetwork>('devnet');
  const [teamName, setTeamName] = useState('');
  const [teamSlug, setTeamSlug] = useState('');
  const [fetchedPending, setFetchedPending] = useState(0);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    const loadMe = () => {
      fetch('/api/dashboard/me', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!active || !data) return;
          if (data.team?.defaultNetwork) setNetwork(data.team.defaultNetwork);
          if (data.team?.name) setTeamName(data.team.name);
          if (data.team?.slug) setTeamSlug(data.team.slug);
          if (typeof data.pendingApprovals === 'number') setFetchedPending(data.pendingApprovals);
        })
        .catch(() => undefined);
    };

    const updateNetwork = (event: Event) => {
      const next = (event as CustomEvent<{ network: DashboardNetwork }>).detail?.network;
      if (next) setNetwork(next);
    };
    const updateWorkspace = () => loadMe();

    window.addEventListener('onleash:network-change', updateNetwork);
    window.addEventListener('onleash:workspace-change', updateWorkspace);
    loadMe();

    return () => {
      active = false;
      window.removeEventListener('onleash:network-change', updateNetwork);
      window.removeEventListener('onleash:workspace-change', updateWorkspace);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  async function switchNetwork(next: DashboardNetwork) {
    if (next === network || saving) return;
    setOpen(false);
    setSaving(true);
    const previous = network;
    setNetwork(next);
    window.dispatchEvent(new CustomEvent('onleash:network-change', { detail: { network: next } }));

    try {
      const res = await fetch('/api/dashboard/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName, slug: teamSlug, defaultNetwork: next }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Failed');
      window.dispatchEvent(new CustomEvent('onleash:network-change', { detail: { network: body.team.defaultNetwork } }));
      window.dispatchEvent(new CustomEvent('onleash:workspace-change'));
      router.refresh();
    } catch {
      setNetwork(previous);
      window.dispatchEvent(new CustomEvent('onleash:network-change', { detail: { network: previous } }));
    } finally {
      setSaving(false);
    }
  }

  const badge = pendingCount ?? fetchedPending;

  return (
    <header className="ds-topbar">
      <div className="ds-tb-left">
        <h1 className="ds-tb-title">{title}</h1>
        {breadcrumb && <span className="ds-tb-bread">{breadcrumb}</span>}
      </div>
      <div className="ds-tb-right">
        <button className="ds-tb-bell" aria-label="notifications">
          <Icon name="bell" size={16} />
          {badge > 0 && <span className="dot" />}
        </button>

        {/* Network switcher */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            className={`ds-tb-net ${network}`}
            onClick={() => setOpen((o) => !o)}
            disabled={saving}
            suppressHydrationWarning
            style={{ cursor: saving ? 'wait' : 'pointer' }}
            title="Switch network"
          >
            <span className={`dot ${network}`} suppressHydrationWarning />
            <span suppressHydrationWarning>{network.toUpperCase()}</span>
          </button>
          {open && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 6,
              overflow: 'hidden',
              zIndex: 100,
              minWidth: 130,
            }}>
              {NETWORKS.map((n) => (
                <button
                  key={n}
                  onClick={() => void switchNetwork(n)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '8px 14px',
                    background: n === network ? 'var(--line)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    color: 'var(--ink)',
                    textAlign: 'left',
                    textTransform: 'uppercase',
                  }}
                >
                  <span className={`dot ${n}`} style={{ flexShrink: 0 }} />
                  {n}
                  {n === network && <span style={{ marginLeft: 'auto', color: 'var(--mint)', fontSize: 12 }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

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
