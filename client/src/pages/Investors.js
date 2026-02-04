import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../services/api";
import { fetchMyIdeas } from "../services/ideaService";
import io from "socket.io-client";
import IdeaCard from "../components/IdeaCard";
import "../styles/appPageTheme.css";
import "../styles/Investors.css";

const statusLabel = (status) => {
  switch (status) {
    case "pending":
      return "Pending";
    case "owner_accepted":
      return "Owner accepted";
    case "countered":
      return "Countered";
    case "funded":
      return "Funded";
    case "rejected":
      return "Rejected";
    default:
      return "Unknown";
  }
};

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
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState("");
  const [counterDrafts, setCounterDrafts] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const socketUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(
    /\/api\/?$/,
    ""
  );

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

  useEffect(() => {
    const socket = io(socketUrl, { transports: ["websocket"] });
    socket.on("ideasUpdated", () => {
      fetchMyIdeas()
        .then((data) => setIdeas(Array.isArray(data) ? data : []))
        .catch(() => null);
      if (selectedIdea?._id) {
        loadOffers(selectedIdea._id);
      }
    });
    return () => socket.disconnect();
  }, [socketUrl, selectedIdea?._id]);

  const handleSelectIdea = (idea) => {
    setSelectedIdea(idea);
    setPitchForm({
      pitchMessage: idea.pitchMessage || "",
      estimatedBudget: idea.estimatedBudget ?? "",
      equityShare: idea.equityShare ?? "",
    });
    setStatus({ type: "", message: "" });
    setOffers([]);
    setOffersError("");
    loadOffers(idea._id);
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

  const loadOffers = async (ideaId) => {
    setOffersLoading(true);
    setOffersError("");
    try {
      const data = await apiRequest(`/api/ideas/${ideaId}/pitches`);
      setOffers(data || []);
    } catch (error) {
      setOffersError("Unable to load offers.");
    } finally {
      setOffersLoading(false);
    }
  };

  const updateCounterDraft = (offerId, field, value) => {
    setCounterDrafts((prev) => ({
      ...prev,
      [offerId]: {
        ...prev[offerId],
        [field]: value,
      },
    }));
  };

  const handleOfferAction = async (offerId, action) => {
    if (!selectedIdea) return;
    const payload = { action };
    if (action === "counter") {
      const draft = counterDrafts[offerId] || {};
      payload.counterAmount = draft.amount;
      payload.counterEquity = draft.equity;
      payload.counterMessage = draft.message;
    }
    try {
      await apiRequest(`/api/ideas/${selectedIdea._id}/pitches/${offerId}/respond`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await loadOffers(selectedIdea._id);
    } catch (error) {
      setOffersError("Unable to update offer.");
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

                  <div className="offers-panel">
                    <div className="offers-header">
                      <h3>Offers</h3>
                      <p>Investors who showed interest in this idea.</p>
                    </div>
                    {offersLoading ? (
                      <p className="offers-state">Loading offers...</p>
                    ) : offersError ? (
                      <p className="offers-state error">{offersError}</p>
                    ) : offers.length === 0 ? (
                      <p className="offers-state">No offers yet.</p>
                    ) : (
                      <div className="offer-list">
                        {offers.map((offer) => (
                          <div key={offer._id} className="offer-card">
                            <div className="offer-header">
                              <div>
                                <h4>{offer.investor?.name || "Investor"}</h4>
                                <p>{offer.investor?.email}</p>
                              </div>
                              <span className={`offer-status status-${offer.status}`}>
                                {statusLabel(offer.status)}
                              </span>
                            </div>
                            <p className="offer-message">{offer.pitchContent}</p>
                            <div className="offer-meta">
                              <span>Amount: {offer.amount ? `$${offer.amount}` : "N/A"}</span>
                              <span>Equity: {offer.equity ? `${offer.equity}%` : "N/A"}</span>
                            </div>
                            {offer.counterOffer ? (
                              <div className="counter-block">
                                <p className="counter-title">Counter offer</p>
                                <p>{offer.counterOffer.message || "N/A"}</p>
                                <div className="offer-meta">
                                  <span>
                                    Amount: {offer.counterOffer.amount ? `$${offer.counterOffer.amount}` : "N/A"}
                                  </span>
                                  <span>
                                    Equity: {offer.counterOffer.equity ? `${offer.counterOffer.equity}%` : "N/A"}
                                  </span>
                                </div>
                              </div>
                            ) : null}
                            {offer.status === "pending" ? (
                              <div className="offer-actions">
                                <button
                                  className="app-button"
                                  onClick={() => handleOfferAction(offer._id, "accept")}
                                >
                                  Accept
                                </button>
                                <button
                                  className="app-button-secondary"
                                  onClick={() => handleOfferAction(offer._id, "reject")}
                                >
                                  Reject
                                </button>
                                <div className="counter-form">
                                  <input
                                    type="number"
                                    placeholder="Counter amount"
                                    value={counterDrafts[offer._id]?.amount || ""}
                                    onChange={(event) =>
                                      updateCounterDraft(offer._id, "amount", event.target.value)
                                    }
                                    className="app-input"
                                  />
                                  <input
                                    type="number"
                                    placeholder="Counter equity %"
                                    value={counterDrafts[offer._id]?.equity || ""}
                                    onChange={(event) =>
                                      updateCounterDraft(offer._id, "equity", event.target.value)
                                    }
                                    className="app-input"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Counter message"
                                    value={counterDrafts[offer._id]?.message || ""}
                                    onChange={(event) =>
                                      updateCounterDraft(offer._id, "message", event.target.value)
                                    }
                                    className="app-input"
                                  />
                                  <button
                                    className="app-button-secondary"
                                    onClick={() => handleOfferAction(offer._id, "counter")}
                                  >
                                    Send counter
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
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
