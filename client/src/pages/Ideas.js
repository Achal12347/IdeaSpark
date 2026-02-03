import { useNavigate } from "react-router-dom";
import { useGetIdeasQuery } from "../store/apiSlice";
import "../styles/appPageTheme.css";
import "../styles/Ideas.css";

export default function Ideas() {
  const navigate = useNavigate();
  const { data: ideas = [], isLoading } = useGetIdeasQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  return (
    <div className="app-page ideas-page">
      <div className="app-container">
        <div className="app-header ideas-header">
          <div>
            <h2 className="app-title">All Ideas</h2>
            <p className="app-subtitle">Browse the latest ideas shared by the community.</p>
          </div>
          <button className="app-button" onClick={() => navigate("/add-idea")}>
            Create Post
          </button>
        </div>

        {isLoading ? (
          <div className="ideas-loading">Loading ideas...</div>
        ) : ideas.length === 0 ? (
          <div className="ideas-empty app-card">
            <h3>No ideas yet</h3>
            <p>Be the first to share an idea with the community.</p>
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
