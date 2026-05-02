"use client";

import { useState, useEffect } from "react";
import { Logo } from "./Logo";

const LINKS = [
  { label: "Docs", href: "#" },
  { label: "Pricing", href: "#pricing" },
  { label: "GitHub", href: "#" },
];

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="container">
          <div className="nav-inner">
            <div className="nav-left">
              <Logo />
            </div>
            <div className="nav-center">
              {LINKS.map((l) => (
                <a key={l.label} href={l.href} className="nav-link">{l.label}</a>
              ))}
            </div>
            <div className="nav-right">
              <a href="#" className="nav-link nav-link-sign">Sign in</a>
              <button className="nav-cta">GET STARTED</button>
              <button
                className={`hamburger${menuOpen ? " open" : ""}`}
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                <span /><span /><span />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-menu" onClick={() => setMenuOpen(false)}>
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className="nav-link" onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
          <button className="nav-cta" style={{ fontSize: 16, padding: "14px 32px" }} onClick={() => setMenuOpen(false)}>
            GET STARTED
          </button>
        </div>
      )}
    </>
  );
}
