import React, { useState, useEffect } from 'react';
import { fetchTrendingIdeas } from '../services/ideaService';
import { useAuth } from '../context/AuthContext';
import '../styles/TrendingIdeas.css';

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
        console.error('Error loading trending ideas:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTrendingIdeas();
  }, [authLoading, currentUser]);

  if (loading) {
    return <div className="trending-loading">Loading trending ideas...</div>;
  }

  return (
    <div className="trending-page">
      <h1>🔥 Trending Ideas</h1>
      {trendingIdeas.length === 0 ? (
        <p className="no-trending">No trending ideas at the moment.</p>
      ) : (
        <div className="trending-list">
          {trendingIdeas.map((idea) => (
            <div key={idea._id} className="trending-card">
              <h3>{idea.title}</h3>
              <p>{idea.description}</p>
              <div className="trending-stats">
                <span>👀 {idea.views || 0}</span>
                <span>⭐ {idea.likes || 0}</span>
                <span>💬 {idea.comments || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
