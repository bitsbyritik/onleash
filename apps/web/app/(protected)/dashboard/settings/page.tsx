'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/dashboard/Topbar';
import Icon from '@/components/dashboard/Icon';

type ApiKeyRecord = {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
};

type DashboardNetwork = 'mainnet' | 'devnet' | 'testnet';

type MeResponse = {
  user: {
    walletAddress: string;
    role: string;
  };
  team: {
    name: string;
    slug: string;
    defaultNetwork: DashboardNetwork;
    plan: string;
    walletLimit: number;
  } | null;
  devMode?: boolean;
  devPlan?: string | null;
  devPlanOptions?: string[];
};

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function SettingsPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [keyName, setKeyName] = useState('Agent SDK devnet');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');
  const [workspaceNetwork, setWorkspaceNetwork] = useState<DashboardNetwork>('devnet');
  const [newSecret, setNewSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [error, setError] = useState('');
  const [workspaceMessage, setWorkspaceMessage] = useState('');
  const [copied, setCopied] = useState(false);

  async function loadSettings() {
    setLoading(true);
    setError('');
    try {
      const [meRes, keysRes] = await Promise.all([
        fetch('/api/dashboard/me'),
        fetch('/api/dashboard/api-keys'),
      ]);
      if (!meRes.ok || !keysRes.ok) throw new Error('Unable to load settings');
      const meData = await meRes.json();
      setMe(meData);
      setWorkspaceName(meData.team?.name ?? '');
      setWorkspaceSlug(meData.team?.slug ?? '');
      setWorkspaceNetwork(meData.team?.defaultNetwork ?? 'devnet');
      const keyData = await keysRes.json();
      setKeys(keyData.keys ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load settings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  function broadcastNetwork(network: DashboardNetwork) {
    window.dispatchEvent(
      new CustomEvent('onleash:network-change', { detail: { network } }),
    );
  }

  function broadcastWorkspace() {
    window.dispatchEvent(new CustomEvent('onleash:workspace-change'));
  }

  async function createKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setNewSecret('');
    try {
      const res = await fetch('/api/dashboard/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Could not create API key');
      setKeys((prev) => [body.key, ...prev]);
      setNewSecret(body.secret);
      setKeyName('Agent SDK devnet');
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create API key');
    } finally {
      setSubmitting(false);
    }
  }

  async function updateWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingWorkspace(true);
    setError('');
    setWorkspaceMessage('');
    try {
      const res = await fetch('/api/dashboard/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workspaceName,
          slug: workspaceSlug,
          defaultNetwork: workspaceNetwork,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Could not update workspace');
      setMe((prev) => prev ? { ...prev, team: body.team } : prev);
      setWorkspaceName(body.team.name);
      setWorkspaceSlug(body.team.slug);
      setWorkspaceNetwork(body.team.defaultNetwork);
      setWorkspaceMessage('Workspace updated');
      broadcastNetwork(body.team.defaultNetwork);
      broadcastWorkspace();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update workspace');
    } finally {
      setSavingWorkspace(false);
    }
  }

  async function updateNetwork(nextNetwork: DashboardNetwork) {
    const previousNetwork = workspaceNetwork;
    setWorkspaceNetwork(nextNetwork);
    setWorkspaceMessage('Network updated');
    broadcastNetwork(nextNetwork);

    try {
      const res = await fetch('/api/dashboard/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workspaceName,
          slug: workspaceSlug,
          defaultNetwork: nextNetwork,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Could not update network');
      setMe((prev) => prev ? { ...prev, team: body.team } : prev);
      setWorkspaceName(body.team.name);
      setWorkspaceSlug(body.team.slug);
      setWorkspaceNetwork(body.team.defaultNetwork);
      broadcastNetwork(body.team.defaultNetwork);
      broadcastWorkspace();
      router.refresh();
    } catch (err) {
      setWorkspaceNetwork(previousNetwork);
      broadcastNetwork(previousNetwork);
      setWorkspaceMessage('');
      setError(err instanceof Error ? err.message : 'Could not update network');
    }
  }

  async function revokeKey(keyId: string) {
    setError('');
    try {
      const res = await fetch(`/api/dashboard/api-keys/${keyId}`, {
        method: 'DELETE',
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? 'Could not revoke API key');
      setKeys((prev) =>
        prev.map((key) =>
          key.id === keyId ? { ...key, isActive: false } : key,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not revoke API key');
    }
  }

  async function copySecret() {
    if (!newSecret) return;
    await navigator.clipboard.writeText(newSecret);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function switchDevPlan(plan: string) {
    await fetch('/api/dashboard/dev/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    await loadSettings();
  }

  async function logout() {
    await fetch('/api/dashboard/logout', { method: 'POST' });
    window.location.href = '/sign-in';
  }

  return (
    <>
      <Topbar title="Settings" pendingCount={2} hideCta />
      <div className="ds-content">
        {error && (
          <div className="ds-alert ds-alert-danger" role="alert">
            <span className="ico"><Icon name="warn" /></span>
            <span className="msg">{error}</span>
            <button className="cta" type="button" onClick={loadSettings}>Retry</button>
          </div>
        )}

        <div className="ds-set-grid">
          <div>
            <div className="ds-set-card">
              <div className="h">Workspace <span className="desc">Name and URL handle</span></div>
              <form className="ds-form ds-form-stack" onSubmit={updateWorkspace} aria-busy={savingWorkspace}>
                <div className="ds-field">
                  <label htmlFor="workspace-name">Workspace name</label>
                  <input
                    id="workspace-name"
                    className="ds-input"
                    value={workspaceName}
                    onChange={(event) => setWorkspaceName(event.target.value)}
                    autoComplete="organization"
                    spellCheck={false}
                    required
                    minLength={2}
                    maxLength={80}
                  />
                </div>
                <div className="ds-field">
                  <label htmlFor="workspace-slug">Workspace slug</label>
                  <input
                    id="workspace-slug"
                    className="ds-input"
                    value={workspaceSlug}
                    onChange={(event) => setWorkspaceSlug(event.target.value.toLowerCase())}
                    autoComplete="off"
                    spellCheck={false}
                    required
                    minLength={2}
                    maxLength={63}
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  />
                  <p>Lowercase letters, numbers, and single hyphens.</p>
                </div>
                <div className="ds-field">
                  <label htmlFor="workspace-network">Default network</label>
                  <select
                    id="workspace-network"
                    className="ds-input"
                    value={workspaceNetwork}
                    onChange={(event) =>
                      void updateNetwork(event.target.value as DashboardNetwork)
                    }
                  >
                    <option value="devnet">Devnet</option>
                    <option value="mainnet">Mainnet</option>
                    <option value="testnet">Testnet</option>
                  </select>
                  <p>Dashboard labels and SDK examples follow this workspace default.</p>
                </div>
                <div className="ds-form-actions">
                  {workspaceMessage && <span className="ds-ok">{workspaceMessage}</span>}
                  <button className="ds-btn ds-btn-mint" type="submit" disabled={savingWorkspace}>
                    {savingWorkspace ? 'SAVING' : 'SAVE WORKSPACE'}
                  </button>
                </div>
              </form>
            </div>

            <div className="ds-set-card">
              <div className="h">API Keys <span className="desc">Server-side only - rotate every 90 days</span></div>

              <form className="ds-form ds-api-key-form" onSubmit={createKey} aria-busy={submitting}>
                <div className="ds-field">
                  <label htmlFor="api-key-name">Key name</label>
                  <input
                    id="api-key-name"
                    className="ds-input"
                    value={keyName}
                    onChange={(event) => setKeyName(event.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    required
                    maxLength={80}
                  />
                  <p>Use one key per environment or agent runner.</p>
                </div>
                <button className="ds-btn ds-btn-mint" type="submit" disabled={submitting}>
                  <Icon name="plus" size={12} />{submitting ? 'CREATING' : 'CREATE KEY'}
                </button>
              </form>

              {newSecret && (
                <div className="ds-secret" role="status">
                  <div>
                    <span>New API key</span>
                    <code>{newSecret}</code>
                    <p>Copy it now. It will not be shown again.</p>
                  </div>
                  <button className="ds-btn ds-btn-ghost" type="button" onClick={copySecret}>
                    {copied ? 'COPIED' : 'COPY'}
                  </button>
                </div>
              )}

              <div className="ds-key-list">
                {loading ? (
                  <div className="ds-empty">Loading API keys...</div>
                ) : keys.length === 0 ? (
                  <div className="ds-empty">No API keys yet. Create one to connect the SDK.</div>
                ) : (
                  keys.map((key) => (
                    <div className="ds-set-row" key={key.id}>
                      <span className="k">{key.name}</span>
                      <span className={`v${key.isActive ? '' : ' dim'}`}>
                        {key.keyPrefix}••••••••••••••••
                      </span>
                      <span className="sactions">
                        <span className={`ds-bdg ${key.isActive ? 'active' : 'rejected'}`}>
                          {key.isActive ? 'active' : 'revoked'}
                        </span>
                        {key.isActive && (
                          <button className="ds-btn ds-btn-danger" type="button" onClick={() => revokeKey(key.id)}>
                            REVOKE
                          </button>
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="ds-set-card">
              <div className="h">Notification Channels <span className="desc">Where HITL approvals fire</span></div>
              <div className="ds-set-row">
                <span className="k">Telegram</span>
                <span className="v dim">Connection code flow pending bot wiring</span>
                <span className="sactions"><span className="ds-bdg pending">pending</span></span>
              </div>
              <div className="ds-set-row">
                <span className="k">Webhook</span>
                <span className="v dim">Not configured</span>
                <span className="sactions"><span className="ds-bdg rejected">disconnected</span></span>
              </div>
            </div>

            <div className="ds-set-card">
              <div className="h">Session <span className="desc">Wallet-authenticated workspace</span></div>
              {me ? (
                <>
                  <div className="ds-team-row">
                    <div className="tnm">
                      <div className="av">{me.user.walletAddress.slice(0, 1).toUpperCase()}</div>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink)' }}>{shortAddress(me.user.walletAddress)}</span>
                    </div>
                    <span style={{ color: 'var(--ink-dim)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{me.user.role}</span>
                    <span style={{ color: 'var(--ink-faint)', fontSize: 10, letterSpacing: '0.1em' }}>ACTIVE SESSION</span>
                    <span className="ds-bdg active">signed</span>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <button className="ds-btn ds-btn-danger" type="button" onClick={logout}>
                      LOGOUT
                    </button>
                  </div>
                </>
              ) : (
                <div className="ds-empty">Loading session...</div>
              )}
            </div>
          </div>

          <div>
            {me?.devMode && (
              <div className="ds-set-card" style={{ marginBottom: 16, borderColor: 'var(--amber, #f59e0b)' }}>
                <div className="h" style={{ color: 'var(--amber, #f59e0b)' }}>
                  Dev plan override
                  <span className="desc">Not persisted — session cookie only</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {(me.devPlanOptions ?? ['free', 'pro', 'team']).map((p) => {
                    const active = (me.devPlan ?? me.team?.plan) === p;
                    return (
                      <button
                        key={p}
                        className={`ds-btn ${active ? 'ds-btn-mint' : 'ds-btn-ghost'}`}
                        type="button"
                        onClick={() => void switchDevPlan(p)}
                        style={{ opacity: active ? 1 : 0.6 }}
                      >
                        {p.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--ink-faint)', marginTop: 8 }}>
                  DEV_PLAN env: {process.env.NEXT_PUBLIC_DEV_PLAN ?? '(server-side only)'}
                </p>
              </div>
            )}

            <div className="ds-plan-card">
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.22em', color: 'var(--mint)', textTransform: 'uppercase' }}>Current plan</div>
              <div className="pl">{me?.team?.plan?.toUpperCase() ?? 'FREE'}</div>
              <div className="desc">{me?.team?.name ?? 'Wallet workspace'} - session-auth enabled</div>
              <div className="stats">
                <div className="st"><div className="lbl">API keys</div><div className="vl">{keys.length}</div></div>
                <div className="st"><div className="lbl">Active keys</div><div className="vl">{keys.filter((key) => key.isActive).length}</div></div>
                <div className="st"><div className="lbl">Wallet limit</div><div className="vl">{me?.team?.walletLimit ?? 1}</div></div>
                <div className="st"><div className="lbl">Network</div><div className="vl" style={{ fontSize: 18 }}>{workspaceNetwork.toUpperCase()}</div></div>
              </div>
              <button className="ds-btn ds-btn-mint" style={{ width: '100%', justifyContent: 'center' }}>BILLING COMING SOON</button>
            </div>

            <div className="ds-set-card" style={{ marginTop: 16 }}>
              <div className="h">Quick links</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'var(--font-ui)', fontSize: 12 }}>
                {[
                  '-> Audit log',
                  '-> Webhooks',
                  '-> Anchor program - 7gXq...4mJp',
                  '-> Billing - coming soon',
                ].map(lnk => (
                  <li key={lnk}><a href="#" style={{ color: 'var(--ink-dim)' }}>{lnk}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
