const CARDS = [
  {
    num: '$0',
    tag: 'DAILY CAP BY DEFAULT',
    body: 'Your agent can drain your entire wallet in one transaction. No guardrail exists unless you build it yourself.',
  },
  {
    num: '0',
    tag: 'AUDIT ENTRIES BY DEFAULT',
    body: 'When something goes wrong, you have no record of what your agent spent, when, or why. The wallet is just empty.',
  },
  {
    num: '∞',
    tag: 'TRANSACTIONS NEED ZERO HUMAN APPROVAL',
    body: 'A looping agent or compromised tool executes thousands of transactions before you see your first alert.',
  },
]

export default function Problem() {
  return (
    <section id="problem" style={{ background: 'var(--base)', padding: '120px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: 20 }}>
          THE PROBLEM
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 60px)', lineHeight: 1.0, marginBottom: 64 }}>
          <div>YOU GAVE YOUR AGENT</div>
          <div style={{ color: 'var(--blocked)' }}>UNLIMITED ACCESS</div>
          <div>TO REAL MONEY</div>
        </h2>

        <div
          className="l-problem-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            background: 'var(--border)',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {CARDS.map((c) => (
            <div
              key={c.tag}
              style={{
                background: 'var(--surface)',
                padding: '48px 40px',
                position: 'relative',
                borderTop: '3px solid var(--blocked)',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 96,
                color: 'var(--blocked)',
                lineHeight: 1,
              }}>
                {c.num}
              </div>
              <div style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                color: 'var(--text-3)',
                letterSpacing: '0.3em',
                margin: '8px 0 20px',
              }}>
                {c.tag}
              </div>
              <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />
              <p style={{
                fontFamily: 'var(--font-prose)',
                fontSize: 17,
                color: 'var(--text-2)',
                lineHeight: 1.7,
              }}>
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
