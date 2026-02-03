import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../services/api";
import { fetchMyIdeas } from "../services/ideaService";
import IdeaCard from "../components/IdeaCard";
import "../styles/appPageTheme.css";
import "../styles/Investors.css";

export default function Investors() {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [pitchForm, setPitchForm] = useState({
    pitchMessage: "",
    estimatedBudget: "",
    equityShare: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const loadIdeas = async () => {
      setLoading(true);
      try {
        const data = await fetchMyIdeas();
        setIdeas(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading ideas:", error);
      } finally {
        setLoading(false);
      }
    };
    loadIdeas();
  }, []);

  const handleSelectIdea = (idea) => {
    setSelectedIdea(idea);
    setPitchForm({
      pitchMessage: idea.pitchMessage || "",
      estimatedBudget: idea.estimatedBudget ?? "",
      equityShare: idea.equityShare ?? "",
    });
    setStatus({ type: "", message: "" });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPitchForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedIdea) return;
    if (!pitchForm.pitchMessage.trim()) {
      setStatus({ type: "error", message: "Pitch message is required." });
      return;
    }

    try {
      const response = await apiRequest(`/api/ideas/${selectedIdea._id}/pitch`, {
        method: "POST",
        body: JSON.stringify({
          pitchMessage: pitchForm.pitchMessage,
          estimatedBudget: pitchForm.estimatedBudget,
          equityShare: pitchForm.equityShare,
        }),
      });

      const updatedIdea = response.idea || selectedIdea;
      setIdeas((prev) =>
        prev.map((idea) => (idea._id === updatedIdea._id ? updatedIdea : idea))
      );
      setSelectedIdea(updatedIdea);
      setStatus({ type: "success", message: "Idea pitched to investors." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Pitch failed." });
    }
  };

  return (
    <div className="app-page investors-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h2 className="app-title">Find Investors</h2>
            <p className="app-subtitle">
              Select one of your ideas and pitch it to investors.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="investors-loading">Loading your ideas...</div>
        ) : ideas.length === 0 ? (
          <div className="investors-empty app-card">
            <h3>No ideas yet</h3>
            <p>Create an idea first to start pitching.</p>
            <button className="app-button" onClick={() => navigate("/add-idea")}>
              Create Idea
            </button>
          </div>
        ) : (
          <div className="investors-grid">
            <div className="investors-ideas">
              {ideas.map((idea) => (
                <IdeaCard
                  key={idea._id}
                  idea={idea}
                  variant="user"
                  className={`app-card ${selectedIdea?._id === idea._id ? "is-selected" : ""}`}
                  onClick={() => navigate(`/idea/${idea._id}`)}
                  onAction={() => handleSelectIdea(idea)}
                  actionLabel="Pitch"
                />
              ))}
            </div>

            <div className="investors-pitch app-card">
              {selectedIdea ? (
                <>
                  <div className="pitch-header">
                    <div>
                      <h3>Pitch: {selectedIdea.title}</h3>
                      <p>
                        {selectedIdea.isPitched
                          ? "Update your pitch details and resubmit."
                          : "Send your pitch to all investors."}
                      </p>
                    </div>
                    {selectedIdea.isPitched ? (
                      <span className="app-pill">Pitched</span>
                    ) : null}
                  </div>

                  <div className="pitch-field">
                    <label>Pitch message</label>
                    <textarea
                      name="pitchMessage"
                      value={pitchForm.pitchMessage}
                      onChange={handleChange}
                      className="app-textarea"
                      placeholder="Explain why this idea deserves investment"
                    />
                  </div>

                  <div className="pitch-field-row">
                    <div className="pitch-field">
                      <label>Estimated budget (USD)</label>
                      <input
                        type="number"
                        name="estimatedBudget"
                        value={pitchForm.estimatedBudget}
                        onChange={handleChange}
                        className="app-input"
                        placeholder="e.g. 50000"
                      />
                    </div>
                    <div className="pitch-field">
                      <label>Equity share (%)</label>
                      <input
                        type="number"
                        name="equityShare"
                        value={pitchForm.equityShare}
                        onChange={handleChange}
                        className="app-input"
                        placeholder="e.g. 12"
                      />
                    </div>
                  </div>

                  {status.message ? (
                    <p className={`pitch-status ${status.type}`}>{status.message}</p>
                  ) : null}

                  <div className="pitch-actions">
                    <button className="app-button" onClick={handleSubmit}>
                      {selectedIdea.isPitched ? "Update Pitch" : "Pitch to Investors"}
                    </button>
                    <button
                      className="app-button-secondary"
                      onClick={() => navigate(`/idea/${selectedIdea._id}`)}
                    >
                      View Idea Details
                    </button>
                  </div>
                </>
              ) : (
                <div className="pitch-placeholder">
                  <h3>Select an idea to pitch</h3>
                  <p>Use the Pitch button on any idea card to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
