'use client'

import { useState, useEffect } from 'react'

function HeroDiagram() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let raf: number
    const start = performance.now()
    const loop = (t: number) => {
      setTick((t - start) / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const cycle     = (tick % 3.6) / 3.6
  const pulseCycle = tick % 2.4
  const scanCycle  = tick % 5

  const packets = [
    { from: 'agent',  to: 'policy', t: 0.0,  mag: false },
    { from: 'policy', to: 'chain',  t: 0.45, mag: false },
    { from: 'chain',  to: 'agent',  t: 0.78, mag: true  },
  ]

  const nodes: Record<string, { x: number; y: number; w: number; h: number }> = {
    agent:  { x: 60,  y: 80,  w: 130, h: 70 },
    policy: { x: 220, y: 175, w: 130, h: 90 },
    chain:  { x: 60,  y: 300, w: 130, h: 70 },
    tg:     { x: 235, y: 60,  w: 110, h: 50 },
  }

  const center = (n: { x: number; y: number; w: number; h: number }) => ({
    cx: n.x + n.w / 2,
    cy: n.y + n.h / 2,
  })

  const paths = [
    { from: 'agent',  to: 'policy', color: 'mint', dashed: false },
    { from: 'policy', to: 'chain',  color: 'mint', dashed: false },
    { from: 'chain',  to: 'agent',  color: 'mag',  dashed: false },
    { from: 'policy', to: 'tg',     color: 'mag',  dashed: true  },
  ]

  const checksTotal = 1284 + Math.floor(tick * 0.5)
  const latency     = 18 + Math.floor(Math.sin(tick * 0.8) * 3)

  return (
    <div className="diagram-panel">
      <div className="diagram-corners">
        <span className="tl" /><span className="tr" />
        <span className="bl" /><span className="br" />
      </div>

      <div className="dp-label">
        <span className="live-dot" /> POLICY ENGINE · LIVE
      </div>

      {/* SVG — all animated layers */}
      <svg className="diagram-svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glowMint" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glowMag" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="lineGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="haloMint" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#00ff88" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0"    />
          </radialGradient>
          <radialGradient id="haloMag" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#d94dff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#d94dff" stopOpacity="0"    />
          </radialGradient>
          <radialGradient id="ambientCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#d94dff" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#d94dff" stopOpacity="0"    />
          </radialGradient>
        </defs>

        {/* Ambient centre glow */}
        <ellipse cx="200" cy="200" rx="170" ry="150" fill="url(#ambientCenter)" />

        {/* Node halos */}
        <ellipse cx={center(nodes.agent!).cx}  cy={center(nodes.agent!).cy}  rx="95" ry="75" fill="url(#haloMint)" />
        <ellipse cx={center(nodes.policy!).cx} cy={center(nodes.policy!).cy} rx="105" ry="85" fill="url(#haloMint)" />
        <ellipse cx={center(nodes.chain!).cx}  cy={center(nodes.chain!).cy}  rx="85" ry="68" fill="url(#haloMag)"  />

        {/* Connection lines — fat glow layer */}
        {paths.map((p, i) => {
          const a = center(nodes[p.from]!)
          const b = center(nodes[p.to]!)
          const col = p.color === 'mint' ? '#00ff88' : '#d94dff'
          return (
            <line key={`fat${i}`}
              x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
              stroke={col} strokeWidth="5" strokeOpacity="0.12"
              filter="url(#lineGlow)"
              strokeDasharray={p.dashed ? '3 4' : 'none'} />
          )
        })}

        {/* Connection lines — sharp top layer */}
        {paths.map((p, i) => {
          const a = center(nodes[p.from]!)
          const b = center(nodes[p.to]!)
          const col = p.color === 'mint' ? 'rgba(0,255,136,0.55)' : 'rgba(217,77,255,0.55)'
          return (
            <line key={`line${i}`}
              x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
              stroke={col} strokeWidth="1"
              strokeDasharray={p.dashed ? '3 4' : 'none'} />
          )
        })}

        {/* Node junction dots */}
        {Object.entries(nodes).map(([key, n]) => {
          const c   = center(n)
          const col = (key === 'chain' || key === 'tg') ? '#d94dff' : '#00ff88'
          return <circle key={key} cx={c.cx} cy={c.cy} r="2.5" fill={col} opacity="0.7" />
        })}

        {/* Emanating pulse rings from agent */}
        {[0, 0.9, 1.8].map((offset, i) => {
          const p = ((pulseCycle + offset) % 2.4) / 2.4
          if (p > 0.65) return null
          const r   = 18 + p * 85
          const opa = (1 - p / 0.65) * 0.28
          return (
            <circle key={i}
              cx={center(nodes.agent!).cx} cy={center(nodes.agent!).cy}
              r={r} fill="none"
              stroke="#00ff88" strokeOpacity={opa} strokeWidth="1" />
          )
        })}

        {/* Animated packets with trails */}
        {packets.map((p, i) => {
          const a     = center(nodes[p.from]!)
          const b     = center(nodes[p.to]!)
          const local = ((cycle - p.t + 1) % 1)
          if (local > 0.32) return null
          const k    = local / 0.32
          const x    = a.cx + (b.cx - a.cx) * k
          const y    = a.cy + (b.cy - a.cy) * k
          const fill = p.mag ? '#d94dff' : '#00ff88'
          const dx   = b.cx - a.cx
          const dy   = b.cy - a.cy
          return (
            <g key={i} filter={p.mag ? 'url(#glowMag)' : 'url(#glowMint)'}>
              <circle cx={x - dx * 0.06} cy={y - dy * 0.06} r="2.5" fill={fill} opacity="0.35" />
              <circle cx={x - dx * 0.12} cy={y - dy * 0.12} r="1.5" fill={fill} opacity="0.18" />
              <circle cx={x} cy={y} r="4.5" fill={fill} />
              <circle cx={x} cy={y} r="10"  fill="none" stroke={fill} strokeOpacity="0.35" strokeWidth="1" />
            </g>
          )
        })}

        {/* HITL ping ring */}
        {cycle > 0.40 && cycle < 0.52 && (
          <circle
            cx={center(nodes.tg!).cx} cy={center(nodes.tg!).cy}
            r={10 + (cycle - 0.40) * 60}
            fill="none" stroke="#d94dff"
            strokeOpacity={1 - (cycle - 0.40) * 8}
            strokeWidth="1.5"
          />
        )}

        {/* Scan line sweep */}
        {scanCycle < 3 && (
          <line
            x1="8" y1={20 + (scanCycle / 3) * 370}
            x2="392" y2={20 + (scanCycle / 3) * 370}
            stroke="rgba(0,255,136,0.07)" strokeWidth="2"
          />
        )}
      </svg>

      {/* Node cards */}
      <div className="node-card glow-mint" style={{ position: 'absolute', left: '15%', top: '18%', width: '32.5%' }}>
        <div className="nc-label">01 · Agent</div>
        <div className="nc-name">Trading Bot α</div>
        <div className="nc-meta">cap <b>$100/d</b> · spent $42</div>
      </div>

      <div className="node-card glow-mint" style={{ position: 'absolute', left: '55%', top: '40%', width: '32.5%' }}>
        <div className="nc-label">02 · Policy</div>
        <div className="nc-name">Onchain PDA</div>
        <div className="nc-meta">5 rules · v1.4.2</div>
      </div>

      <div className="node-card glow-mag" style={{ position: 'absolute', left: '15%', top: '68%', width: '32.5%' }}>
        <div className="nc-label">03 · Solana</div>
        <div className="nc-name">execute()</div>
        <div className="nc-meta">slot {340118291 + Math.floor(tick * 2)}</div>
      </div>

      <div className="node-card" style={{ position: 'absolute', left: '58.75%', top: '13%', width: '27.5%', padding: '8px 10px' }}>
        <div className="nc-label" style={{ color: 'var(--magenta)' }}>HITL</div>
        <div className="nc-meta" style={{ marginTop: 2 }}>@OnLeashBot</div>
      </div>

      {/* Live stats bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        padding: '10px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.35), transparent)',
        fontFamily: 'var(--mono), monospace',
        gap: 4,
      }}>
        {[
          { val: checksTotal.toLocaleString(), label: 'CHECKS',  color: 'var(--mint)'    },
          { val: `${latency}ms`,               label: 'LATENCY', color: 'var(--mint)'    },
          { val: `${340118291 + Math.floor(tick * 2)}`, label: 'SLOT', color: 'var(--magenta)' },
        ].map(s => (
          <div key={s.label}>
            <div style={{ color: s.color, fontSize: 14, fontFamily: 'var(--display), sans-serif', lineHeight: 1.1, letterSpacing: '0.03em' }}>
              {s.val}
            </div>
            <div style={{ color: 'var(--ink-faint)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HeroTerminal() {
  const lines = [
    { delay: 0,   text: '$ npm i @onleash/sdk',                    kind: 'cmd'  },
    { delay: 1.0, text: 'added 1 package · 14 kB',                 kind: 'dim'  },
    { delay: 1.6, text: '$ leash init --policy strict',             kind: 'cmd'  },
    { delay: 2.4, text: '✓ policy deployed · pda 7gXq...4mJp',     kind: 'ok'   },
    { delay: 2.9, text: '✓ daily cap        $100',                  kind: 'ok'   },
    { delay: 3.1, text: '✓ vendor cap       $25',                   kind: 'ok'   },
    { delay: 3.3, text: '✓ HITL threshold   $50',                   kind: 'ok'   },
    { delay: 3.7, text: '$ wallet.send({ to, amount: 60 })',        kind: 'cmd'  },
    { delay: 4.6, text: '⚠ above threshold → routing to telegram', kind: 'warn' },
  ]

  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    let raf: number
    const start = performance.now()
    const loop = (now: number) => {
      setCycle(((now - start) / 1000) % 7)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const adjLines = lines.filter(l => l.delay <= cycle)

  return (
    <div style={{
      borderTop: '1px solid var(--line-strong)',
      paddingTop: 24, marginTop: 24,
      fontFamily: 'var(--code), "Fira Code", monospace',
      fontSize: 13, lineHeight: 1.7,
      height: 240, overflow: 'hidden',
    }}>
      {adjLines.map((l, i) => {
        const isLast = i === adjLines.length - 1
        const localT = cycle - l.delay
        const chars = Math.floor(localT / 0.018)
        const shown = isLast ? l.text.slice(0, chars) : l.text
        const cls = l.kind === 'cmd' ? 't-cmd' : l.kind === 'ok' ? 't-ok' : l.kind === 'warn' ? 't-warn' : 't-dim'
        return (
          <div key={i} className="t-line">
            <span className={cls}>{shown}</span>
            {isLast && chars < l.text.length && <span className="t-cursor" />}
          </div>
        )
      })}
    </div>
  )
}

export default function Hero() {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard?.writeText('npm i @onleash/sdk')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div>
            <div className="eyebrow">Spend control · Solana · v1.4</div>
            <h1 className="hero-headline">
              <span className="word">Put&nbsp;</span>
              <span className="word">your&nbsp;</span>
              <span className="word">agent</span><br />
              <span className="word">on&nbsp;a&nbsp;</span>
              <span className="word strike-thru accent">leash.</span>
            </h1>
            <p className="hero-tagline">
              Spend control for AI agents on Solana.{' '}
              <em>Trustless limits</em>, per‑vendor caps, and human approvals
              — enforced onchain, not by our servers.
            </p>

            <div className="hero-actions">
              <button className="copy-line" onClick={copy} aria-label="copy install command">
                <span className="prompt">$</span>
                <span>npm i @onleash/sdk</span>
                <span className="copy-ico">{copied ? '✓ COPIED' : '⧉ COPY'}</span>
              </button>
              <a className="btn btn-ghost" href="#demo">
                See it block <span className="arr">→</span>
              </a>
            </div>

            <div className="hero-meta">
              <div className="m-item"><span className="m-dot" /> 14 KB · ZERO DEPS</div>
              <div className="m-item"><span className="m-dot" /> ANCHOR · TYPESCRIPT</div>
              <div className="m-item"><span className="m-dot" /> AGENT KIT · LANGCHAIN · CREWAI</div>
            </div>

            <HeroTerminal />
          </div>

          <div>
            <HeroDiagram />
          </div>
        </div>
      </div>
    </section>
  )
}
