import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTrendingIdeas } from "../services/ideaService";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";
import IdeaCard from "../components/IdeaCard";
import "../styles/appPageTheme.css";
import "../styles/TrendingIdeas.css";

export default function TrendingIdeas() {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [trendingIdeas, setTrendingIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(
    /\/api\/?$/,
    ""
  );

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

  useEffect(() => {
    if (authLoading || !currentUser) return;
    loadTrendingIdeas();
  }, [authLoading, currentUser]);

  useEffect(() => {
    if (authLoading || !currentUser) return;
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socket.on("ideasUpdated", loadTrendingIdeas);
    return () => socket.disconnect();
  }, [authLoading, currentUser, socketUrl]);

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
              <IdeaCard
                key={idea._id}
                idea={idea}
                variant="user"
                className="app-card"
                onClick={() => navigate(`/idea/${idea._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


