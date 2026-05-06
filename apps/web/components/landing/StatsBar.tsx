'use client'

import { useState, useEffect, useRef } from 'react'

const STATS = [
  { number: 4,   prefix: '',  suffix: '',   label: 'Features CloakedAgent lacks' },
  { number: 0,   prefix: '$', suffix: '',   label: 'Daily cap by default (no OnLeash)' },
  { number: 3,   prefix: '',  suffix: 'ms', label: 'Policy check latency', static: true },
  { number: 100, prefix: '',  suffix: '%',  label: 'Onchain enforcement — trustless' },
]

function useCountUp(target: number, duration: number, start: boolean) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.floor(eased * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [start, target, duration])
  return value
}

function StatCell({ stat, started }: { stat: typeof STATS[0]; started: boolean }) {
  const value = useCountUp(stat.number, 1000, started && !stat.static)
  const display = stat.static ? stat.number : value

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRight: '1px solid var(--border)',
      gap: 4,
      padding: '0 24px',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--accent)', lineHeight: 1 }}>
        {stat.prefix}{display}{stat.suffix}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-3)', textAlign: 'center', maxWidth: 120 }}>
        {stat.label}
      </div>
    </div>
  )
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { setStarted(true); obs.disconnect() } },
      { threshold: 0.4 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        height: 88,
        width: '100%',
      }}
    >
      <div
        className="l-stats-grid"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          height: '100%',
        }}
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            style={{ borderRight: i === STATS.length - 1 ? 'none' : '1px solid var(--border)' }}
          >
            <StatCell stat={s} started={started} />
          </div>
        ))}
      </div>
    </div>
  )
}
