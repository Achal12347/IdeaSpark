import React from 'react';
import '../styles/WeeklyStats.css';

export default function WeeklyStats() {
  return (
    <div className="weekly-stats-page">
      <h1>📊 Weekly Stats</h1>
      <div className="stats-overview">
        <div className="stat-item">
          <h3>Ideas Posted</h3>
          <p>5</p>
        </div>
        <div className="stat-item">
          <h3>Views Received</h3>
          <p>127</p>
        </div>
        <div className="stat-item">
          <h3>Likes Gained</h3>
          <p>23</p>
        </div>
        <div className="stat-item">
          <h3>Comments</h3>
          <p>8</p>
        </div>
      </div>
      <div className="stats-chart">
        <p>Weekly performance chart would go here.</p>
      </div>
    </div>
  );
}
