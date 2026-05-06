const PLANS = [
  {
    name: 'FREE',
    price: '$0',
    features: [
      { check: true,  text: '1 agent wallet' },
      { check: true,  text: '100 transfers/month' },
      { check: true,  text: 'SDK access (open source)' },
      { check: false, text: 'Dashboard UI' },
      { check: false, text: 'Telegram / Slack HITL' },
      { check: false, text: 'Audit log export' },
    ],
    featured: false,
  },
  {
    name: 'PRO',
    price: '$29',
    features: [
      { check: true,  text: '5 agent wallets' },
      { check: true,  text: 'Unlimited transfers' },
      { check: true,  text: 'Full dashboard' },
      { check: true,  text: 'Telegram HITL alerts' },
      { check: true,  text: '90-day audit log' },
      { check: true,  text: 'Per-vendor limits' },
      { check: false, text: 'Slack integration' },
    ],
    featured: true,
  },
  {
    name: 'TEAM',
    price: '$99',
    features: [
      { check: true, text: 'Unlimited wallets' },
      { check: true, text: 'Unlimited transfers' },
      { check: true, text: 'Full dashboard' },
      { check: true, text: 'Telegram + Slack' },
      { check: true, text: 'Unlimited audit log' },
      { check: true, text: 'Audit log CSV export' },
      { check: true, text: 'Multi-agent hierarchy' },
    ],
    featured: false,
  },
]

function PricingCard({ plan }: { plan: typeof PLANS[0] }) {
  return (
    <div className={`l-pricing-card${plan.featured ? ' l-pricing-card-featured' : ''}`} style={{ position: 'relative' }}>
      {plan.featured && (
        <div style={{
          position: 'absolute',
          top: -12,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--void)',
          border: '1px solid var(--accent)',
          fontFamily: 'var(--font-ui)',
          fontSize: 10,
          color: 'var(--accent)',
          letterSpacing: '0.4em',
          padding: '4px 14px',
          borderRadius: 2,
          whiteSpace: 'nowrap',
        }}>
          MOST POPULAR
        </div>
      )}

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--text-1)', marginBottom: 8 }}>
        {plan.name}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 64, color: 'var(--text-1)', lineHeight: 1 }}>
          {plan.price}
        </span>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-3)' }}>/mo</span>
      </div>

      <div style={{ height: 1, width: 48, background: 'var(--accent)', margin: '20px 0' }} />

      <ul style={{ listStyle: 'none', marginBottom: 32, display: 'flex', flexDirection: 'column' }}>
        {plan.features.map(f => (
          <li
            key={f.text}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              lineHeight: 2.2,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span style={{ color: f.check ? 'var(--accent)' : 'var(--text-3)', fontSize: 12 }}>
              {f.check ? '✓' : '–'}
            </span>
            <span style={{ color: f.check ? 'var(--text-2)' : 'var(--text-3)' }}>{f.text}</span>
          </li>
        ))}
      </ul>

      <a
        href="/sign-up"
        className={plan.featured ? 'l-pricing-btn-primary' : 'l-pricing-btn-ghost'}
      >
        GET STARTED
      </a>
    </div>
  )
}

export default function Pricing() {
  return (
    <section id="pricing" style={{ background: 'var(--void)', padding: '120px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: 20 }}>
          PRICING
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 56px)', lineHeight: 1.0, marginBottom: 16 }}>
          <div>PAY FOR WHAT</div>
          <div>YOUR AGENTS USE</div>
        </h2>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-3)', marginBottom: 64 }}>
          All plans include SDK access forever free. No key custody. Cancel anytime.
        </p>

        <div
          className="l-pricing-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {PLANS.map(p => <PricingCard key={p.name} plan={p} />)}
        </div>

        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 32 }}>
          All plans · SDK forever free · No key custody · Cancel anytime
        </div>
      </div>
    </section>
  )
}
