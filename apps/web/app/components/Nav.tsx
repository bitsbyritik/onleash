"use client";

import { useState } from "react";
import { Logo } from "./Logo";

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="nav">
        <div className="container">
          <div className="nav-inner">
            <Logo />
            <div className="nav-links">
              <a href="#" className="nav-link">Docs</a>
              <a href="#pricing" className="nav-link">Pricing</a>
              <a href="#" className="nav-link">GitHub</a>
              <button className="nav-cta">GET STARTED</button>
            </div>
            <button
              className="hamburger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>
      {menuOpen && (
        <div className="mobile-menu" onClick={() => setMenuOpen(false)}>
          <a href="#" className="nav-link">Docs</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#" className="nav-link">GitHub</a>
          <button className="nav-cta">GET STARTED</button>
        </div>
      )}
    </>
  );
}
