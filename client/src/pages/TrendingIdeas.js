import React, { useState, useEffect } from "react";
import { fetchTrendingIdeas } from "../services/ideaService";
import { useAuth } from "../context/AuthContext";
import "../styles/appPageTheme.css";
import "../styles/TrendingIdeas.css";

export default function TrendingIdeas() {
  const { currentUser, loading: authLoading } = useAuth();
  const [trendingIdeas, setTrendingIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !currentUser) return;

    const loadTrendingIdeas = async () => {
      setLoading(true);
      try {
        const data = await fetchTrendingIdeas();
        setTrendingIdeas(data);
      } catch (error) {
        console.error("Error loading trending ideas:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTrendingIdeas();
  }, [authLoading, currentUser]);

  return (
    <div className="app-page trending-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h1 className="app-title">Trending Ideas</h1>
            <p className="app-subtitle">Ideas gaining the most momentum.</p>
          </div>
        </div>

        {loading ? (
          <div className="trending-loading">Loading trending ideas...</div>
        ) : trendingIdeas.length === 0 ? (
          <div className="no-trending">No trending ideas at the moment.</div>
        ) : (
          <div className="trending-list">
            {trendingIdeas.map((idea) => (
              <div key={idea._id} className="trending-card app-card">
                <h3>{idea.title}</h3>
                <p>{idea.description}</p>
                <div className="trending-stats">
                  <span>Views {idea.views || 0}</span>
                  <span>Likes {idea.likes || 0}</span>
                  <span>Comments {idea.comments || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

