import React from "react";
import "../styles/appPageTheme.css";
import "../styles/Reports.css";

export default function Reports() {
  return (
    <div className="app-page reports-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h1 className="app-title">Reports</h1>
            <p className="app-subtitle">Generate performance summaries.</p>
          </div>
        </div>
        <div className="reports-overview app-grid">
          <div className="report-item app-card">
            <h3>User Activity Report</h3>
            <p>Generate reports on user engagement and activity.</p>
            <button className="report-btn">Generate Report</button>
          </div>
          <div className="report-item app-card">
            <h3>Idea Performance Report</h3>
            <p>Analyze idea views, likes, and comments.</p>
            <button className="report-btn">Generate Report</button>
          </div>
          <div className="report-item app-card">
            <h3>Investment Tracking Report</h3>
            <p>Track investments and pitches.</p>
            <button className="report-btn">Generate Report</button>
          </div>
        </div>
      </div>
    </div>
  );
}

