const PROBLEMS = [
  {
    num: "$0",
    label: "daily cap by default",
    desc: "Your agent can drain your entire wallet in a single transaction. No guardrail exists unless you build it yourself.",
  },
  {
    num: "0",
    label: "audit entries by default",
    desc: "When something goes wrong — and it will — you have no record of what your agent spent, when it spent it, or why.",
  },
  {
    num: "∞",
    label: "transactions need human sign-off",
    desc: "A looping agent or compromised tool can execute thousands of transactions before you see your first notification.",
  },
];

export function Problem() {
  return (
    <section className="problem" id="problem">
      <div className="container">
        <div className="section-eyebrow">THE PROBLEM</div>
        <div className="section-head">
          <div>YOU GAVE YOUR AGENT</div>
          <div style={{ color: "var(--blocked)" }}>UNLIMITED ACCESS</div>
          <div>TO REAL MONEY</div>
        </div>
        <div className="problem-cards">
          {PROBLEMS.map((c) => (
            <div key={c.num} className="problem-card">
              <div className="prob-num">{c.num}</div>
              <div className="prob-label">{c.label}</div>
              <div className="prob-divider" />
              <p className="prob-desc">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
