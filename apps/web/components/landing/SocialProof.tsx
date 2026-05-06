export default function SocialProof() {
  return (
    <section style={{ background: 'var(--base)', padding: '80px 0' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 140,
          color: 'rgba(0,255,136,0.05)',
          lineHeight: 0.8,
          marginBottom: -40,
          display: 'block',
        }}>
          &ldquo;
        </span>

        <blockquote style={{
          fontFamily: 'var(--font-prose)',
          fontStyle: 'italic',
          fontSize: 26,
          color: 'var(--text-1)',
          maxWidth: 680,
          margin: '0 auto 24px',
          lineHeight: 1.6,
          position: 'relative',
          zIndex: 1,
        }}>
          You don&apos;t want to give a credit card to an agent without a lot of control.
        </blockquote>

        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-3)' }}>
          — Privy × Stripe Panel, DAS NYC 2026
        </div>

        <div
          className="l-social-stats"
          style={{ display: 'flex', justifyContent: 'center', gap: 0, marginTop: 64, alignItems: 'center' }}
        >
          <div style={{ padding: '0 64px', textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 56, color: 'var(--accent)', display: 'block' }}>35%</span>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-2)' }}>of incoming Solana devs</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-3)' }}>are building agentic products</div>
          </div>

          <div
            className="l-social-divider"
            style={{ width: 1, height: 60, background: 'var(--border)', alignSelf: 'center', flexShrink: 0 }}
          />

          <div style={{ padding: '0 64px', textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 56, color: 'var(--accent)', display: 'block' }}>2,000+</span>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-2)' }}>developers</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-3)' }}>in Solana Agent Kit ecosystem</div>
          </div>
        </div>
      </div>
    </section>
  )
}
