"use client";

import { useRef, MouseEvent } from "react";

const PLANS = [
  {
    name: "FREE",
    price: "$0",
    per: "/mo",
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
    per: "/mo",
    featured: true,
    feats: [
      ["✓", "5 agent wallets"],
      ["✓", "Unlimited transfers"],
      ["✓", "Full dashboard"],
      ["✓", "Telegram HITL alerts"],
      ["✓", "90-day audit log"],
      ["✓", "Slack integration"],
    ],
  },
  {
    name: "TEAM",
    price: "$99",
    per: "/mo",
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

function PricingCard({ plan }: { plan: typeof PLANS[number] }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) translateY(-8px)`;
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "";
  };

  return (
    <div
      ref={cardRef}
      className={`pricing-card${plan.featured ? " pricing-card-featured" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="pricing-badge-area">
        {plan.featured && <div className="pricing-popular">★ MOST POPULAR</div>}
      </div>
      <div className="pricing-plan">{plan.name}</div>
      <div className="pricing-price-row">
        <span className="pricing-price">{plan.price}</span>
        <span className="pricing-per">{plan.per}</span>
      </div>
      <div className="pricing-accent-line" />
      <ul className="pricing-features">
        {plan.feats.map(([mark, text]) => (
          <li key={text} className="pricing-feat">
            <span className={mark === "✓" ? "feat-check" : "feat-dash"}>{mark}</span>
            <span style={{ color: mark === "–" ? "var(--text-tertiary)" : "var(--text-secondary)" }}>
              {text}
            </span>
          </li>
        ))}
      </ul>
      <a href="/sign-up" className={plan.featured ? "btn-primary btn-full" : "btn-ghost btn-full"}>
        GET STARTED
      </a>
    </div>
  );
}

export function Pricing() {
  return (
    <section className="pricing" id="pricing">
      <div className="container">
        <div className="section-eyebrow reveal">PRICING</div>
        <div className="section-head reveal">
          <div>PAY FOR WHAT</div>
          <div>YOUR AGENTS USE</div>
        </div>
        <div className="pricing-cards reveal">
          {PLANS.map((p) => <PricingCard key={p.name} plan={p} />)}
        </div>
        <div className="pricing-footer">
          All plans include: SDK forever free · No wallet custody · Cancel anytime
        </div>
      </div>
    </section>
  );
}
