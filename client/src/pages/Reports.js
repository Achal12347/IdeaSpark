import { useEffect, useMemo, useState } from "react";
import apiRequest from "../services/api";
import "../styles/appPageTheme.css";
import "../styles/Reports.css";

const reportTitles = {
  platform: "Platform Health Report",
  engagement: "Engagement Report",
  investment: "Investment and Funding Report",
};

const number = (value) => Number(value || 0);

export default function Reports() {
  const [analytics, setAnalytics] = useState(null);
  const [reportType, setReportType] = useState("platform");
  const [sections, setSections] = useState({
    summary: true,
    topUsers: true,
    topIdeas: true,
    categories: true,
  });
  const [generatedAt, setGeneratedAt] = useState("");

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

  const summaryRows = useMemo(() => {
    if (!analytics) return [];
    return [
      ["Total Users", number(analytics.totalUsers)],
      ["Total Ideas", number(analytics.totalIdeas)],
      ["Total Investors", number(analytics.totalInvestors)],
      ["Total Investment", `$${number(analytics.totalInvestment).toLocaleString()}`],
      ["Total Connections", number(analytics.totalConnections)],
      ["Total Comments", number(analytics.totalComments)],
      ["New Users (7d)", number(analytics.newUsersWeek)],
      ["New Ideas (7d)", number(analytics.newIdeasWeek)],
      ["Active Investors (7d)", number(analytics.activeInvestors)],
      ["Average Rating", analytics.averageRating ? analytics.averageRating.toFixed(1) : "N/A"],
    ];
  }, [analytics]);

  const buildCsv = () => {
    if (!analytics) return "";
    const lines = [];
    lines.push(["Report", reportTitles[reportType]]);
    lines.push(["Generated At", new Date().toLocaleString()]);
    lines.push([]);

    if (sections.summary) {
      lines.push(["Summary"]);
      summaryRows.forEach(([label, value]) => lines.push([label, value]));
      lines.push([]);
    }

    if (sections.topUsers) {
      lines.push(["Top Users"]);
      lines.push(["Name", "Ideas", "Views"]);
      (analytics.topUsers || []).forEach((user) => {
        lines.push([
          user.name || user.email || "User",
          number(user.ideaCount),
          number(user.totalViews),
        ]);
      });
      lines.push([]);
    }

    if (sections.topIdeas) {
      lines.push(["Top Ideas"]);
      lines.push(["Title", "Views", "Rating"]);
      (analytics.topIdeas || []).forEach((idea) => {
        lines.push([
          idea.title,
          number(idea.views),
          idea.averageRating ? idea.averageRating.toFixed(1) : "N/A",
        ]);
      });
      lines.push([]);
    }

    if (sections.categories) {
      lines.push(["Ideas by Category"]);
      lines.push(["Category", "Count"]);
      (analytics.ideasByCategory || []).forEach((category) => {
        lines.push([category._id || "Uncategorized", number(category.count)]);
      });
    }

    return lines
      .map((line) =>
        line
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
  };

  const handleDownloadCsv = () => {
    const csv = buildCsv();
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ideaspark-${reportType}-report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateReport = () => {
    if (!analytics) return;
    const now = new Date().toLocaleString();

    const topUsersTable = (analytics.topUsers || [])
      .map(
        (user) =>
          `<tr><td>${user.name || user.email || "User"}</td><td>${number(user.ideaCount)}</td><td>${number(user.totalViews)}</td></tr>`
      )
      .join("");

    const topIdeasTable = (analytics.topIdeas || [])
      .map(
        (idea) =>
          `<tr><td>${idea.title}</td><td>${number(idea.views)}</td><td>${idea.averageRating ? idea.averageRating.toFixed(1) : "N/A"}</td></tr>`
      )
      .join("");

    const categoriesTable = (analytics.ideasByCategory || [])
      .map(
        (category) =>
          `<tr><td>${category._id || "Uncategorized"}</td><td>${number(category.count)}</td></tr>`
      )
      .join("");

    const html = `
      <html>
        <head>
          <title>${reportTitles[reportType]}</title>
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
          <h1>${reportTitles[reportType]}</h1>
          <div class="meta">Generated on ${now}</div>

          ${
            sections.summary
              ? `
            <h2>Summary</h2>
            <div class="grid">
              ${summaryRows
                .slice(0, 6)
                .map(([label, value]) => `<div class="card"><h3>${label}</h3><p>${value}</p></div>`)
                .join("")}
            </div>
          `
              : ""
          }

          ${
            sections.topUsers
              ? `
            <h2>Top Users</h2>
            <table>
              <thead><tr><th>User</th><th>Ideas</th><th>Views</th></tr></thead>
              <tbody>${topUsersTable || `<tr><td colspan="3">No data</td></tr>`}</tbody>
            </table>
          `
              : ""
          }

          ${
            sections.topIdeas
              ? `
            <h2>Top Ideas</h2>
            <table>
              <thead><tr><th>Idea</th><th>Views</th><th>Rating</th></tr></thead>
              <tbody>${topIdeasTable || `<tr><td colspan="3">No data</td></tr>`}</tbody>
            </table>
          `
              : ""
          }

          ${
            sections.categories
              ? `
            <h2>Ideas by Category</h2>
            <table>
              <thead><tr><th>Category</th><th>Count</th></tr></thead>
              <tbody>${categoriesTable || `<tr><td colspan="2">No data</td></tr>`}</tbody>
            </table>
          `
              : ""
          }
        </body>
      </html>`;

    const reportWindow = window.open("", "_blank");
    if (!reportWindow) return;
    reportWindow.document.write(html);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
    setGeneratedAt(now);
  };

  if (!analytics) {
    return (
      <div className="app-page reports-page">
        <div className="app-container">
          <div className="analytics-loading">Loading reports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page reports-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h1 className="app-title">Reports</h1>
            <p className="app-subtitle">Create printable and CSV reports with selected sections.</p>
          </div>
        </div>

        <div className="reports-summary app-grid">
          {summaryRows.slice(0, 6).map(([label, value]) => (
            <div key={label} className="report-metric app-card">
              <h3>{label}</h3>
              <p>{value}</p>
            </div>
          ))}
        </div>

        <section className="report-controls app-card">
          <div className="report-control-block">
            <h3>Report Type</h3>
            <div className="report-type-row">
              {Object.entries(reportTitles).map(([key, label]) => (
                <button
                  key={key}
                  className={`chip-toggle ${reportType === key ? "active" : ""}`}
                  onClick={() => setReportType(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="report-control-block">
            <h3>Include Sections</h3>
            <div className="report-type-row">
              <button
                className={`chip-toggle ${sections.summary ? "active" : ""}`}
                onClick={() => setSections((prev) => ({ ...prev, summary: !prev.summary }))}
              >
                Summary
              </button>
              <button
                className={`chip-toggle ${sections.topUsers ? "active" : ""}`}
                onClick={() => setSections((prev) => ({ ...prev, topUsers: !prev.topUsers }))}
              >
                Top Users
              </button>
              <button
                className={`chip-toggle ${sections.topIdeas ? "active" : ""}`}
                onClick={() => setSections((prev) => ({ ...prev, topIdeas: !prev.topIdeas }))}
              >
                Top Ideas
              </button>
              <button
                className={`chip-toggle ${sections.categories ? "active" : ""}`}
                onClick={() => setSections((prev) => ({ ...prev, categories: !prev.categories }))}
              >
                Categories
              </button>
            </div>
          </div>

          <div className="report-actions">
            <button className="app-button" onClick={handleGenerateReport}>
              Generate & Print
            </button>
            <button className="app-button-secondary" onClick={handleDownloadCsv}>
              Download CSV
            </button>
          </div>

          {generatedAt ? <p className="status-note">Last generated: {generatedAt}</p> : null}
        </section>
      </div>
    </div>
  );
}
