import React from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout";
import "../styles/LandingPage.css";

const PricingPage = () => {
  return (
    <MarketingLayout>
      <section className="page-hero">
        <span className="eyebrow">Pricing</span>
        <h1>Flexible plans for builders and investors.</h1>
        <p>
          Start free, then upgrade as your team grows and investor activity
          scales.
        </p>
      </section>

      <section className="page-section">
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Starter</h3>
            <p className="pricing-price">Free</p>
            <ul>
              <li>Idea templates and validation</li>
              <li>Community feedback</li>
              <li>Basic analytics</li>
            </ul>
            <Link to="/signup" className="ghost-btn">
              Get started
            </Link>
          </div>
          <div className="pricing-card">
            <h3>Growth</h3>
            <p className="pricing-price">$29 / month</p>
            <ul>
              <li>Team workspaces</li>
              <li>Investor room</li>
              <li>Advanced analytics</li>
            </ul>
            <Link to="/signup" className="primary-btn">
              Start free trial
            </Link>
          </div>
          <div className="pricing-card">
            <h3>Enterprise</h3>
            <p className="pricing-price">Custom</p>
            <ul>
              <li>Accelerator programs</li>
              <li>Dedicated support</li>
              <li>Custom reporting</li>
            </ul>
            <Link to="/contact" className="ghost-btn">
              Contact sales
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default PricingPage;
