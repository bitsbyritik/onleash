"use client";

import { useState, useEffect } from "react";

export default function CountdownTimer({ initSeconds }: { initSeconds: number }) {
  const [s, setS] = useState(initSeconds);

  useEffect(() => {
    const t = setInterval(() => setS((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const m   = Math.floor(s / 60);
  const sec = s % 60;

  return (
    <span className="ap-timer" style={{ color: s < 60 ? "var(--blocked)" : "var(--pending)" }}>
      {m}:{String(sec).padStart(2, "0")}
    </span>
  );
}
