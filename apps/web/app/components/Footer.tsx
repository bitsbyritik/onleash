import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <Logo />
            <div className="footer-tagline">Put your AI agent on a leash.</div>
          </div>
          <div className="footer-links">
            {["Docs", "GitHub", "Pricing", "Status", "Twitter"].map((l) => (
              <a key={l} href="#" className="footer-link">
                {l}
              </a>
            ))}
          </div>
          <div className="footer-right">
            <div>© 2026 OnLeash</div>
            <div className="solana-tag">
              <svg width="14" height="12" viewBox="0 0 100 88" fill="none">
                <path
                  d="M9.88 63.4L28.3 81.84a5.47 5.47 0 003.86 1.6h57.64a1.37 1.37 0 00.97-2.34L72.35 62.66a5.47 5.47 0 00-3.86-1.6H10.85a1.37 1.37 0 00-.97 2.34z"
                  fill="#9945FF"
                />
                <path
                  d="M9.88 24.6L28.3 6.16A5.47 5.47 0 0132.16 4.56h57.64a1.37 1.37 0 01.97 2.34L72.35 25.34a5.47 5.47 0 01-3.86 1.6H10.85a1.37 1.37 0 01-.97-2.34z"
                  fill="#03E1FF"
                />
                <path
                  d="M72.35 43.53L90.77 25.1a1.37 1.37 0 00-.97-2.34H32.16a5.47 5.47 0 00-3.86 1.6L9.88 42.8a1.37 1.37 0 00.97 2.34h57.64a5.47 5.47 0 003.86-1.6z"
                  fill="#00FFA3"
                />
              </svg>
              Built for Solana
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
