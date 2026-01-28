import React, { useState, useEffect } from 'react';
import { fetchTrendingIdeas } from '../services/ideaService';

export default function TrendingIdeas() {
  const [trendingIdeas, setTrendingIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrendingIdeas = async () => {
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
  }, []);

  if (loading) {
    return <div>Loading trending ideas...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Trending Ideas</h1>
      {trendingIdeas.length === 0 ? (
        <p>No trending ideas at the moment.</p>
      ) : (
        <div>
          {trendingIdeas.map((idea) => (
            <div key={idea._id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              backgroundColor: '#fff'
            }}>
              <h3>{idea.title}</h3>
              <p>{idea.description}</p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
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
