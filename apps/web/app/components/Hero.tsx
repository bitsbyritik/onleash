const CODE_LINES = [
  { n: 1, tokens: [["kw","import"],["id"," { LeashWallet } "],["kw","from"],["str"," '@onleash/sdk'"]] },
  { n: 2, tokens: [] },
  { n: 3, tokens: [["kw","const"],["id"," leash = "],["kw","new"],["id"," LeashWallet({"]] },
  { n: 4, tokens: [["id","  keypair,              "],["cmt","// stays on your server"]] },
  { n: 5, tokens: [["id","  apiKey: process.env."],["prop","ONLEASH_API_KEY"],["id",","]] },
  { n: 6, tokens: [["id","  policy: {"]] },
  { n: 7, tokens: [["id","    dailyCap:           "],["num","10_000_000"],["cmt","  // $10/day"]] },
  { n: 8, tokens: [["id","    approvalThreshold:   "],["num","5_000_000"],["cmt","  // $5 → human"]] },
  { n: 9, tokens: [["id","    blocklist: ["],["str","'8xKj...mNp'"],["id","],"]] },
  { n: 10, tokens: [["id","  }"]] },
  { n: 11, tokens: [["id","})"]] },
  { n: 12, tokens: [] },
  { n: 13, tokens: [["kw","const"],["id"," result = "],["kw","await"],["id"," leash."],["prop","send"],["id","({"]] },
  { n: 14, tokens: [["id","  to:     vendorAddress,"]] },
  { n: 15, tokens: [["id","  amount: "],["num","3_000_000"],["id",","]] },
  { n: 16, tokens: [["id","  token:  "],["str","'USDC'"],["id",","]] },
  { n: 17, tokens: [["id","})"]] },
  { n: 18, tokens: [] },
  { n: 19, tokens: [["cmt","// result.status:"]] },
  { n: 20, tokens: [["cmt","// 'success' | 'blocked' | 'pending_approval'"]] },
  { n: 21, tokens: [["id","console."],["prop","log"],["id","(result.status)"]] },
];

function Terminal() {
  return (
    <div className="terminal">
      <div className="terminal-bar">
        <div className="term-dots">
          <div className="term-dot" style={{ background: "#ff5f57" }} />
          <div className="term-dot" style={{ background: "#ffbd2e" }} />
          <div className="term-dot" style={{ background: "#28ca41" }} />
        </div>
        <span className="term-title">agent.ts</span>
      </div>
      <div className="terminal-body">
        {CODE_LINES.map((line) => (
          <div key={line.n} style={{ display: "flex" }}>
            <span className="ln">{line.n}</span>
            <div style={{ whiteSpace: "pre" }}>
              {line.tokens.map(([cls, txt], i) => (
                <span key={i} className={`token-${cls}`}>{txt}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="terminal-status">
        <div className="term-status-l">
          <div className="term-green-dot" />
          DEVNET
        </div>
        <div className="term-status-r">3ms</div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <div>
            <div className="eyebrow">SOLANA · AGENT · INFRASTRUCTURE</div>
            <h1>
              <div>YOUR AGENT</div>
              <div className="accent-text">HAS A WALLET.</div>
              <div>NOTHING IS</div>
              <div>STOPPING IT.</div>
            </h1>
            <p className="hero-sub">
              OnLeash wraps any Solana wallet with programmable spend controls.
              Daily caps. Blocklists. Human approval flows. Backed onchain.
            </p>
            <div className="cta-row">
              <button className="btn-primary">GET STARTED FREE</button>
              <button className="btn-ghost">VIEW DOCS →</button>
            </div>
            <div className="trust-signals">
              {[
                "2,000+ devs in Solana Agent Kit ecosystem",
                "Zero custody — private keys never leave your server",
                "Onchain enforcement — Anchor program, not just an API",
              ].map((t) => (
                <div key={t} className="trust-item">
                  <span className="trust-dot" />
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div className="terminal-wrapper">
            <Terminal />
          </div>
        </div>
      </div>
    </section>
  );
}
