import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiRequest from "../services/api";
import "../styles/IdeaDetails.css";

export default function IdeaDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // eslint-disable-line no-unused-vars
  const [idea, setIdea] = useState(null);
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const incrementViews = async () => {
      try {
        await apiRequest(`/api/ideas/${id}/views`, 'POST');
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
    incrementViews();
    loadIdea();
    loadComments();
  }, [id]);

  const handleRate = async (newRating) => {
    try {
      await apiRequest(`/api/ideas/${id}/rate`, 'POST', { rating: newRating });
      setUserRating(newRating);
      // Refresh idea data to get updated average
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
      await apiRequest(`/api/ideas/${id}/comments`, 'POST', { content: newComment });
      setNewComment('');
      // Refresh comments
      const commentsData = await apiRequest(`/api/ideas/${id}/comments`);
      setComments(commentsData);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleCollaborate = () => {
    navigate('/suggested-collaborators');
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
        <span>👀 {idea.views || 0} views</span>
        <span>⭐ {idea.likes || 0} likes</span>
        <span>💬 {idea.comments?.length || 0} comments</span>
      </div>
      <div className="rating-section">
        <h3>Rating: {rating.toFixed(1)} ({idea.totalRatings} ratings)</h3>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleRate(star)}
              style={{ cursor: 'pointer', color: star <= userRating ? 'gold' : 'gray' }}
            >
              ★
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
              <small>By {comment.author?.name} on {new Date(comment.createdAt).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="collaboration-section">
        <h3>Collaboration</h3>
        <p>Interested in collaborating on this idea?</p>
        <button onClick={handleCollaborate} className="collaborate-btn">Find Collaborators</button>
      </div>
    </div>
  );
}
