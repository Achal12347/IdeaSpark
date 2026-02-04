import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../services/api";
import {
  useGetIdeasQuery,
  useGetInvestorOffersQuery,
  useGetUserProfileQuery,
} from "../store/apiSlice";
import io from "socket.io-client";
import IdeaCard from "../components/IdeaCard";
import "../styles/dashboardTheme.css";
import "../styles/InvestorDashboard.css";

const statusCopy = (status) => {
  switch (status) {
    case "pending":
      return "Waiting on owner";
    case "owner_accepted":
      return "Owner accepted - confirm";
    case "countered":
      return "Counter offer received";
    case "funded":
      return "Funded";
    case "rejected":
      return "Rejected";
    default:
      return "";
  }
};

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [offerForm, setOfferForm] = useState({
    pitchContent: "",
    amount: "",
    equity: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const {
    data: ideasData = [],
    isLoading: ideasLoading,
    refetch: refetchIdeas,
  } = useGetIdeasQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const {
    data: profile,
    isLoading: profileLoading,
  } = useGetUserProfileQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const canInvest = profile?.roles?.includes("Investor");
  const {
    data: offers = [],
    isLoading: offersLoading,
    refetch: refetchOffers,
  } = useGetInvestorOffersQuery(undefined, {
    skip: !canInvest,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const ideas = ideasData.filter(
    (idea) => (idea.fundingStatus || "seeking") !== "funded" && idea.isPitched
  );
  const loading = ideasLoading || profileLoading || (canInvest && offersLoading);
  const socketUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(
    /\/api\/?$/,
    ""
  );

  useEffect(() => {
    const socket = io(socketUrl, { transports: ["websocket"] });
    socket.on("ideasUpdated", () => {
      refetchIdeas();
      if (canInvest) {
        refetchOffers();
      }
    });
    return () => socket.disconnect();
  }, [refetchIdeas, refetchOffers, canInvest, socketUrl]);

  const handleOfferChange = (event) => {
    const { name, value } = event.target;
    setOfferForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectIdea = (idea) => {
    setSelectedIdea(idea);
    setOfferForm({ pitchContent: "", amount: "", equity: "" });
    setStatus({ type: "", message: "" });
  };

  const handleSubmitOffer = async () => {
    if (!selectedIdea) return;
    if (!offerForm.pitchContent.trim()) {
      setStatus({ type: "error", message: "Please add a message." });
      return;
    }

    try {
      await apiRequest(`/api/ideas/${selectedIdea._id}/pitches`, {
        method: "POST",
        body: JSON.stringify({
          pitchContent: offerForm.pitchContent,
          amount: offerForm.amount,
          equity: offerForm.equity,
        }),
      });
      setStatus({ type: "success", message: "Offer sent successfully." });
      setOfferForm({ pitchContent: "", amount: "", equity: "" });
      refetchOffers();
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Unable to send offer." });
    }
  };

  const handleConfirmOffer = async (offerItem) => {
    try {
      await apiRequest(
        `/api/ideas/${offerItem.ideaId}/pitches/${offerItem.offer._id}/confirm`,
        { method: "POST" }
      );
      refetchIdeas();
      refetchOffers();
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Unable to confirm offer." });
    }
  };

  return (
    <div className="dashboard-shell">
      <div className="investor-wrap">
        <header className="investor-header">
          <div>
            <h2>Investor Dashboard</h2>
            <p>Track ideas seeking funding and manage your offers.</p>
          </div>
          <span className="investor-badge">Funding Hub</span>
        </header>

        {!canInvest ? (
          <div className="investor-alert">
            Only users with the Investor role can submit or confirm offers.
          </div>
        ) : null}

        {status.message ? (
          <div className={`investor-alert ${status.type}`}>{status.message}</div>
        ) : null}

        <section className="investor-section">
          <div className="section-heading">
            <h3>Ideas seeking funding</h3>
          </div>
          {loading ? (
            <p>Loading ideas...</p>
          ) : ideas.length === 0 ? (
            <p>No ideas have been pitched yet.</p>
          ) : (
            <div className="investor-grid">
              {ideas.map((idea) => (
                <IdeaCard
                  key={idea._id}
                  idea={idea}
                  variant="investor"
                  className="investor-card"
                  onClick={() => navigate(`/idea/${idea._id}`)}
                  onAction={() => handleSelectIdea(idea)}
                  actionLabel="Make offer"
                />
              ))}
            </div>
          )}
        </section>

        {selectedIdea ? (
          <section className="investor-section">
            <div className="section-heading">
              <h3>Offer details</h3>
              <p>{selectedIdea.title}</p>
            </div>
            <div className="offer-panel">
              {selectedIdea.pitchMessage ? (
                <div className="pitch-preview">
                  <p className="pitch-label">Founder pitch</p>
                  <p>{selectedIdea.pitchMessage}</p>
                </div>
              ) : null}
              <textarea
                name="pitchContent"
                placeholder="Tell the founder why you are interested"
                value={offerForm.pitchContent}
                onChange={handleOfferChange}
                rows={4}
              />
              <div className="offer-fields">
                <input
                  type="number"
                  name="amount"
                  placeholder="Investment amount (optional)"
                  value={offerForm.amount}
                  onChange={handleOfferChange}
                />
                <input
                  type="number"
                  name="equity"
                  placeholder="Equity % (optional)"
                  value={offerForm.equity}
                  onChange={handleOfferChange}
                />
              </div>
              <div className="offer-actions">
                <button onClick={handleSubmitOffer} disabled={!canInvest}>
                  Submit offer
                </button>
                <button
                  className="ghost"
                  onClick={() =>
                    setOfferForm((prev) => ({
                      ...prev,
                      pitchContent: "I am interested in learning more about this idea.",
                    }))
                  }
                >
                  Show interest
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <section className="investor-section">
          <div className="section-heading">
            <h3>Your offers</h3>
          </div>
          {offers.length === 0 ? (
            <p>No offers yet.</p>
          ) : (
            <div className="offers-list">
              {offers.map((item) => (
                <div key={item.offer._id} className="offer-card">
                  <div>
                    <h4>{item.ideaTitle}</h4>
                    <p>{item.offer.pitchContent}</p>
                  </div>
                  <div className="offer-meta">
                    <span>{statusCopy(item.offer.status)}</span>
                    <span>
                      Amount: {item.offer.amount ? `$${item.offer.amount}` : "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â"}
                    </span>
                    <span>
                      Equity: {item.offer.equity ? `${item.offer.equity}%` : "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â"}
                    </span>
                  </div>
                  {item.offer.counterOffer ? (
                    <div className="counter-summary">
                      <p>Counter offer</p>
                      <span>
                        Amount: {item.offer.counterOffer.amount ? `$${item.offer.counterOffer.amount}` : "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â"}
                      </span>
                      <span>
                        Equity: {item.offer.counterOffer.equity ? `${item.offer.counterOffer.equity}%` : "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â"}
                      </span>
                      <span>{item.offer.counterOffer.message}</span>
                    </div>
                  ) : null}
                  {canInvest && ["owner_accepted", "countered"].includes(item.offer.status) ? (
                    <button onClick={() => handleConfirmOffer(item)}>
                      Confirm funding
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
