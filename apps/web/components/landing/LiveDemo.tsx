'use client'

import { useState, useEffect } from 'react'

type SceneLine = { t: number; k: 'cmd' | 'dim' | 'ok' | 'warn' | 'err' | 'mag'; s: string }
type PolicyItem = { k: string; v: string; bad?: boolean; good?: boolean }

const SCENES = [
  {
    id: 'blocklist', label: 'Blocklist', num: '01',
    outcome: 'BLOCKED', outcomeClass: 's-block',
    title: 'Drainer address blocked instantly',
    policy: [
      { k: 'BLOCKLIST',  v: '4vLi…drainer', bad: true },
      { k: 'DAILY CAP',  v: '$100' },
      { k: 'VENDOR CAP', v: '$25'  },
      { k: 'HITL @',     v: '$50'  },
    ] as PolicyItem[],
    lines: [
      { t: 0.0, k: 'cmd', s: '$ wallet.send({ to: "4vLi...drainer", amount: 30 })' },
      { t: 0.9, k: 'dim', s: '→ pre‑check policy v1.4.2 (PDA 7gXq…4mJp)' },
      { t: 1.5, k: 'dim', s: '→ rule[1] BLOCKLIST … match' },
      { t: 2.1, k: 'err', s: '✕ PolicyError: address on blocklist' },
      { t: 2.4, k: 'err', s: '  reason  = blocklist_hit' },
      { t: 2.6, k: 'err', s: '  vendor  = 4vLi…drainer' },
      { t: 2.9, k: 'dim', s: '  logged  → policy_violations#28491' },
      { t: 3.2, k: 'dim', s: '  duration 18ms · zero gas' },
    ] as SceneLine[],
  },
  {
    id: 'cap', label: 'Daily cap', num: '02',
    outcome: 'BLOCKED', outcomeClass: 's-block',
    title: 'Daily ceiling enforced onchain',
    policy: [
      { k: 'DAILY CAP',   v: '$100' },
      { k: 'SPENT TODAY', v: '$87.40', bad: true },
      { k: 'REMAINING',   v: '$12.60' },
      { k: 'RESET (UTC)', v: '00:00'  },
    ] as PolicyItem[],
    lines: [
      { t: 0.0, k: 'cmd', s: '$ wallet.send({ to: jupAg, amount: 40 })' },
      { t: 0.7, k: 'dim', s: '→ get_spend(today) = $87.40 / $100' },
      { t: 1.3, k: 'dim', s: '→ rule[3] DAILY_CAP … 87.40 + 40 > 100' },
      { t: 2.0, k: 'err', s: '✕ PolicyError: would exceed daily cap' },
      { t: 2.3, k: 'err', s: '  cap     = 100 USDC' },
      { t: 2.5, k: 'err', s: '  attempt = +40 USDC' },
      { t: 2.8, k: 'dim', s: '→ anchor[execute_transfer] never invoked' },
      { t: 3.2, k: 'dim', s: '  saved   = 0.00012 SOL gas' },
    ] as SceneLine[],
  },
  {
    id: 'hitl', label: 'Telegram HITL', num: '03',
    outcome: 'APPROVED', outcomeClass: 's-ok',
    title: 'Human approves over‑threshold spend',
    policy: [
      { k: 'HITL @',   v: '$50' },
      { k: 'AMOUNT',   v: '$60', bad: true },
      { k: 'CHANNEL',  v: '@OnLeashBot' },
      { k: 'WINDOW',   v: '5:00' },
    ] as PolicyItem[],
    lines: [
      { t: 0.0, k: 'cmd',  s: '$ wallet.send({ to: 8aZK, amount: 60 })' },
      { t: 0.7, k: 'warn', s: '⚠ above HITL threshold ($50) → request' },
      { t: 1.3, k: 'dim',  s: '→ approval#a4f1c2 created · sha256 hash' },
      { t: 1.7, k: 'mag',  s: '→ telegram fire · chat_id ••8431' },
      { t: 2.4, k: 'dim',  s: '  polling status… 0:03' },
      { t: 3.0, k: 'dim',  s: '  polling status… 0:06' },
      { t: 3.6, k: 'ok',   s: '✓ user "morgan" tapped APPROVE' },
      { t: 4.0, k: 'ok',   s: '✓ anchor[execute_transfer] confirmed' },
      { t: 4.3, k: 'ok',   s: '  sig    5xKj9bM2rA…8aPq' },
      { t: 4.5, k: 'dim',  s: '  slot   340118298' },
    ] as SceneLine[],
  },
  {
    id: 'tree', label: 'Multi‑agent tree', num: '04',
    outcome: 'PARENT BLOCKS', outcomeClass: 's-parent',
    title: "Child can't outspend its parent",
    policy: [
      { k: 'PARENT CAP',   v: '$500' },
      { k: 'PARENT SPENT', v: '$420' },
      { k: 'CHILD·B CAP',  v: '$400', bad: true },
      { k: 'ATTEMPT',      v: '$90'  },
    ] as PolicyItem[],
    lines: [
      { t: 0.0, k: 'cmd', s: '$ child_b.send({ to: meteorPool, amount: 90 })' },
      { t: 0.8, k: 'dim', s: '→ child_b own cap … pass ($340/$400)' },
      { t: 1.5, k: 'dim', s: '→ walk parent chain … parent_pda 9hLm' },
      { t: 2.1, k: 'dim', s: '→ parent.spent_today = $420 / $500' },
      { t: 2.7, k: 'mag', s: '→ child + parent envelope: 420 + 90 > 500' },
      { t: 3.3, k: 'err', s: '✕ HierarchyError: parent envelope exhausted' },
      { t: 3.6, k: 'err', s: '  parent = 9hLm…2vQr' },
      { t: 3.9, k: 'dim', s: '  bound  = bottom‑up onchain (no spoof)' },
    ] as SceneLine[],
  },
]

