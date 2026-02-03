import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiRequest from "../services/api";
import "../styles/IdeaDetails.css";

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

export default function IdeaDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [idea, setIdea] = useState(null);
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [offers, setOffers] = useState([]);
  const [offersAllowed, setOffersAllowed] = useState(false);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState("");
  const [counterDrafts, setCounterDrafts] = useState({});

  useEffect(() => {
    const incrementViews = async () => {
      try {
        await apiRequest(`/api/ideas/${id}/views`, { method: "POST" });
      } catch (error) {
        console.error("Error incrementing views:", error);
      }
    };

    const loadIdea = async () => {
      try {
        const ideaData = await apiRequest(`/api/ideas/${id}`);
        setIdea(ideaData);
        setRating(ideaData.averageRating || 0);
      } catch (error) {
        console.error("Error loading idea:", error);
      }
    };

    const loadComments = async () => {
      try {
        const commentsData = await apiRequest(`/api/ideas/${id}/comments`);
        setComments(commentsData);
      } catch (error) {
        console.error("Error loading comments:", error);
      }
    };

    const loadOffers = async () => {
      setOffersLoading(true);
      setOffersError("");
      try {
        const offerData = await apiRequest(`/api/ideas/${id}/pitches`);
        setOffers(offerData);
        setOffersAllowed(true);
      } catch (error) {
        const errorMessage = error.message || "";
        if (errorMessage.includes("403")) {
          setOffersAllowed(false);
        } else {
          setOffersAllowed(true);
          setOffersError("Unable to load funding offers.");
        }
      } finally {
        setOffersLoading(false);
      }
    };

    incrementViews();
    loadIdea();
    loadComments();
    loadOffers();
  }, [id]);

  const handleRate = async (newRating) => {
    try {
      await apiRequest(`/api/ideas/${id}/rate`, {
        method: "POST",
        body: JSON.stringify({ rating: newRating }),
      });
      setUserRating(newRating);
      const updatedIdea = await apiRequest(`/api/ideas/${id}`);
      setIdea(updatedIdea);
      setRating(updatedIdea.averageRating || 0);
    } catch (error) {
      console.error("Error rating idea:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await apiRequest(`/api/ideas/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: newComment }),
      });
      setNewComment("");
      const commentsData = await apiRequest(`/api/ideas/${id}/comments`);
      setComments(commentsData);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleOfferAction = async (offerId, action) => {
    const payload = { action };
    if (action === "counter") {
      const draft = counterDrafts[offerId] || {};
      payload.counterAmount = draft.amount;
      payload.counterEquity = draft.equity;
      payload.counterMessage = draft.message;
    }

    try {
      await apiRequest(`/api/ideas/${id}/pitches/${offerId}/respond`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const offerData = await apiRequest(`/api/ideas/${id}/pitches`);
      setOffers(offerData);
      const ideaData = await apiRequest(`/api/ideas/${id}`);
      setIdea(ideaData);
    } catch (error) {
      console.error("Error updating offer:", error);
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

  const handleCollaborate = () => {
    navigate("/suggested-collaborators");
  };

  if (!idea) return <div>Loading...</div>;

  return (
    <div className="idea-details-page">
      <h2>{idea.title}</h2>
      <p>{idea.problemStatement}</p>
      <p>{idea.solutionDescription}</p>
      <div className="tags">
        {idea.tags?.map((tag, index) => (
          <span key={index}>{tag}</span>
        ))}
      </div>
      <p>Posted by: {idea.author?.name}</p>
      <div className="idea-stats">
        <span>Views {idea.views || 0}</span>
        <span>Likes {idea.likes || 0}</span>
        <span>Comments {idea.comments?.length || 0}</span>
      </div>
      <div className="rating-section">
        <h3>
          Rating: {rating.toFixed(1)} ({idea.totalRatings} ratings)
        </h3>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleRate(star)}
              style={{ cursor: "pointer", color: star <= userRating ? "gold" : "gray" }}
            >
              *
            </span>
          ))}
        </div>
      </div>
      <div className="comments-section">
        <h3>Comments</h3>
        <div className="add-comment">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <button onClick={handleAddComment}>Post Comment</button>
        </div>
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment._id} className="comment">
              <p>{comment.content}</p>
              <small>
                By {comment.author?.name} on {new Date(comment.createdAt).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>
      </div>
      {offersAllowed ? (
        <div className="funding-section">
          <h3>Funding offers</h3>
          {offersLoading ? <p>Loading offers...</p> : null}
          {offersError ? <p className="offer-error">{offersError}</p> : null}
          {!offersLoading && offers.length === 0 ? <p>No offers yet.</p> : null}
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
                  <span>Amount: {offer.amount ? `$${offer.amount}` : "—"}</span>
                  <span>Equity: {offer.equity ? `${offer.equity}%` : "—"}</span>
                </div>
                {offer.counterOffer ? (
                  <div className="counter-block">
                    <p className="counter-title">Counter offer</p>
                    <p>{offer.counterOffer.message || "—"}</p>
                    <div className="offer-meta">
                      <span>
                        Amount: {offer.counterOffer.amount ? `$${offer.counterOffer.amount}` : "—"}
                      </span>
                      <span>
                        Equity: {offer.counterOffer.equity ? `${offer.counterOffer.equity}%` : "—"}
                      </span>
                    </div>
                  </div>
                ) : null}
                {offer.status === "pending" ? (
                  <div className="offer-actions">
                    <button onClick={() => handleOfferAction(offer._id, "accept")}>Accept</button>
                    <button onClick={() => handleOfferAction(offer._id, "reject")}>Reject</button>
                    <div className="counter-form">
                      <input
                        type="number"
                        placeholder="Counter amount"
                        value={counterDrafts[offer._id]?.amount || ""}
                        onChange={(e) => updateCounterDraft(offer._id, "amount", e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Counter equity %"
                        value={counterDrafts[offer._id]?.equity || ""}
                        onChange={(e) => updateCounterDraft(offer._id, "equity", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Counter message"
                        value={counterDrafts[offer._id]?.message || ""}
                        onChange={(e) => updateCounterDraft(offer._id, "message", e.target.value)}
                      />
                      <button onClick={() => handleOfferAction(offer._id, "counter")}>Send counter</button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="collaboration-section">
        <h3>Collaboration</h3>
        <p>Interested in collaborating on this idea?</p>
        <button onClick={handleCollaborate} className="collaborate-btn">
          Find Collaborators
        </button>
      </div>
    </div>
  );
}
