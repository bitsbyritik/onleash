const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="18" width="18" height="2" rx="1" />
        <rect x="3" y="4" width="12" height="2" rx="1" />
        <line x1="21" y1="5" x2="21" y2="15" />
        <polyline points="17 9 21 5 25 9" />
      </svg>
    ),
    title: "Daily spend caps",
    desc: "Hard limits on how much your agent moves per day. Resets at UTC midnight.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="1" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
        <circle cx="16" cy="16" r="3" />
      </svg>
    ),
    title: "Per-vendor limits",
    desc: "Cap spending per recipient address. Different limits for different vendors.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    title: "Blocklist / allowlist",
    desc: "Permanently ban addresses or lock your agent to an approved vendor list only.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    title: "Human-in-the-loop",
    desc: "Telegram and Slack alerts for transactions above your threshold. 5-minute window.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Full audit log",
    desc: "Every attempt recorded — blocked, approved, rejected, expired. Full trail.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    title: "Onchain enforcement",
    desc: "Policy backed by Solana Anchor program. Trustless. No server required to enforce.",
  },
];

export function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-eyebrow reveal">FEATURES</div>
        <div className="section-head reveal">
          <div>EVERY CONTROL</div>
          <div>YOUR AGENT NEEDS</div>
        </div>
        <div className="features-grid reveal">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-cell">
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
