import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiRequest from "../services/api";
import {
  addBookmark,
  removeBookmark,
  fetchBookmarks,
} from "../services/bookmarkService";
import "../styles/appPageTheme.css";
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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [bookmarkMessage, setBookmarkMessage] = useState("");
  const [interestCount, setInterestCount] = useState(0);
  const [interestLoading, setInterestLoading] = useState(false);
  const [interestMessage, setInterestMessage] = useState("");

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
        setInterestCount(ideaData.interestedUsers?.length || 0);
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

    const loadBookmarks = async () => {
      try {
        const bookmarks = await fetchBookmarks();
        const alreadySaved = bookmarks.some((bookmark) => bookmark._id === id);
        setIsBookmarked(alreadySaved);
      } catch (error) {
        console.error("Error loading bookmarks:", error);
      }
    };

    incrementViews();
    loadIdea();
    loadComments();
    loadOffers();
    loadBookmarks();
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

  const handleBookmarkToggle = async () => {
    setBookmarkLoading(true);
    setBookmarkMessage("");
    try {
      if (isBookmarked) {
        await removeBookmark(id);
        setIsBookmarked(false);
        setBookmarkMessage("Removed from bookmarks.");
      } else {
        await addBookmark(id);
        setIsBookmarked(true);
        setBookmarkMessage("Saved to bookmarks.");
      }
    } catch (error) {
      setBookmarkMessage("Unable to update bookmark.");
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShowInterest = async () => {
    setInterestLoading(true);
    setInterestMessage("");
    try {
      const response = await apiRequest(`/api/ideas/${id}/interest`, {
        method: "POST",
      });
      if (response?.interestCount !== undefined) {
        setInterestCount(response.interestCount);
      }
      setInterestMessage("Interest recorded.");
    } catch (error) {
      setInterestMessage("Unable to record interest.");
    } finally {
      setInterestLoading(false);
    }
  };

  if (!idea) {
    return (
      <div className="app-page idea-details-page">
        <div className="app-container">
          <div className="idea-details-loading">Loading...</div>
        </div>
      </div>
    );
  }

  const postedBy = idea.author?.name || idea.author?.email || "Anonymous";
  const postedDate = idea.createdAt
    ? new Date(idea.createdAt).toLocaleDateString()
    : null;

  return (
    <div className="app-page idea-details-page">
      <div className="app-container">
        <div className="app-header idea-details-header">
          <div>
            <h2 className="app-title">{idea.title}</h2>
            <p className="app-subtitle">
              Posted by {postedBy}
              {postedDate ? ` Â· ${postedDate}` : ""}
            </p>
          </div>
        </div>

        <section className="idea-details-overview app-card">
          <div className="idea-details-block">
            <h3>Problem</h3>
            <p>{idea.problemStatement}</p>
          </div>
          <div className="idea-details-block">
            <h3>Solution</h3>
            <p>{idea.solutionDescription}</p>
          </div>
          <div className="idea-details-tags">
            {idea.tags?.map((tag, index) => (
              <span key={index} className="app-pill">
                {tag}
              </span>
            ))}
          </div>
          <div className="idea-details-stats">
            <span className="app-pill">Views {idea.views || 0}</span>
            <span className="app-pill">Rating {rating.toFixed(1)}</span>
            <span className="app-pill">Interest {interestCount}</span>
          </div>
        </section>

        <div className="idea-details-grid">
          <section className="rating-section app-card">
            <h3>
              Rating: {rating.toFixed(1)} ({idea.totalRatings || 0} ratings)
            </h3>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => handleRate(star)}
                  className={star <= userRating ? "star active" : "star"}
                >
                  *
                </span>
              ))}
            </div>
          </section>

          <section className="collaboration-section app-card">
            <h3>Actions</h3>
            <p>Save, collaborate, or show interest in this idea.</p>
            <div className="action-buttons">
              <button
                onClick={handleBookmarkToggle}
                className="app-button-secondary"
                disabled={bookmarkLoading}
              >
                {isBookmarked ? "Remove Bookmark" : "Add to Bookmarks"}
              </button>
              <button
                onClick={handleShowInterest}
                className="app-button"
                disabled={interestLoading}
              >
                Show Interest
              </button>
              <button onClick={handleCollaborate} className="app-button-secondary">
                Request Collaboration
              </button>
            </div>
            {bookmarkMessage ? (
              <p className="action-message">{bookmarkMessage}</p>
            ) : null}
            {interestMessage ? (
              <p className="action-message">{interestMessage}</p>
            ) : null}
          </section>
        </div>

        <section className="comments-section app-card">
          <div className="comments-header">
            <h3>Comments</h3>
            <span>{comments.length} total</span>
          </div>
          <div className="add-comment">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="app-textarea"
            />
            <button className="app-button" onClick={handleAddComment}>
              Post Comment
            </button>
          </div>
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment._id} className="comment-card">
                <p>{comment.content}</p>
                <small>
                  By {comment.author?.name} on{" "}
                  {new Date(comment.createdAt).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        </section>

        {offersAllowed ? (
          <section className="funding-section app-card">
            <div className="funding-header">
              <h3>Funding offers</h3>
              <p>Review funding interest from investors.</p>
            </div>
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
                        className="app-button-secondary offer-reject"
                        onClick={() => handleOfferAction(offer._id, "reject")}
                      >
                        Reject
                      </button>
                      <div className="counter-form">
                        <input
                          type="number"
                          placeholder="Counter amount"
                          value={counterDrafts[offer._id]?.amount || ""}
                          onChange={(e) =>
                            updateCounterDraft(offer._id, "amount", e.target.value)
                          }
                          className="app-input"
                        />
                        <input
                          type="number"
                          placeholder="Counter equity %"
                          value={counterDrafts[offer._id]?.equity || ""}
                          onChange={(e) =>
                            updateCounterDraft(offer._id, "equity", e.target.value)
                          }
                          className="app-input"
                        />
                        <input
                          type="text"
                          placeholder="Counter message"
                          value={counterDrafts[offer._id]?.message || ""}
                          onChange={(e) =>
                            updateCounterDraft(offer._id, "message", e.target.value)
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
          </section>
        ) : null}
      </div>
    </div>
  );
}
