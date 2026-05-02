const PROBLEMS = [
  {
    num: "$0",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    label: "No spend cap by default",
    sub: "ZERO GUARDRAILS",
    desc: "Your agent can drain your entire wallet in a single transaction. No limit exists unless you build it yourself — from scratch.",
  },
  {
    num: "0",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <line x1="10" y1="9" x2="8" y2="9"/>
      </svg>
    ),
    label: "No audit trail",
    sub: "ZERO VISIBILITY",
    desc: "When something goes wrong — and it will — you have no record of what your agent spent, when, or why. Forensics is impossible.",
  },
  {
    num: "∞",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    label: "No approval window",
    sub: "ZERO CONTROL",
    desc: "A looping agent or compromised tool executes thousands of transactions before you get a single ping. No pause, no review.",
  },
];

export function Problem() {
  return (
    <section className="problem" id="problem">
      <div className="container">
        <div className="problem-header reveal">
          <div className="section-eyebrow">THE PROBLEM</div>
          <h2 className="section-head">
            <span>YOU GAVE YOUR AGENT</span>
            <br />
            <span className="problem-accent">UNLIMITED ACCESS</span>
            <br />
            <span>TO REAL MONEY</span>
          </h2>
          <p className="problem-intro">
            Every AI agent framework hands your agent a live wallet with zero rails.
            That&apos;s not a feature gap — that&apos;s a liability.
          </p>
        </div>

        <div className="problem-cards reveal">
          {PROBLEMS.map((c, i) => (
            <div key={c.num} className="problem-card">
              <div className="prob-card-top">
                <div className="prob-icon-wrap">{c.icon}</div>
                <div className="prob-tag">{c.sub}</div>
              </div>
              <div className="prob-num-watermark">{c.num}</div>
              <div className="prob-label">{c.label}</div>
              <p className="prob-desc">{c.desc}</p>
              <div className="prob-index">0{i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
