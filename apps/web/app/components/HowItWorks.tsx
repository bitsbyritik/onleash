export function HowItWorks() {
  return (
    <section className="hiw">
      <div className="container">
        <div className="section-eyebrow">HOW IT WORKS</div>
        <div className="section-head">
          <div>THREE STEPS TO A</div>
          <div>
            <span style={{ color: "var(--accent)" }}>LEASHED</span> AGENT
          </div>
        </div>
        <div className="hiw-steps">
          <div className="hiw-step">
            <div className="step-num">01</div>
            <div className="step-title">REGISTER YOUR WALLET</div>
            <p className="step-body">
              Add your agent&apos;s public key in the dashboard. We never see your
              private key — it stays in your infrastructure.
            </p>
            <div className="step-code">
              <span className="token-cmt">{"// Only this goes to OnLeash"}</span>
              {"\n"}
              <span className="token-kw">const</span>
              {" wallet = "}
              <span className="token-kw">await</span>
              {" leash."}
              <span className="token-prop">register</span>
              {"({"}
              {"\n  "}
              <span className="token-prop">publicKey</span>
              {": "}
              <span className="token-str">&apos;Gh7k...9pQm&apos;</span>
              {","}
              {"\n  "}
              <span className="token-prop">label</span>
              {": "}
              <span className="token-str">&apos;trading-agent&apos;</span>
              {","}
              {"\n})"}
            </div>
          </div>
          <div className="hiw-step">
            <div className="step-num">02</div>
            <div className="step-title">DEFINE YOUR POLICY</div>
            <p className="step-body">
              Set daily caps, per-vendor limits, blocklists, and approval
              thresholds. Update anytime — takes effect instantly.
            </p>
            <div className="step-policy">
              {[
                ["dailyCap", "$10.00"],
                ["perTransfer", "$2.00"],
                ["threshold", "$5.00"],
                ["blocklist", "1 address"],
                ["allowedTokens", "SOL, USDC"],
              ].map(([k, v]) => (
                <div key={k} className="policy-row">
                  <span className="policy-key">{k}</span>
                  <span className="policy-val">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hiw-step">
            <div className="step-num">03</div>
            <div className="step-title">WRAP YOUR AGENT</div>
            <p className="step-body">
              One import. Every transaction is checked against your policy
              before signing — blocked, approved, or flagged automatically.
            </p>
            <div className="step-code">
              <span className="token-cmt">{"// Drop-in replacement for your RPC call"}</span>
              {"\n"}
              <span className="token-kw">const</span>
              {" result = "}
              <span className="token-kw">await</span>
              {" leash."}
              <span className="token-prop">send</span>
              {"({"}
              {"\n  "}
              <span className="token-prop">to</span>
              {": recipient,"}
              {"\n  "}
              <span className="token-prop">amount</span>
              {": 10.00,"}
              {"\n  "}
              <span className="token-prop">token</span>
              {": "}
              <span className="token-str">&apos;USDC&apos;</span>
              {","}
              {"\n})"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
