import React from "react";
import "../styles/appPageTheme.css";
import "../styles/WeeklyStats.css";

export default function WeeklyStats() {
  return (
    <div className="app-page weekly-stats-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h1 className="app-title">Weekly Stats</h1>
            <p className="app-subtitle">A snapshot of your activity this week.</p>
          </div>
        </div>

        <div className="stats-overview app-grid">
          <div className="stat-item app-card">
            <h3>Ideas Posted</h3>
            <p>5</p>
          </div>
          <div className="stat-item app-card">
            <h3>Views Received</h3>
            <p>127</p>
          </div>
          <div className="stat-item app-card">
            <h3>Likes Gained</h3>
            <p>23</p>
          </div>
          <div className="stat-item app-card">
            <h3>Comments</h3>
            <p>8</p>
          </div>
        </div>
        <div className="stats-chart app-card">
          <p>Weekly performance chart would go here.</p>
        </div>
      </div>
    </div>
  );
}

