import React, { useEffect, useState } from "react";
import apiRequest from "../services/api";
import "../styles/appPageTheme.css";
import "../styles/Reports.css";

export default function Reports() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await apiRequest("/api/analytics");
        setAnalytics(data);
      } catch (error) {
        console.error("Error loading analytics:", error);
      }
    };
    loadAnalytics();
  }, []);

  const handleGenerateReport = () => {
    if (!analytics) return;
    const now = new Date().toLocaleString();
    const totalInvestment = analytics.totalInvestment || 0;
    const totalConnections = analytics.totalConnections || 0;

    const html = `
      <html>
        <head>
          <title>IdeaSpark Report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 32px; }
            h1 { margin: 0 0 6px; font-size: 24px; }
            h2 { margin: 24px 0 8px; font-size: 18px; }
            .meta { color: #6b7280; font-size: 12px; }
            .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
            .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; }
            .card h3 { margin: 0 0 6px; font-size: 12px; color: #6b7280; text-transform: uppercase; }
            .card p { margin: 0; font-size: 18px; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>IdeaSpark Report</h1>
          <div class="meta">Generated on ${now}</div>

          <div class="grid">
            <div class="card"><h3>Total Users</h3><p>${analytics.totalUsers}</p></div>
            <div class="card"><h3>Total Ideas</h3><p>${analytics.totalIdeas}</p></div>
            <div class="card"><h3>Total Investors</h3><p>${analytics.totalInvestors}</p></div>
            <div class="card"><h3>Total Investment</h3><p>$${Number(totalInvestment).toLocaleString()}</p></div>
            <div class="card"><h3>Total Connections</h3><p>${totalConnections}</p></div>
            <div class="card"><h3>Total Comments</h3><p>${analytics.totalComments}</p></div>
          </div>

          <h2>Top Users</h2>
          <table>
            <thead><tr><th>User</th><th>Ideas</th><th>Views</th></tr></thead>
            <tbody>
              ${analytics.topUsers?.length ? analytics.topUsers.map((user) => `<tr><td>${user.name || user.email || "User"}</td><td>${user.ideaCount}</td><td>${user.totalViews || 0}</td></tr>`).join("") : `<tr><td colspan="3">No data</td></tr>`}
            </tbody>
          </table>

          <h2>Top Ideas</h2>
          <table>
            <thead><tr><th>Idea</th><th>Views</th><th>Rating</th></tr></thead>
            <tbody>
              ${analytics.topIdeas?.length ? analytics.topIdeas.map((idea) => `<tr><td>${idea.title}</td><td>${idea.views || 0}</td><td>${idea.averageRating ? idea.averageRating.toFixed(1) : "N/A"}</td></tr>`).join("") : `<tr><td colspan="3">No data</td></tr>`}
            </tbody>
          </table>
        </body>
      </html>`;

    const reportWindow = window.open("", "_blank");
    if (!reportWindow) return;
    reportWindow.document.write(html);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
  };

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
            <button className="report-btn" onClick={handleGenerateReport}>Generate Report</button>
          </div>
          <div className="report-item app-card">
            <h3>Idea Performance Report</h3>
            <p>Analyze idea views, likes, and comments.</p>
            <button className="report-btn" onClick={handleGenerateReport}>Generate Report</button>
          </div>
          <div className="report-item app-card">
            <h3>Investment Tracking Report</h3>
            <p>Track investments and pitches.</p>
            <button className="report-btn" onClick={handleGenerateReport}>Generate Report</button>
          </div>
        </div>
      </div>
    </div>
  );
}


