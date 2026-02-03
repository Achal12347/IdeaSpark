import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/LandingPage.css";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Features", to: "/features" },
  { label: "Pricing", to: "/pricing" },
  { label: "Contact", to: "/contact" },
  { label: "FAQ", to: "/faq" },
];

export default function MarketingLayout({ children }) {
  const location = useLocation();

  return (
    <div className="landing-shell">
      <header className="landing-nav">
        <Link to="/" className="brand">
          <span className="brand-mark">IS</span>
          <span className="brand-name">IdeaSpark</span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <Link className="ghost-btn" to="/login">
            Login
          </Link>
          <Link className="primary-btn" to="/signup">
            Get Started
          </Link>
        </div>
      </header>

      <main className="landing-main">{children}</main>

      <footer className="landing-footer">
        <div className="footer-brand">
          <span className="brand-mark">IS</span>
          <div>
            <p className="footer-title">IdeaSpark</p>
            <p className="footer-subtitle">
              A collaboration and funding hub for builders, startups, and
              investors.
            </p>
          </div>
        </div>
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/features">Features</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/faq">FAQ</Link>
        </div>
      </footer>
    </div>
  );
}
