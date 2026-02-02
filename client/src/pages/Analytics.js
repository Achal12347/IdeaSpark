import { useState, useEffect } from "react";
import apiRequest from "../services/api";
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

  if (!analytics) return <div className="analytics-loading">Loading analytics...</div>;

  return (
    <div className="analytics-page">
      <h2>📊 Analytics Dashboard</h2>
      <div className="analytics-metrics">
        <div className="metric-card">
          <h3>Total Ideas</h3>
          <p>{analytics.totalIdeas}</p>
        </div>
        <div className="metric-card">
          <h3>Total Users</h3>
          <p>{analytics.totalUsers}</p>
        </div>
        <div className="metric-card">
          <h3>Total Comments</h3>
          <p>{analytics.totalComments}</p>
        </div>
        <div className="metric-card">
          <h3>Average Rating</h3>
          <p>{analytics.averageRating?.toFixed(1) || 'N/A'}</p>
        </div>
      </div>
      <div className="analytics-trending">
        <h3>🔥 Trending Ideas</h3>
        <ul className="trending-list">
          {analytics.trendingIdeas?.map((idea) => (
            <li key={idea._id} className="trending-item">
              {idea.title} - Rating: {idea.averageRating?.toFixed(1)} ({idea.totalRatings} ratings)
            </li>
          )) || <li className="no-trending">No trending ideas</li>}
        </ul>
      </div>
    </div>
  );
}
