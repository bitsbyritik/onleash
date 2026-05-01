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
          <div>
            <div className="step-num">01</div>
            <div className="step-title">REGISTER YOUR WALLET</div>
            <p className="step-body">
              Add your agent&apos;s public key in the dashboard. We never see your
              private key — it stays in your infrastructure.
            </p>
            <div className="step-code">
              <span className="token-cmt">{"// Only this goes to OnLeash"}</span>
              {"\n"}
              <span className="token-prop">publicKey</span>
              {": "}
              <span className="token-str">&apos;Gh7k...9pQm&apos;</span>
            </div>
          </div>
          <div>
            <div className="step-num">02</div>
            <div className="step-title">DEFINE YOUR POLICY</div>
            <p className="step-body">
              Set daily caps, per-vendor limits, blocklists, and approval
              thresholds. Update anytime — takes effect instantly.
            </p>
            <div className="step-policy">
              {[
                ["dailyCap", "$10.00"],
                ["threshold", "$5.00"],
                ["blocklist", "1 address"],
              ].map(([k, v]) => (
                <div key={k} className="policy-row">
                  <span className="policy-key">{k}</span>
                  <span className="policy-val">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="step-num">03</div>
            <div className="step-title">WRAP YOUR AGENT</div>
            <p className="step-body">
              One import. Your agent&apos;s wallet is now leashed. Every transaction
              is checked before signing.
            </p>
            <div className="step-code">
              <span className="token-kw">await</span>
              {" leash."}
              <span className="token-prop">send</span>
              {"({ to, amount, token })"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
