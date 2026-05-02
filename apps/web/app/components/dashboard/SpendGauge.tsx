export default function SpendGauge({ spend, cap }: { spend: number; cap: number }) {
  const pct   = Math.min((spend / cap) * 100, 100);
  const color = pct < 60 ? "var(--success)" : pct < 85 ? "var(--pending)" : "var(--blocked)";

  return (
    <div className="gauge-card">
      <div className="gauge-label">TODAY&apos;S SPEND</div>
      <div className="gauge-amount" style={{ color }}>
        ${spend.toFixed(2)}
        <span className="gauge-cap"> / ${cap.toFixed(2)} CAP</span>
      </div>
      <div className="gauge-track">
        <div className="gauge-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="gauge-meta">
        <span>{pct.toFixed(0)}% used</span>
        <span>${(cap - spend).toFixed(2)} remaining</span>
      </div>
    </div>
  );
}
