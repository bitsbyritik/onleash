const PLANS = [
  {
    name: "FREE",
    price: "$0",
    featured: false,
    feats: [
      ["✓", "1 agent wallet"],
      ["✓", "100 transfers/month"],
      ["✓", "SDK access"],
      ["–", "Dashboard UI"],
      ["–", "Telegram / Slack alerts"],
      ["–", "Audit log export"],
    ],
  },
  {
    name: "PRO",
    price: "$29",
    featured: true,
    feats: [
      ["✓", "5 agent wallets"],
      ["✓", "Unlimited transfers"],
      ["✓", "Full dashboard"],
      ["✓", "Telegram HITL alerts"],
      ["✓", "90-day audit log"],
      ["–", "Slack integration"],
    ],
  },
  {
    name: "TEAM",
    price: "$99",
    featured: false,
    feats: [
      ["✓", "Unlimited wallets"],
      ["✓", "Unlimited transfers"],
      ["✓", "Full dashboard"],
      ["✓", "Telegram + Slack"],
      ["✓", "Unlimited audit log"],
      ["✓", "Audit log export (CSV)"],
    ],
  },
];

export function Pricing() {
  return (
    <section className="pricing" id="pricing">
      <div className="container">
        <div className="section-eyebrow">PRICING</div>
        <div className="section-head">
          <div>PAY FOR WHAT</div>
          <div>YOUR AGENTS USE</div>
        </div>
        <div className="pricing-cards">
          {PLANS.map((p) => (
            <div key={p.name}>
              {p.featured && (
                <div className="pricing-popular">MOST POPULAR</div>
              )}
              <div className={`pricing-card${p.featured ? " pricing-card-featured" : ""}`}>
                <div className="pricing-plan">{p.name}</div>
                <div className="pricing-price-row">
                  <span className="pricing-price">{p.price}</span>
                  <span className="pricing-per">/mo</span>
                </div>
                <div className="pricing-accent-line" />
                <ul className="pricing-features">
                  {p.feats.map(([mark, text]) => (
                    <li key={text} className="pricing-feat">
                      <span className={mark === "✓" ? "feat-check" : "feat-dash"}>
                        {mark}
                      </span>
                      <span
                        style={{
                          color:
                            mark === "–"
                              ? "var(--text-tertiary)"
                              : "var(--text-secondary)",
                        }}
                      >
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  className={p.featured ? "btn-primary btn-full" : "btn-ghost btn-full"}
                >
                  GET STARTED
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="pricing-footer">
          All plans include: SDK forever free · No wallet custody · Cancel anytime
        </div>
      </div>
    </section>
  );
}
