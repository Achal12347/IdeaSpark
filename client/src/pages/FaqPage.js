import React from "react";
import MarketingLayout from "../components/MarketingLayout";
import "../styles/LandingPage.css";

const FaqPage = () => {
  return (
    <MarketingLayout>
      <section className="page-hero">
        <span className="eyebrow">FAQ</span>
        <h1>Answers to the most common questions.</h1>
        <p>
          Learn how IdeaSpark supports founders, investors, and community
          programs.
        </p>
      </section>

      <section className="page-section">
        <div className="faq-grid">
          <div className="page-card">
            <h3>Who can join IdeaSpark?</h3>
            <p>
              Anyone with an idea or a desire to invest, mentor, or collaborate
              can join and build a profile.
            </p>
          </div>
          <div className="page-card">
            <h3>Is there a free plan?</h3>
            <p>
              Yes. The Starter plan includes idea validation tools and community
              feedback at no cost.
            </p>
          </div>
          <div className="page-card">
            <h3>How do investor introductions work?</h3>
            <p>
              You can share progress with vetted investors and request meetings
              when you reach traction milestones.
            </p>
          </div>
          <div className="page-card">
            <h3>Can universities run hackathons?</h3>
            <p>
              Yes. IdeaSpark includes hackathon tools for event setup,
              submissions, and judging.
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default FaqPage;
