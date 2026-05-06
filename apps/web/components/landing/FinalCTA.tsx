'use client'

import { useState } from 'react'

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function FinalCTA() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('npm install @onleash/sdk')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  return (
    <section style={{ background: 'var(--void)', padding: '100px 0', textAlign: 'center' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 10,
          color: 'var(--accent)',
          letterSpacing: '0.5em',
          textTransform: 'uppercase',
          marginBottom: 24,
        }}>
          GET STARTED
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(52px, 7vw, 96px)',
          lineHeight: 0.95,
          marginBottom: 24,
        }}>
          <div>PUT YOUR AGENT</div>
          <div>ON A <span style={{ color: 'var(--accent)' }}>LEASH</span></div>
        </h2>

        <p style={{
          fontFamily: 'var(--font-prose)',
          fontStyle: 'italic',
          fontSize: 20,
          color: 'var(--text-2)',
          marginBottom: 48,
        }}>
          Free to start. No credit card. No custody. Just control.
        </p>

        <div className="l-cta-row" style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <a href="/sign-up" className="l-btn-primary">GET STARTED FREE</a>
          <a href="#" className="l-btn-ghost">READ THE DOCS →</a>
        </div>

        <div style={{ marginTop: 48 }}>
          <div
            className="l-npm-box"
            role="button"
            tabIndex={0}
            onClick={handleCopy}
            onKeyDown={e => e.key === 'Enter' && handleCopy()}
            style={{ cursor: 'pointer', margin: '0 auto', display: 'inline-flex' }}
          >
            <span style={{ color: 'var(--text-3)' }}>$ </span>
            <span style={{ color: 'var(--accent)' }}>npm install @onleash/sdk</span>
            <button className="l-copy-btn" onClick={handleCopy} aria-label="Copy install command">
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
