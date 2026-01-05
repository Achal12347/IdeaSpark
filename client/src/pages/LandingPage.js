import React from "react";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1>Welcome to IdeaSpark</h1>
        <p>Innovation & Startup Brainstorm Hub</p>
        <button className="cta-button">Get Started</button>
      </header>

      <section className="features">
        <h2>Features</h2>
        <ul>
          <li>Share your innovative ideas</li>
          <li>Form teams & collaborate</li>
          <li>Real-time chat & discussion</li>
          <li>Participate in hackathons</li>
          <li>Connect with investors</li>
        </ul>
      </section>

      <footer className="landing-footer">
        <p>© 2026 IdeaSpark | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default LandingPage;
