"use client";

import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { UserButton, Show } from "@clerk/nextjs";

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
              <div className="nav-auth">
                <Show when="signed-out">
                  <a href="/sign-in" className="nav-link nav-link-sign">Sign in</a>
                  <a href="/sign-up" className="nav-cta">GET STARTED</a>
                </Show>
                <Show when="signed-in">
                  <a href="/dashboard" className="nav-link nav-link-sign">Dashboard</a>
                  <UserButton />
                </Show>
              </div>
              <button
                type="button"
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
        <div className="mobile-menu">
          <button
            className="mobile-menu-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <span /><span />
          </button>

          <div className="mobile-menu-links">
            {LINKS.map((l) => (
              <a key={l.label} href={l.href} className="mobile-link" onClick={() => setMenuOpen(false)}>
                {l.label}
              </a>
            ))}
          </div>

          <div className="mobile-menu-cta">
            <a href="/sign-up" className="mobile-cta-btn" onClick={() => setMenuOpen(false)}>
              GET STARTED
            </a>
            <a href="/sign-in" className="mobile-sign-btn" onClick={() => setMenuOpen(false)}>
              Sign in
            </a>
          </div>
        </div>
      )}
    </>
  );
}
