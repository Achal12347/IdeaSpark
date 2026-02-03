import React from "react";
import MarketingLayout from "../components/MarketingLayout";
import "../styles/LandingPage.css";

const AboutUs = () => {
  return (
    <MarketingLayout>
      <section className="page-hero">
        <span className="eyebrow">About IdeaSpark</span>
        <h1>We help bold teams turn ideas into funded ventures.</h1>
        <p>
          IdeaSpark is a collaboration and investment hub designed to connect
          founders, mentors, and investors. Our mission is to shorten the path
          from inspiration to impact with clear workflows, transparent progress,
          and community-driven momentum.
        </p>
      </section>

      <section className="page-section">
        <div className="page-grid">
          <div className="page-card">
            <h3>Our mission</h3>
            <p>
              Empower innovators to validate ideas, build teams, and reach
              funding faster.
            </p>
          </div>
          <div className="page-card">
            <h3>Our vision</h3>
            <p>
              A world where every promising idea has the support to reach real
              users and markets.
            </p>
          </div>
          <div className="page-card">
            <h3>Our values</h3>
            <p>Clarity, collaboration, and measurable progress at every stage.</p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-grid">
          <div className="page-card">
            <h3>What we offer</h3>
            <p>
              Structured idea templates, traction dashboards, investor
              introductions, and community support.
            </p>
          </div>
          <div className="page-card">
            <h3>Who we serve</h3>
            <p>Students, startup studios, accelerators, and angel networks.</p>
          </div>
          <div className="page-card">
            <h3>How we work</h3>
            <p>
              We combine analytics, mentorship, and workflow tooling to keep
              teams aligned.
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default AboutUs;
