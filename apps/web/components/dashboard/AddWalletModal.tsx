'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import bs58 from 'bs58';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 0 | 1 | 2;

interface SignedData {
  publicKey: string;
  signature: string;
  nonce: string;
  message: string;
}

function shortKey(key: string) {
  return `${key.slice(0, 8)}...${key.slice(-6)}`;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--void-3)',
  border: '1px solid var(--line-strong)',
  color: 'var(--ink)',
  fontFamily: 'var(--font-code)',
  fontSize: 12,
  padding: '9px 12px',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: 10,
  letterSpacing: '0.2em',
  color: 'var(--ink-dim)',
  textTransform: 'uppercase',
  marginBottom: 6,
  display: 'block',
};

const STEP_LABELS = ['Connect', 'Verify', 'Configure'];

export default function AddWalletModal({ onClose, onSuccess }: Props) {
  const { publicKey, connected, signMessage } = useWallet();
  const { setVisible } = useWalletModal();

  const [step, setStep] = useState<Step>(0);
  const [signing, setSigning] = useState(false);
  const [signedData, setSignedData] = useState<SignedData | null>(null);
  const [form, setForm] = useState({ name: '', network: 'mainnet', dailyCap: '1', approvalThreshold: '0.5' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto-advance when wallet connects
  useEffect(() => {
    if (connected && step === 0) setStep(1);
  }, [connected, step]);

  async function handleSign() {
    if (!publicKey || !signMessage) {
      setError("This wallet doesn't support message signing");
      return;
    }
    setSigning(true);
    setError('');
    try {
      const nonce = crypto.randomUUID();
      const timestamp = Date.now();
      const messageText = `Register wallet with OnLeash\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
      const sigBytes = await signMessage(new TextEncoder().encode(messageText));
      setSignedData({
        publicKey: publicKey.toBase58(),
        signature: bs58.encode(sigBytes),
        nonce,
        message: messageText,
      });
      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRejection = /reject|cancel|denied|user/i.test(msg);
      setError(isRejection ? 'Signature rejected — try again' : (msg || 'Signing failed'));
    } finally {
      setSigning(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signedData) return;
    setSubmitting(true);
    setError('');
    try {
      const dailyCap = Math.floor(parseFloat(form.dailyCap) * 1e9);
      const approvalThreshold = Math.floor(parseFloat(form.approvalThreshold) * 1e9);
      if (!isFinite(dailyCap) || !isFinite(approvalThreshold) || dailyCap <= 0 || approvalThreshold <= 0) {
        setError('Enter valid SOL amounts greater than 0');
        return;
      }
      const res = await fetch('/api/dashboard/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...signedData, name: form.name, network: form.network, dailyCap, approvalThreshold }),
      });
      const data = await res.json() as { error?: string; upgrade?: boolean };
      if (!res.ok) {
        setError(
          data.upgrade
            ? 'Wallet limit reached — upgrade your plan to add more'
            : (data.error ?? 'Failed to register wallet'),
        );
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setError('Network error — please try again');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'var(--void-2)', border: '1px solid var(--line-strong)', padding: 32, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.22em', color: 'var(--mint)', textTransform: 'uppercase', marginBottom: 4 }}>
              New Agent Wallet
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, textTransform: 'uppercase', color: 'var(--ink)', lineHeight: 1 }}>
              {STEP_LABELS[step]}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}
          >
            ✕
          </button>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
          {([0, 1, 2] as Step[]).map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 2,
                background: i <= step ? 'var(--mint)' : 'var(--line-strong)',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ border: '1px solid var(--danger)', background: 'var(--danger-soft)', padding: '9px 12px', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--danger)', marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Step 0 — Connect */}
        {step === 0 && (
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink-dim)', marginBottom: 24, lineHeight: 1.6 }}>
              Connect the wallet you want to use as an agent wallet. We verify ownership by asking you to sign a message — your private key never leaves your wallet.
            </p>
            <button
              type="button"
              onClick={() => setVisible(true)}
              style={{ width: '100%', background: 'var(--mint)', color: 'var(--void)', border: 'none', fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 20px', cursor: 'pointer' }}
            >
              Connect Wallet →
            </button>
            <div style={{ marginTop: 16, fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
              Phantom · Solflare · Backpack · Ledger — any Wallet Standard wallet
            </div>
          </div>
        )}

        {/* Step 1 — Sign */}
        {step === 1 && publicKey && (
          <div>
            <div style={{ border: '1px solid var(--line-strong)', background: 'var(--void-3)', padding: 16, marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: 6 }}>
                Connected wallet
              </div>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 13, color: 'var(--mint)' }}>
                {shortKey(publicKey.toBase58())}
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink-dim)', marginBottom: 24, lineHeight: 1.6 }}>
              Sign a one-time message to prove you control this wallet. This is not a transaction and costs no SOL.
            </p>
            <button
              type="button"
              onClick={handleSign}
              disabled={signing}
              style={{ width: '100%', background: 'var(--mint)', color: 'var(--void)', border: 'none', fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 20px', cursor: signing ? 'not-allowed' : 'pointer', opacity: signing ? 0.6 : 1 }}
            >
              {signing ? 'Waiting for signature…' : 'Sign Message →'}
            </button>
            <button
              type="button"
              onClick={() => setVisible(true)}
              style={{ marginTop: 10, width: '100%', background: 'none', color: 'var(--ink-dim)', border: '1px solid var(--line-strong)', fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '9px 20px', cursor: 'pointer' }}
            >
              Switch Wallet
            </button>
          </div>
        )}

        {/* Step 2 — Configure */}
        {step === 2 && signedData && (
          <form onSubmit={handleSubmit}>
            <div style={{ border: '1px solid var(--line-strong)', background: 'var(--void-3)', padding: '10px 14px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 6, height: 6, background: 'var(--mint)', borderRadius: '50%', boxShadow: '0 0 8px var(--mint)', flexShrink: 0 }} />
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--ink-dim)' }}>
                Ownership verified — {shortKey(signedData.publicKey)}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle} htmlFor="aw-name">Wallet name</label>
              <input
                id="aw-name"
                style={inputStyle}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. trading-agent"
                required
                maxLength={80}
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle} htmlFor="aw-network">Network</label>
              <select
                id="aw-network"
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.network}
                onChange={(e) => setForm((p) => ({ ...p, network: e.target.value }))}
              >
                <option value="mainnet">mainnet</option>
                <option value="devnet">devnet</option>
                <option value="testnet">testnet</option>
              </select>
            </div>

            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--mint)', textTransform: 'uppercase', marginBottom: 12 }}>
              Policy limits
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle} htmlFor="aw-daily">Daily cap (SOL)</label>
              <input
                id="aw-daily"
                style={inputStyle}
                type="number"
                step="0.001"
                min="0.001"
                value={form.dailyCap}
                onChange={(e) => setForm((p) => ({ ...p, dailyCap: e.target.value }))}
                placeholder="1"
                required
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle} htmlFor="aw-threshold">Approval threshold (SOL)</label>
              <input
                id="aw-threshold"
                style={inputStyle}
                type="number"
                step="0.001"
                min="0.001"
                value={form.approvalThreshold}
                onChange={(e) => setForm((p) => ({ ...p, approvalThreshold: e.target.value }))}
                placeholder="0.5"
                required
              />
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--ink-faint)', marginTop: 6, letterSpacing: '0.08em' }}>
                Transfers above this amount require HITL approval
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                disabled={submitting}
                style={{ flex: 1, background: 'var(--mint)', color: 'var(--void)', border: 'none', fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 20px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Registering…' : '→ Register Wallet'}
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'none', color: 'var(--ink-dim)', border: '1px solid var(--line-strong)', fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '13px 20px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
