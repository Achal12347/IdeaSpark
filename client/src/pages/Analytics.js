import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../services/api";
import "../styles/appPageTheme.css";
import "../styles/Analytics.css";

const number = (value) => Number(value || 0);

export default function Analytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [ideaSort, setIdeaSort] = useState("views");
  const [userSort, setUserSort] = useState("ideas");

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

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const totalInvestment = number(analytics?.totalInvestment);
  const totalConnections = number(analytics?.totalConnections);
  const averageRating = number(analytics?.averageRating);
  const investmentPerConnection = totalConnections
    ? Math.round(totalInvestment / totalConnections)
    : 0;
  const pulseScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (number(analytics?.activeInvestors) + number(analytics?.newUsersWeek) + averageRating * 10) /
          3
      )
    )
  );

  const categories = useMemo(() => {
    const items = Array.isArray(analytics?.ideasByCategory) ? analytics.ideasByCategory : [];
    return [...items].sort((a, b) => number(b.count) - number(a.count));
  }, [analytics]);

  const categoryTotal = categories.reduce((sum, item) => sum + number(item.count), 0);

  const topIdeas = useMemo(() => {
    const items = Array.isArray(analytics?.topIdeas) ? [...analytics.topIdeas] : [];
    if (ideaSort === "rating") {
      items.sort((a, b) => number(b.averageRating) - number(a.averageRating));
    } else {
      items.sort((a, b) => number(b.views) - number(a.views));
    }
    return items.filter((idea) => {
      if (!normalizedSearch) return true;
      return (idea.title || "").toLowerCase().includes(normalizedSearch);
    });
  }, [analytics, ideaSort, normalizedSearch]);

  const topUsers = useMemo(() => {
    const items = Array.isArray(analytics?.topUsers) ? [...analytics.topUsers] : [];
    if (userSort === "views") {
      items.sort((a, b) => number(b.totalViews) - number(a.totalViews));
    } else {
      items.sort((a, b) => number(b.ideaCount) - number(a.ideaCount));
    }
    return items.filter((user) => {
      if (!normalizedSearch) return true;
      const label = `${user.name || ""} ${user.email || ""}`.toLowerCase();
      return label.includes(normalizedSearch);
    });
  }, [analytics, userSort, normalizedSearch]);

  if (!analytics) {
    return (
      <div className="app-page analytics-page">
        <div className="app-container">
          <div className="analytics-loading">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page analytics-page">
      <div className="app-container">
        <div className="app-header analytics-header">
          <div>
            <h2 className="app-title">Analytics Dashboard</h2>
            <p className="app-subtitle">Deeper insights with ranked trends and category distribution.</p>
          </div>
          <div className="analytics-toolbar">
            <input
              className="app-input"
              placeholder="Search ideas or users"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button className="app-button-secondary" onClick={() => navigate("/reports")}>
              Open Reports
            </button>
          </div>
        </div>

        <section className="analytics-hero app-card">
          <div>
            <p className="analytics-hero-label">Platform Pulse</p>
            <h3>{pulseScore}%</h3>
            <p className="analytics-hero-subtitle">Based on weekly growth, investor activity, and overall rating.</p>
          </div>
          <div className="analytics-hero-bar">
            <span style={{ width: `${pulseScore}%` }} />
          </div>
          <div className="analytics-hero-meta">
            <span>Investment / Connection: ${investmentPerConnection.toLocaleString()}</span>
            <span>Average Rating: {averageRating ? averageRating.toFixed(1) : "N/A"}</span>
          </div>
        </section>

        <div className="analytics-metrics app-grid">
          <div className="metric-card app-card">
            <h3>Total Ideas</h3>
            <p>{number(analytics.totalIdeas).toLocaleString()}</p>
          </div>
          <div className="metric-card app-card">
            <h3>Total Users</h3>
            <p>{number(analytics.totalUsers).toLocaleString()}</p>
          </div>
          <div className="metric-card app-card">
            <h3>Total Investors</h3>
            <p>{number(analytics.totalInvestors).toLocaleString()}</p>
          </div>
          <div className="metric-card app-card">
            <h3>Total Investment</h3>
            <p>${totalInvestment.toLocaleString()}</p>
          </div>
          <div className="metric-card app-card">
            <h3>Total Connections</h3>
            <p>{totalConnections.toLocaleString()}</p>
          </div>
          <div className="metric-card app-card">
            <h3>Total Comments</h3>
            <p>{number(analytics.totalComments).toLocaleString()}</p>
          </div>
          <div className="metric-card app-card">
            <h3>New Users (7d)</h3>
            <p>{number(analytics.newUsersWeek).toLocaleString()}</p>
          </div>
          <div className="metric-card app-card">
            <h3>New Ideas (7d)</h3>
            <p>{number(analytics.newIdeasWeek).toLocaleString()}</p>
          </div>
        </div>

        <div className="analytics-split">
          <section className="app-card analytics-trending">
            <h3>Ideas by Category</h3>
            {categories.length === 0 ? (
              <p className="no-trending">No category data available.</p>
            ) : (
              <div className="category-bars">
                {categories.map((category) => {
                  const count = number(category.count);
                  const width = categoryTotal ? Math.max(8, Math.round((count / categoryTotal) * 100)) : 0;
                  return (
                    <div key={category._id || "uncategorized"} className="category-row">
                      <div className="category-meta">
                        <span>{category._id || "Uncategorized"}</span>
                        <span>{count} ideas</span>
                      </div>
                      <div className="category-track">
                        <span style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="app-card analytics-trending">
            <div className="panel-head">
              <h3>Top Ideas</h3>
              <select className="app-select" value={ideaSort} onChange={(event) => setIdeaSort(event.target.value)}>
                <option value="views">Sort by views</option>
                <option value="rating">Sort by rating</option>
              </select>
            </div>
            <ul className="trending-list">
              {topIdeas.length ? (
                topIdeas.map((idea) => (
                  <li key={idea._id} className="trending-item">
                    <strong>{idea.title}</strong>
                    <span>{number(idea.views)} views</span>
                    <span>{idea.averageRating ? idea.averageRating.toFixed(1) : "N/A"} rating</span>
                  </li>
                ))
              ) : (
                <li className="no-trending">No matching ideas.</li>
              )}
            </ul>
          </section>
        </div>

        <div className="analytics-split">
          <section className="app-card analytics-trending">
            <div className="panel-head">
              <h3>Top Users</h3>
              <select className="app-select" value={userSort} onChange={(event) => setUserSort(event.target.value)}>
                <option value="ideas">Sort by ideas</option>
                <option value="views">Sort by views</option>
              </select>
            </div>
            <ul className="trending-list">
              {topUsers.length ? (
                topUsers.map((user) => (
                  <li key={user.userId} className="trending-item">
                    <strong>{user.name || user.email || "User"}</strong>
                    <span>{number(user.ideaCount)} ideas</span>
                    <span>{number(user.totalViews)} total views</span>
                  </li>
                ))
              ) : (
                <li className="no-trending">No matching users.</li>
              )}
            </ul>
          </section>

          <section className="app-card analytics-trending">
            <h3>Trending Ideas</h3>
            <ul className="trending-list">
              {analytics.trendingIdeas?.length ? (
                analytics.trendingIdeas.map((idea) => (
                  <li key={idea._id} className="trending-item">
                    <strong>{idea.title}</strong>
                    <span>{idea.author?.name || "Unknown author"}</span>
                    <span>{idea.averageRating ? idea.averageRating.toFixed(1) : "N/A"} rating</span>
                  </li>
                ))
              ) : (
                <li className="no-trending">No trending ideas available.</li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
