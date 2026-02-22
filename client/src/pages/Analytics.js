import { useState, useEffect } from "react";
import apiRequest from "../services/api";
import "../styles/appPageTheme.css";
import "../styles/Analytics.css";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await apiRequest('/api/analytics');
        setAnalytics(data);
      } catch (error) {
        console.error("Error loading analytics:", error);
      }
    };
    loadAnalytics();
  }, []);

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
        <div className="app-header">
          <div>
            <h2 className="app-title">Analytics Dashboard</h2>
            <p className="app-subtitle">High-level metrics across the platform.</p>
          </div>
        </div>

        <div className="analytics-metrics app-grid">
          <div className="metric-card app-card">
            <h3>Total Ideas</h3>
            <p>{analytics.totalIdeas}</p>
          </div>
          <div className="metric-card app-card">
            <h3>Total Users</h3>
            <p>{analytics.totalUsers}</p>
          </div>
          <div className="metric-card app-card">
            <h3>Total Investors</h3>
            <p>{analytics.totalInvestors}</p>
          </div>
          <div className="metric-card app-card">
            <h3>Total Investment</h3>
            <p>${Number(analytics.totalInvestment || 0).toLocaleString()}</p>
          </div>
          <div className="metric-card app-card">
            <h3>Total Connections</h3>
            <p>{analytics.totalConnections}</p>
          </div>
          <div className="metric-card app-card">
            <h3>Total Comments</h3>
            <p>{analytics.totalComments}</p>
          </div>
          <div className="metric-card app-card">
            <h3>New Users (7d)</h3>
            <p>{analytics.newUsersWeek || 0}</p>
          </div>
          <div className="metric-card app-card">
            <h3>New Ideas (7d)</h3>
            <p>{analytics.newIdeasWeek || 0}</p>
          </div>
          <div className="metric-card app-card">
            <h3>Active Investors (7d)</h3>
            <p>{analytics.activeInvestors || 0}</p>
          </div>
          <div className="metric-card app-card">
            <h3>Average Rating</h3>
            <p>{analytics.averageRating?.toFixed(1) || 'N/A'}</p>
          </div>
          <div className="metric-card app-card">
            <h3>Avg Ideas / User</h3>
            <p>{Number(analytics.avgIdeasPerUser || 0).toFixed(1)}</p>
          </div>
        </div>
        <div className="analytics-split">
          <div className="analytics-trending app-card">
            <h3>Trending Ideas</h3>
            <ul className="trending-list">
              {analytics.trendingIdeas?.length ? (
                analytics.trendingIdeas.map((idea) => (
                  <li key={idea._id} className="trending-item">
                    {idea.title} - Rating: {idea.averageRating?.toFixed(1)} ({idea.totalRatings} ratings)
                  </li>
                ))
              ) : (
                <li className="no-trending">No trending ideas</li>
              )}
            </ul>
          </div>
          <div className="analytics-trending app-card">
            <h3>Top Users</h3>
            <ul className="trending-list">
              {analytics.topUsers?.length ? (
                analytics.topUsers.map((user) => (
                  <li key={user.userId} className="trending-item">
                    {user.name || user.email || 'User'} - {user.ideaCount} ideas
                  </li>
                ))
              ) : (
                <li className="no-trending">No users yet</li>
              )}
            </ul>
          </div>
        </div>
        <div className="analytics-trending app-card">
          <h3>Top Ideas by Views</h3>
          <ul className="trending-list">
            {analytics.topIdeas?.length ? (
              analytics.topIdeas.map((idea) => (
                <li key={idea._id} className="trending-item">
                  {idea.title} - {idea.views} views, {idea.averageRating?.toFixed(1) || 'N/A'} rating
                </li>
              ))
            ) : (
              <li className="no-trending">No ideas yet</li>
            )}
          </ul>
        </div>
        <div className="analytics-trending app-card">
          <h3>Ideas by Category</h3>
          <ul className="trending-list">
            {analytics.ideasByCategory?.length ? (
              analytics.ideasByCategory.map((category) => (
                <li key={category._id || 'uncategorized'} className="trending-item">
                  {category._id || 'Uncategorized'} - {category.count} ideas
                </li>
              ))
            ) : (
              <li className="no-trending">No categories yet</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
