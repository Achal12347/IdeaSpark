import React from "react";
import "../styles/appPageTheme.css";
import "../styles/Members.css";

export default function Members() {
  return (
    <div className="app-page members-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h1 className="app-title">Members</h1>
            <p className="app-subtitle">View and connect with other members.</p>
          </div>
        </div>
        <div className="app-card members-card">
          <p className="members-empty">Member directory coming soon.</p>
        </div>
      </div>
    </div>
  );
}

