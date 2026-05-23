'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppKitAccount, useAppKitProvider, useAppKit } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-solana';
import { useRouter } from 'next/navigation';
import bs58 from 'bs58';

type AuthStep = 'idle' | 'signing' | 'authenticating' | 'error';

export default function SignInPage() {
  const { address, isConnected, embeddedWalletInfo } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>('solana');
  const { open } = useAppKit();
  const router = useRouter();

  const [step, setStep] = useState<AuthStep>('idle');
  const [error, setError] = useState('');
  // Prevent double-fire in React StrictMode (effects run twice in dev)
  const authFired = useRef(false);

  useEffect(() => {
    if (isConnected && address && !authFired.current) {
      authFired.current = true;
      void handleAuth();
    }
    if (!isConnected) {
      authFired.current = false;
      setStep('idle');
      setError('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  async function handleAuth() {
    if (embeddedWalletInfo) {
      await handleSocialAuth();
    } else {
      await handleWalletAuth();
    }
  }

  async function handleSocialAuth() {
    setStep('authenticating');
    setError('');
    const user = embeddedWalletInfo?.user;
    try {
      const res = await fetch('/api/auth/social-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          email: user?.email,
          name: user?.username,
        }),
      });
      if (!res.ok) throw new Error('Social sign-in failed');
      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
      setStep('error');
    }
  }

  async function handleWalletAuth() {
    if (!address || !walletProvider) return;
    setStep('signing');
    setError('');
    try {
      const nonceRes = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      if (!nonceRes.ok) throw new Error('Failed to get nonce');
      const { nonce, message } = await nonceRes.json() as { nonce: string; message: string };

      const msgBytes = new TextEncoder().encode(message);
      const sigBytes = await walletProvider.signMessage(msgBytes);
      const signature = bs58.encode(sigBytes);

      setStep('authenticating');
      const authRes = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, signature, nonce }),
      });
      if (!authRes.ok) throw new Error('Authentication failed');
      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
      setStep('error');
    }
  }

  const shortAddr = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '';
  const isLoading = step === 'signing' || step === 'authenticating';

  return (
    <>
      <style>{`
        @keyframes si-spin { to { transform: rotate(360deg); } }
        @keyframes si-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes brandPulse {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(1.9); opacity: 0; }
        }
      `}</style>

      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
        gap: 32,
      }}>

        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', width: 26, height: 26 }}>
            <div style={{
              position: 'absolute', inset: 0,
              border: '1px solid var(--mint)',
              display: 'grid', placeItems: 'center',
            }}>
              <div style={{ width: 8, height: 8, background: 'var(--mint)', boxShadow: '0 0 10px var(--mint)' }} />
            </div>
            <div style={{
              position: 'absolute', inset: -6,
              border: '1px solid var(--mint)',
              opacity: 0,
              animation: 'brandPulse 2.4s ease-out infinite',
            }} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 32,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}>
              <span style={{ color: 'var(--ink-dim)' }}>On</span>
              <span style={{ color: 'var(--mint)' }}>Leash</span>
            </div>
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--ink-faint)',
              marginTop: 6,
            }}>
              Spend Control for AI Agents
            </div>
          </div>
        </div>

        {/* Auth status — shown after wallet connects */}
        {isConnected && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            padding: '20px 28px',
            border: '1px solid var(--line-strong)',
            background: 'var(--void-2)',
            minWidth: 280,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isLoading ? (
                <span style={{
                  width: 7, height: 7, flexShrink: 0,
                  border: '1px solid var(--mint)', borderTopColor: 'transparent',
                  borderRadius: '50%', display: 'inline-block',
                  animation: 'si-spin 0.8s linear infinite',
                }} />
              ) : step === 'error' ? (
                <span style={{ width: 7, height: 7, background: 'var(--danger)', borderRadius: '50%', flexShrink: 0 }} />
              ) : (
                <span style={{ width: 7, height: 7, background: 'var(--mint)', borderRadius: '50%', boxShadow: '0 0 8px var(--mint)', flexShrink: 0 }} />
              )}
              <span style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'var(--ink-dim)', letterSpacing: '0.04em' }}>
                {shortAddr}
              </span>
            </div>

            <div style={{
              fontFamily: 'var(--font-ui)', fontSize: 11,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: step === 'error' ? 'var(--danger)' : 'var(--ink-dim)',
              animation: isLoading ? 'si-pulse 1.4s ease-in-out infinite' : 'none',
            }}>
              {step === 'signing' && 'Check your wallet…'}
              {step === 'authenticating' && 'Verifying…'}
              {step === 'error' && (error || 'Auth failed')}
            </div>

            {step === 'error' && (
              <button
                onClick={() => void handleAuth()}
                style={{
                  background: 'none', border: '1px solid var(--line-strong)',
                  color: 'var(--ink-dim)', fontFamily: 'var(--font-ui)',
                  fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                  padding: '7px 16px', cursor: 'pointer',
                }}
              >
                ↺ Retry
              </button>
            )}
          </div>
        )}

        {/* Connect button — only shown when not yet connected */}
        {!isConnected && (
          <button
            onClick={() => open({ view: 'Connect' })}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: 'var(--font-ui)', fontSize: 12,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              padding: '14px 32px',
              background: 'var(--mint)', color: 'var(--void)',
              border: 'none', cursor: 'pointer',
              transition: 'box-shadow 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 32px var(--mint-glow)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
          >
            <span style={{ fontSize: 16 }}>◈</span> Connect to access
          </button>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.08em' }}>
            Wallet · Email · Social — secured by Reown AppKit
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.08em' }}>
            First connection creates your account · 7-day session
          </p>
        </div>
      </div>
    </>
  );
}
