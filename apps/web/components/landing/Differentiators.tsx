'use client'

import { useState, useEffect } from 'react'

function BlocklistVisual() {
  const items = [
    { addr: '7xKj...9bM2',        tag: 'allow' },
    { addr: 'JUP6L...rAct',       tag: 'allow' },
    { addr: '4vLi...drainer',     tag: 'block' },
    { addr: '8aZK...3mNp',        tag: 'allow' },
  ]
  return (
    <div className="pill-row">
      {items.map((it, i) => (
        <div className="pill" key={i} style={it.tag === 'block' ? { animation: 'shim 2s linear infinite' } : undefined}>
          <span className="addr">{it.addr}</span>
          <span className={`tag ${it.tag}`}>{it.tag === 'block' ? 'BLOCKED' : 'ALLOW'}</span>
        </div>
      ))}
    </div>
  )
}

function VendorBars() {
  const [t, setT] = useState(0)

  useEffect(() => {
    let raf: number
    const start = performance.now()
    const loop = (now: number) => {
      setT(((now - start) / 1000) % 6)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const ease = (x: number) => Math.min(1, x)
  const bars = [
    { name: 'JUP',    cap: 25, val: ease(t / 1.6) * 17 },
    { name: 'METEOR', cap: 25, val: ease((t - 0.4) / 2.0) * 24 },
    { name: 'PUMP',   cap: 25, val: ease((t - 0.8) / 1.4) * 28 },
  ]

  return (
    <div className="bar-stack">
      {bars.map((b, i) => {
        const pct = Math.min(100, (b.val / b.cap) * 100)
        const over = b.val > b.cap
        return (
          <div className="bar" key={i}>
            <span className="name">{b.name}</span>
            <span className="track">
              <span className={`fill${over ? ' over' : ''}`} style={{ width: pct + '%' }} />
            </span>
            <span className="val" style={over ? { color: 'var(--magenta)' } : undefined}>
              ${b.val.toFixed(0)}/{b.cap}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function HitlVisual() {
  return (
    <div className="tg-mini">
      <div className="head">🚨 ONLEASH APPROVAL REQUIRED</div>
      <div className="row">Agent: Trading Bot α</div>
      <div className="row">Sending: <span style={{ color: 'var(--ink)' }}>60 USDC → 8xKj…3mNp</span></div>
      <div className="row" style={{ color: 'var(--warn)' }}>⏰ Expires 4:59</div>
      <div className="btns">
        <span className="ok">✓ APPROVE</span>
        <span className="no">✕ REJECT</span>
      </div>
    </div>
  )
}

function HierarchyVisual() {
  const [t, setT] = useState(0)

  useEffect(() => {
    let raf: number
    const start = performance.now()
    const loop = (now: number) => {
      setT(((now - start) / 1000) % 4)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const flash = t > 2.4 && t < 3.0

  return (
    <svg viewBox="0 0 240 90" style={{ width: '100%', height: '100%' }}>
      <line x1="120" y1="22" x2="60"  y2="60" stroke="rgba(0,255,136,0.4)" strokeDasharray="2 3" />
      <line x1="120" y1="22" x2="180" y2="60" stroke={flash ? '#ff3355' : 'rgba(217,77,255,0.4)'} strokeDasharray="2 3" />

      <rect x="80" y="6"  width="80" height="22" stroke="#00ff88" fill="rgba(0,255,136,0.05)" />
      <text x="120" y="20" fill="#00ff88" textAnchor="middle" fontFamily="DM Mono" fontSize="9" letterSpacing="0.1em">PARENT $500</text>

      <rect x="20" y="60" width="80" height="22" stroke="rgba(255,255,255,0.2)" fill="#11151d" />
      <text x="60" y="74" fill="#e8ecf0" textAnchor="middle" fontFamily="DM Mono" fontSize="9" letterSpacing="0.1em">child·a $200</text>

      <rect x="140" y="60" width="80" height="22" stroke={flash ? '#ff3355' : 'rgba(255,255,255,0.2)'} fill="#11151d" />
      <text x="180" y="74" fill={flash ? '#ff3355' : '#e8ecf0'} textAnchor="middle" fontFamily="DM Mono" fontSize="9" letterSpacing="0.1em">
        {flash ? '✕ EXCEEDS' : 'child·b $400'}
      </text>
    </svg>
  )
}

const CARDS = [
  {
    num: '01', tag: 'ONCHAIN', mag: false,
    title: 'Trustless\nAnchor program',
    desc: "Limits live in an onchain PDA. Even our own backend can't sign over them. Other SDKs check rules in their server — we check yours in Solana.",
    visual: <BlocklistVisual />,
  },
  {
    num: '02', tag: 'GRANULAR', mag: true,
    title: 'Per‑vendor\ndaily caps',
    desc: 'Set a separate ceiling for any address or protocol. Block one vendor instantly without touching another. Drainers never get a second swing.',
    visual: <VendorBars />,
  },
  {
    num: '03', tag: '5:00 WINDOW', mag: false,
    title: 'Telegram\nhuman‑in‑the‑loop',
    desc: 'Anything above the threshold pings Telegram. A 5‑minute window, two buttons, full ed25519 receipt. Slack & Discord same wire.',
    visual: <HitlVisual />,
  },
  {
    num: '04', tag: 'NESTED', mag: true,
    title: 'Multi‑agent\nhierarchy',
    desc: "A parent agent funds N children. Children are bounded by the parent's envelope onchain. No child can outspend the org. Verifiable, recursive.",
    visual: <HierarchyVisual />,
  },
]

export default function Differentiators() {
  return (
    <section className="section" id="features">
      <div className="container">
        <div>
          <div className="eyebrow">What makes OnLeash different</div>
          <h2 className="section-title">
            Everything you need.<br />
            <span style={{ color: 'var(--mint)' }}>Nothing you don't.</span>
          </h2>
          <p className="section-sub">
            Onchain enforcement, granular caps, human-in-the-loop approvals, and
            multi-agent hierarchy — all four in a single SDK, shipping on Solana.
          </p>
        </div>

        <div className="diff-grid">
          {CARDS.map((c, i) => (
            <div className="diff-card" key={i}>
              <div className={`num${c.mag ? ' mag' : ''}`}>{c.num} · {c.tag}</div>
              <h3 className="title" style={{ whiteSpace: 'pre-line' }}>{c.title}</h3>
              <p className="desc">{c.desc}</p>
              <div className="visual">{c.visual}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
