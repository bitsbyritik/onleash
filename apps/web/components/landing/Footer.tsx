export default function FooterSection() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="word">
              <span style={{ color: 'var(--ink-dim)' }}>On</span>
              <span className="accent">Leash</span>
            </div>
            <p>Spend control for AI agents on Solana. Trustless, demoable, shipping.</p>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#demo">Live demo</a></li>
              <li><a href="#code">SDK</a></li>
              <li><a href="#hitl">Telegram HITL</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Developers</h4>
            <ul>
              <li><a href="#">npm @onleash/sdk</a></li>
              <li><a href="#">Anchor program</a></li>
              <li><a href="#">README</a></li>
              <li><a href="#">Devnet console</a></li>
              <li><a href="#">Status · 99.98%</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Channels</h4>
            <ul>
              <li><a href="#">@OnLeashBot</a></li>
              <li><a href="#">github.com/onleash</a></li>
              <li><a href="#">twitter / x</a></li>
              <li><a href="#">discord</a></li>
              <li><a href="#">hello@onleash.dev</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 OnLeash Labs</span>
          <span>Built on Solana</span>
          <span>v1.4.2 · pda 7gXq…4mJp</span>
        </div>
      </div>
    </footer>
  )
}