const CLS_MAP: Record<string, string> = { cmd: 't-cmd', dim: 't-dim', ok: 't-ok', warn: 't-warn', err: 't-err', mag: 't-mag' }
const OUTCOME_COLOR: Record<string, string> = { 's-ok': 'var(--mint)', 's-block': 'var(--danger)', 's-parent': 'var(--magenta)', 's-hitl': 'var(--warn)' }

function DemoTerminal({ scene, runKey }: { scene: typeof SCENES[0]; runKey: number }) {
  const [t, setT] = useState(0)

  useEffect(() => {
    setT(0)
    let raf: number
    const start = performance.now()
    const loop = (now: number) => {
      const s = (now - start) / 1000
      setT(s)
      if (s < 8) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [runKey, scene.id])

  return (
    <div className="terminal">
      <div className="terminal-head">
        <span className="t-dots"><span /><span /><span /></span>
        <span>~/onleash · scene {scene.num} · {scene.label}</span>
        <span style={{ color: 'var(--mint)' }}>● REC</span>
      </div>
      {scene.lines.map((l, i) => {
        if (l.t > t) return null
        const localT = t - l.t
        const charsTotal = Math.floor(localT / 0.012)
        const isTyping = scene.lines.findIndex(x => x.t + 0.5 > t) === i
        const text = (charsTotal < l.s.length && isTyping) ? l.s.slice(0, charsTotal) : l.s
        return (
          <div className="t-line" key={i}>
            <span className={CLS_MAP[l.k]}>{text}</span>
          </div>
        )
      })}
      {(scene.lines[scene.lines.length - 1]?.t ?? 0) > t - 0.5 && <span className="t-cursor" />}
    </div>
  )
}

export default function DemoSection() {
  const [active, setActive] = useState(0)
  const [runKey, setRunKey] = useState(0)
  const scene = SCENES[active]!

  useEffect(() => {
    const id = setTimeout(() => setActive(a => (a + 1) % SCENES.length), 7400)
    return () => clearTimeout(id)
  }, [active, runKey])

  return (
    <section className="section" id="demo">
      <div className="container">
        <div>
          <div className="eyebrow mag">Live demo · 4 scenes</div>
          <h2 className="section-title">
            Watch it block,<br />then watch it ship.
          </h2>
          <p className="section-sub">
            Four states, every layer of the stack: pre‑check, onchain, human‑in‑the‑loop, hierarchical.
            Click a scene or let it auto‑run.
          </p>
        </div>

        <div className="demo-shell">
          <div className="demo-scenes">
            {SCENES.map((s, i) => (
              <button
                key={s.id}
                className={`scene-tab${i === active ? ' active' : ''}`}
                onClick={() => { setActive(i); setRunKey(k => k + 1) }}
              >
                <span className="s-num">{s.num}</span>
                <span className="s-label">{s.label}</span>
                {i === active && (
                  <span className={`s-outcome ${s.outcomeClass}`}>{s.outcome}</span>
                )}
              </button>
            ))}
            <div style={{ flex: 1, padding: 18, fontFamily: 'var(--mono), monospace', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.15em' }}>
              CYCLE · 7.4s<br />
              ENV · DEVNET
            </div>
          </div>

          <div className="demo-stage">
            <DemoTerminal scene={scene} runKey={active * 100 + runKey} />
            <div className="demo-side">
              <div className="side-block">
                <div className="side-label">Active policy</div>
                {scene.policy.map((p, i) => (
                  <div className="policy-row" key={i}>
                    <span className="k">{p.k}</span>
                    <span className={`v${p.bad ? ' bad' : p.good ? ' good' : ''}`}>{p.v}</span>
                  </div>
                ))}
              </div>

              <div className="side-block" style={{ borderColor: OUTCOME_COLOR[scene.outcomeClass] }}>
                <div className="side-label">Outcome</div>
                <div style={{
                  fontFamily: 'var(--display), "Bebas Neue", sans-serif',
                  fontSize: 28, lineHeight: 1, letterSpacing: '0.005em',
                  color: OUTCOME_COLOR[scene.outcomeClass],
                  marginTop: 6, textTransform: 'uppercase',
                }}>
                  {scene.outcome}
                </div>
                <div style={{ marginTop: 8, fontFamily: 'var(--mono), monospace', fontSize: 11, color: 'var(--ink-dim)' }}>
                  {scene.title}
                </div>
              </div>

              <button className="replay-btn" onClick={() => setRunKey(k => k + 1)}>
                ↻ Replay scene
                <span style={{ color: 'var(--mint)' }}>●</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
