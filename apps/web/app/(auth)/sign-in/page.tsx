'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';
import bs58 from 'bs58';

type Step = 'idle' | 'connected' | 'signing' | 'authenticating' | 'error';

export default function SignInPage() {
  const { connected, publicKey, signMessage, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();
  const [step, setStep] = useState<Step>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (connected && publicKey && step === 'idle') {
      setStep('connected');
    }
    if (!connected && step === 'connected') {
      setStep('idle');
    }
  }, [connected, publicKey, step]);

  async function handleAuth() {
    if (!publicKey || !signMessage) return;
    setStep('signing');
    setError('');
    try {
      const nonceRes = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: publicKey.toBase58() }),
      });
      if (!nonceRes.ok) throw new Error('Failed to get nonce');
      const { nonce, message } = await nonceRes.json();

      const msgBytes = new TextEncoder().encode(message);
      const sigBytes = await signMessage(msgBytes);
      const signature = bs58.encode(sigBytes);

      setStep('authenticating');
      const authRes = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: publicKey.toBase58(), signature, nonce }),
      });
      if (!authRes.ok) throw new Error('Authentication failed');
      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
      setStep('error');
    }
  }

  const shortAddr = publicKey
    ? `${publicKey.toBase58().slice(0, 6)}…${publicKey.toBase58().slice(-4)}`
    : '';

  return (
    <div className="auth-page" style={{ background: 'var(--void)', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 0, position: 'relative', zIndex: 10 }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ width: 26, height: 26, border: '1px solid var(--mint)', display: 'grid', placeItems: 'center', position: 'relative' }}>
              <span style={{ width: 9, height: 9, background: 'var(--mint)', boxShadow: '0 0 10px var(--mint)', display: 'block' }} />
            </span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink)' }}>
              On<b style={{ color: 'var(--mint)', fontWeight: 500 }}>Leash</b>
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.22em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
            Spend Control for AI Agents
          </div>
        </div>

        {/* Card */}
        <div style={{ border: '1px solid var(--line-strong)', background: 'var(--void-2)', padding: '32px 32px 28px' }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--mint)', marginBottom: 8 }}>
              Authentication
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: 1, letterSpacing: '0.01em', textTransform: 'uppercase', color: 'var(--ink)' }}>
              {step === 'idle' || step === 'error' ? 'Connect Wallet' : step === 'connected' ? 'Ready to sign' : step === 'signing' ? 'Check wallet' : 'Verifying…'}
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink-dim)', marginTop: 10, lineHeight: 1.6, letterSpacing: '0.03em' }}>
              {step === 'idle' || step === 'error'
                ? 'Your Solana wallet is your identity. No email, no password.'
                : step === 'connected'
                ? `Connected: ${shortAddr} — sign a message to authenticate.`
                : step === 'signing'
                ? 'Sign the message in your wallet to continue.'
                : 'Verifying signature on-chain…'}
            </div>
          </div>

          {/* Wallet address display */}
          {(step === 'connected' || step === 'signing' || step === 'authenticating') && (
            <div style={{ border: '1px solid var(--line-strong)', background: 'var(--void-3)', padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 7, height: 7, background: 'var(--mint)', borderRadius: '50%', boxShadow: '0 0 8px var(--mint)', flexShrink: 0, animation: 'ds-livePulse 1.6s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'var(--ink)', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {publicKey?.toBase58()}
              </span>
            </div>
          )}

          {/* Error */}
          {step === 'error' && error && (
            <div style={{ border: '1px solid var(--danger)', background: 'var(--danger-soft)', padding: '10px 14px', marginBottom: 20, fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--danger)', letterSpacing: '0.05em' }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(step === 'idle' || step === 'error') && (
              <button
                onClick={() => setVisible(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '14px 20px', background: 'var(--mint)', color: 'var(--void)', border: '1px solid var(--mint)', cursor: 'pointer', transition: 'box-shadow 0.15s ease' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 28px var(--mint-glow)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <span style={{ fontSize: 16 }}>◈</span> Connect Wallet
              </button>
            )}

            {step === 'connected' && (
              <>
                <button
                  onClick={handleAuth}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '14px 20px', background: 'var(--mint)', color: 'var(--void)', border: '1px solid var(--mint)', cursor: 'pointer', transition: 'box-shadow 0.15s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 28px var(--mint-glow)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  → Sign &amp; Authenticate
                </button>
                <button
                  onClick={() => { disconnect(); setStep('idle'); }}
                  style={{ width: '100%', fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '11px 20px', background: 'none', color: 'var(--ink-dim)', border: '1px solid var(--line-strong)', cursor: 'pointer' }}
                >
                  ↺ Disconnect
                </button>
              </>
            )}

            {(step === 'signing' || step === 'authenticating') && (
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '14px 20px', background: 'var(--void-3)', color: 'var(--ink-dim)', border: '1px solid var(--line-strong)' }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, border: '1px solid var(--mint)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                {step === 'signing' ? 'Waiting for signature…' : 'Verifying…'}
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            '✓  Wallet address = your login · first time creates your account',
            '✓  Signature is off-chain · no gas, no transaction',
            '✓  Session lasts 7 days',
          ].map(line => (
            <div key={line} style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>{line}</div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
