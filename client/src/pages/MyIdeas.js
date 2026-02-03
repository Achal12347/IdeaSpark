import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyIdeas } from "../services/ideaService";
import IdeaCard from "../components/IdeaCard";
import "../styles/appPageTheme.css";
import "../styles/MyIdeas.css";

export default function MyIdeas() {
  const [ideas, setIdeas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadIdeas = async () => {
      try {
        const ideasData = await fetchMyIdeas();
        setIdeas(ideasData);
      } catch (error) {
        console.error("Error loading my ideas:", error);
      }
    };
    loadIdeas();
  }, []);

  return (
    <div className="app-page ideas-page">
      <div className="app-container">
        <div className="app-header ideas-header">
          <div>
            <h2 className="app-title">My Ideas</h2>
            <p className="app-subtitle">Track the ideas you have shared so far.</p>
          </div>
          <button className="app-button" onClick={() => navigate("/add-idea")}>
            Create Post
          </button>
        </div>

        {ideas.length === 0 ? (
          <div className="ideas-empty app-card">
            <h3>No ideas yet</h3>
            <p>Start by creating your first idea.</p>
            <button className="app-button" onClick={() => navigate("/add-idea")}>
              Create Post
            </button>
          </div>
        ) : (
          <div className="ideas-grid app-grid">
            {ideas.map((idea) => (
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
