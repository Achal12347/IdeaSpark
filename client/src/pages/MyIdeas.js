import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyIdeas } from "../services/ideaService";
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
              <div
                key={idea._id}
                className="idea-card app-card"
                onClick={() => navigate(`/idea/${idea._id}`)}
              >
                <div className="idea-card-header">
                  <h3>{idea.title}</h3>
                </div>
                <p className="idea-description">
                  {idea.description || idea.solutionDescription || idea.problemStatement}
                </p>
                <div className="idea-tags">
                  {idea.tags?.map((tag, index) => (
                    <span key={index} className="app-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
