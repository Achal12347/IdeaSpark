import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout";
import "../styles/LandingPage.css";

const LandingPage = () => {
  return (
    <MarketingLayout>
      <section className="hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow">Optimize growth</span>
          <h1>Streamline bold ideas into real-world impact.</h1>
          <p>
            IdeaSpark is a collaboration and funding platform where innovators,
            startups, and investors build momentum together. Validate ideas,
            assemble teams, and stay on track with a clear, measurable roadmap.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="primary-btn">
              Try it free
            </Link>
            <Link to="/features" className="ghost-btn">
              Explore features
            </Link>
          </div>
          <div className="hero-metrics">
            <div>
              <h3>12k+</h3>
              <p>Ideas validated</p>
            </div>
            <div>
              <h3>3.4x</h3>
              <p>Faster team matching</p>
            </div>
            <div>
              <h3>850+</h3>
              <p>Investor introductions</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="hero-preview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="preview-card">
            <div className="preview-header">
              <div className="preview-avatar"></div>
              <div>
                <p className="preview-title">Welcome back, Achal</p>
                <p className="preview-subtitle">Monday, Jan 12, 2026</p>
              </div>
              <div className="preview-pill">Growth</div>
            </div>
            <div className="preview-metrics">
              <div>
                <p>Active ideas</p>
                <h4>48</h4>
              </div>
              <div>
                <p>Team matches</p>
                <h4>16</h4>
              </div>
              <div>
                <p>Pitch views</p>
                <h4>312</h4>
              </div>
            </div>
            <div className="preview-chart">
              <span style={{ height: "40%" }}></span>
              <span style={{ height: "65%" }}></span>
              <span style={{ height: "45%" }}></span>
              <span style={{ height: "80%" }}></span>
              <span style={{ height: "55%" }}></span>
            </div>
            <div className="preview-actions">
              <button className="primary-btn">Review pitch</button>
              <button className="ghost-btn">View dashboard</button>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Everything you need to move from spark to scale.</h2>
          <p>
            Manage ideation, validation, collaboration, and investor readiness in
            one unified workspace.
          </p>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Idea validation</h3>
            <p>Structured feedback loops, scorecards, and expert reviews.</p>
          </div>
          <div className="feature-card">
            <h3>Team formation</h3>
            <p>Match with builders, designers, and growth partners instantly.</p>
          </div>
          <div className="feature-card">
            <h3>Investor room</h3>
            <p>Track interest, schedule demos, and share pitch materials.</p>
          </div>
          <div className="feature-card">
            <h3>Hackathon hub</h3>
            <p>Run competitions, manage submissions, and showcase winners.</p>
          </div>
          <div className="feature-card">
            <h3>Momentum analytics</h3>
            <p>Monitor traction, engagement, and measurable milestones.</p>
          </div>
          <div className="feature-card">
            <h3>Community channels</h3>
            <p>Private spaces for mentors, investors, and founding teams.</p>
          </div>
        </div>
        <div className="section-actions">
          <Link to="/explore" className="ghost-btn">
            View live ideas
          </Link>
        </div>
      </section>

      <section className="section split">
        <div className="split-content">
          <h2>How IdeaSpark works</h2>
          <p>
            Move through a guided workflow that keeps teams aligned and investors
            informed.
          </p>
          <ul className="workflow-list">
            <li>
              <span>01</span>
              <div>
                <h4>Publish your idea</h4>
                <p>Start with a structured brief and problem statement.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h4>Validate quickly</h4>
                <p>Collect feedback, run surveys, and refine your solution.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h4>Pitch to investors</h4>
                <p>Share traction, milestones, and a clear funding plan.</p>
              </div>
            </li>
          </ul>
        </div>
        <div className="split-card">
          <h3>Built for ambitious teams</h3>
          <p>
            From student founders to funded startups, IdeaSpark scales with your
            growth.
          </p>
          <div className="split-tags">
            <span>Startup studios</span>
            <span>University programs</span>
            <span>Angel networks</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Designed for every stage</h2>
          <p>Pick the track that matches your goals today and grow tomorrow.</p>
        </div>
        <div className="stage-grid">
          <div className="stage-card">
            <h3>Ideation</h3>
            <p>Capture, sort, and validate early concepts.</p>
          </div>
          <div className="stage-card">
            <h3>Acceleration</h3>
            <p>Coordinate teams, deliver milestones, and prepare pitches.</p>
          </div>
          <div className="stage-card">
            <h3>Investment</h3>
            <p>Show traction, manage investor updates, and close the round.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <div>
          <h2>Ready to launch your next breakthrough?</h2>
          <p>Join the builders shaping the future of ideas and innovation.</p>
        </div>
        <div className="cta-actions">
          <Link to="/signup" className="primary-btn">
            Get started
          </Link>
          <Link to="/contact" className="ghost-btn">
            Talk to us
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default LandingPage;
