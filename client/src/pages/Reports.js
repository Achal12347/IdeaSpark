import React from 'react';
import '../styles/Reports.css';

export default function Reports() {
  return (
    <div className="reports-page">
      <h1>📋 Reports</h1>
      <div className="reports-overview">
        <div className="report-item">
          <h3>User Activity Report</h3>
          <p>Generate reports on user engagement and activity.</p>
          <button className="report-btn">Generate Report</button>
        </div>
        <div className="report-item">
          <h3>Idea Performance Report</h3>
          <p>Analyze idea views, likes, and comments.</p>
          <button className="report-btn">Generate Report</button>
        </div>
        <div className="report-item">
          <h3>Investment Tracking Report</h3>
          <p>Track investments and pitches.</p>
          <button className="report-btn">Generate Report</button>
        </div>
      </div>
    </div>
  );
}
