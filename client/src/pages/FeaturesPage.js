import React from "react";
import MarketingLayout from "../components/MarketingLayout";
import "../styles/LandingPage.css";

const FeaturesPage = () => {
  return (
    <MarketingLayout>
      <section className="page-hero">
        <span className="eyebrow">Features</span>
        <h1>Launch faster with a full stack of startup tools.</h1>
        <p>
          Everything is designed to keep teams focused, transparent, and
          investor-ready from day one.
        </p>
      </section>

      <section className="page-section">
        <div className="page-grid">
          <div className="page-card">
            <h3>Idea workspace</h3>
            <p>Guided prompts, validation checklists, and expert feedback.</p>
          </div>
          <div className="page-card">
            <h3>Team builder</h3>
            <p>Match with talent, define roles, and track contributions.</p>
          </div>
          <div className="page-card">
            <h3>Investor updates</h3>
            <p>Share traction, financials, and progress with one link.</p>
          </div>
          <div className="page-card">
            <h3>Milestone tracking</h3>
            <p>Break plans into measurable steps and stay accountable.</p>
          </div>
          <div className="page-card">
            <h3>Hackathon tools</h3>
            <p>Run challenges, manage submissions, and showcase winners.</p>
          </div>
          <div className="page-card">
            <h3>Community insights</h3>
            <p>Discover mentors, peer feedback, and collaboration circles.</p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default FeaturesPage;
