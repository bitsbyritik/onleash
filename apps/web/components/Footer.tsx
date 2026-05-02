import { Logo } from "./Logo";

const NAV_COLS = [
  {
    heading: "Product",
    links: ["Dashboard", "Docs", "SDK", "Pricing", "Changelog"],
  },
  {
    heading: "Resources",
    links: ["GitHub", "Status", "Blog", "Security", "Solana Docs"],
  },
  {
    heading: "Company",
    links: ["About", "Twitter / X", "Discord", "Contact"],
  },
];

const SOLANA_LOGO = (
  <svg width="16" height="14" viewBox="0 0 100 88" fill="none">
    <path d="M9.88 63.4L28.3 81.84a5.47 5.47 0 003.86 1.6h57.64a1.37 1.37 0 00.97-2.34L72.35 62.66a5.47 5.47 0 00-3.86-1.6H10.85a1.37 1.37 0 00-.97 2.34z" fill="#9945FF"/>
    <path d="M9.88 24.6L28.3 6.16A5.47 5.47 0 0132.16 4.56h57.64a1.37 1.37 0 01.97 2.34L72.35 25.34a5.47 5.47 0 01-3.86 1.6H10.85a1.37 1.37 0 01-.97-2.34z" fill="#03E1FF"/>
    <path d="M72.35 43.53L90.77 25.1a1.37 1.37 0 00-.97-2.34H32.16a5.47 5.47 0 00-3.86 1.6L9.88 42.8a1.37 1.37 0 00.97 2.34h57.64a5.47 5.47 0 003.86-1.6z" fill="#00FFA3"/>
  </svg>
);

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-gradient-top" />
      <div className="container">

        <div className="footer-body">
          <div className="footer-brand">
            <Logo />
            <p className="footer-tagline">
              Programmable spend controls for AI agents on Solana.
              Caps, blocklists, and human approval — in one SDK.
            </p>
            <div className="footer-badge">
              {SOLANA_LOGO}
              <span>Built on Solana</span>
            </div>
          </div>

          {NAV_COLS.map((col) => (
            <div key={col.heading} className="footer-col">
              <div className="footer-col-heading">{col.heading}</div>
              {col.links.map((l) => (
                <a key={l} href="#" className="footer-link">{l}</a>
              ))}
            </div>
          ))}
        </div>

        <div className="footer-bar">
          <div className="footer-bar-left">
            © 2026 OnLeash, Inc. · All rights reserved
          </div>
          <div className="footer-bar-right">
            <a href="#" className="footer-bar-link">Privacy</a>
            <a href="#" className="footer-bar-link">Terms</a>
            <a href="#" className="footer-bar-link">Cookies</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
