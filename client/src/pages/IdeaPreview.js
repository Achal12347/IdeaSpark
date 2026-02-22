import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/appPageTheme.css";
import "../styles/IdeaPreview.css";

export default function IdeaPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletedInfo, setDeletedInfo] = useState(null);

  useEffect(() => {
    const loadIdea = async () => {
      try {
        const baseUrl = process.env.REACT_APP_API_URL || "";
        const response = await fetch(`${baseUrl}/api/ideas/${id}`);
        if (response.status === 410) {
          const data = await response.json();
          setDeletedInfo({
            reason: data?.deletionReason || "",
            deletedAt: data?.deletedAt || "",
          });
          setIdea(null);
          return;
        }
        if (!response.ok) {
          throw new Error("Unable to load idea.");
        }
        const data = await response.json();
        setIdea(data);
      } catch (error) {
        console.error("Preview error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadIdea();
  }, [id]);

  if (loading) {
    return (
      <div className="app-page idea-preview-page">
        <div className="app-container">
          <div className="idea-preview-state">Loading idea preview...</div>
        </div>
      </div>
    );
  }

  if (deletedInfo) {
    return (
      <div className="app-page idea-preview-page">
        <div className="app-container">
          <div className="app-card idea-preview-state">
            <h2>Idea removed</h2>
            {deletedInfo.reason ? <p>Reason: {deletedInfo.reason}</p> : null}
            {deletedInfo.deletedAt ? (
              <p>Removed on {new Date(deletedInfo.deletedAt).toLocaleString()}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="app-page idea-preview-page">
        <div className="app-container">
          <div className="idea-preview-state">Idea not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page idea-preview-page">
      <div className="app-container">
        <div className="idea-preview-hero app-card">
          <div>
            <h1>{idea.title}</h1>
            <p>
              Created by {idea.author?.name || "Founder"} ·{" "}
              {idea.marketCategory || "General"}
            </p>
          </div>
          <div className="idea-preview-actions">
            <button className="app-button" onClick={() => navigate("/signup")}>
              Join to view full details
            </button>
            <button
              className="app-button-secondary"
              onClick={() => navigate("/login")}
            >
              Already have an account
            </button>
          </div>
        </div>

        <div className="idea-preview-grid">
          <section className="app-card">
            <h3>Problem statement</h3>
            <p className="blurred">{idea.problemStatement}</p>
          </section>
          <section className="app-card">
            <h3>Solution overview</h3>
            <p className="blurred">{idea.solutionDescription}</p>
          </section>
        </div>

        <section className="app-card idea-preview-meta">
          <div>
            <span className="meta-label">Stage</span>
            <span>{idea.stageOfIdea || "Not specified"}</span>
          </div>
          <div>
            <span className="meta-label">Target audience</span>
            <span className="blurred">{idea.targetAudience || "Not specified"}</span>
          </div>
          <div>
            <span className="meta-label">Tags</span>
            <div className="idea-preview-tags">
              {(idea.tags || []).slice(0, 4).map((tag) => (
                <span key={tag} className="app-pill">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="app-card idea-preview-cta">
          <h3>Unlock full details, collaborators, and investor activity.</h3>
          <p>Join IdeaSpark to view the full idea deck and connect directly.</p>
          <div className="idea-preview-actions">
            <button className="app-button" onClick={() => navigate("/signup")}>
              Create free account
            </button>
            <button
              className="app-button-secondary"
              onClick={() => navigate("/contact")}
            >
              Contact team
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
