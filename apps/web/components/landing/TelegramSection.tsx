'use client'

import { useState, useEffect } from 'react'

export default function TelegramSection() {
  const [t, setT] = useState(299)

  useEffect(() => {
    const id = setInterval(() => setT(prev => prev <= 0 ? 299 : prev - 1), 1000)
    return () => clearInterval(id)
  }, [])

  const m = Math.floor(t / 60)
  const s = String(t % 60).padStart(2, '0')

  return (
    <section className="section" id="hitl">
      <div className="container">
        <div className="tg-section-grid">
          <div className="tg-explain">
            <div className="eyebrow mag">Human‑in‑the‑loop · 5:00 window</div>
            <h3>Two taps.<br />One signed transfer.</h3>
            <p>
              Above the threshold? <em>Your phone buzzes.</em> Tap approve, the SDK
              gets a hashed token back, the Anchor program executes. Reject and
              nothing happens — onchain.
            </p>

            <div className="tg-steps">
              <div className="tg-step">
                <span className="n">01</span>
                <span className="t"><b>SDK creates approval</b> — sha‑256 of token, 5min expiry, logged in DB.</span>
              </div>
              <div className="tg-step">
                <span className="n">02</span>
                <span className="t"><b>Telegram fires</b> — agent name, amount, recipient, reason.</span>
              </div>
              <div className="tg-step">
                <span className="n">03</span>
                <span className="t"><b>SDK polls every 3s</b> — until decided or window closes.</span>
              </div>
              <div className="tg-step">
                <span className="n">04</span>
                <span className="t"><b>Anchor executes</b> — only after approve receipt is confirmed.</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', placeItems: 'center' }}>
            <div className="tg-frame">
              <div className="tg-head">
                <div className="tg-avatar">⌬</div>
                <div>
                  <div className="tg-name">@OnLeashBot</div>
                  <div className="tg-status">online · just now</div>
                </div>
              </div>

              <div className="tg-bubble">
                <div className="tg-title">🚨 Approval required</div>
                <div style={{ marginTop: 10 }}>
                  <div className="tg-row"><span className="k">Agent</span><span className="v">Trading Bot α</span></div>
                  <div className="tg-row"><span className="k">Sending</span><span className="v amount">60.00 USDC</span></div>
                  <div className="tg-row"><span className="k">To</span><span className="v">8xKj…3mNp</span></div>
                  <div className="tg-row"><span className="k">Reason</span><span className="v" style={{ color: 'var(--warn)' }}>above $50 threshold</span></div>
                  <div className="tg-row"><span className="k">Vendor</span><span className="v">JUP swap</span></div>
                </div>
                <div className="tg-timer">⏱ Expires in {m}:{s}</div>
                <div className="tg-actions">
                  <button className="tg-approve">✓ Approve</button>
                  <button className="tg-reject">✕ Reject</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
