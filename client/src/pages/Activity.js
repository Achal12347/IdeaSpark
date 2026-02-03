import React, { useState, useEffect } from "react";
import {
  fetchCollaborationRequests,
  respondToCollaborationRequest,
} from "../services/collaborationService";
import { useAuth } from "../context/AuthContext";
import "../styles/appPageTheme.css";
import "../styles/Activity.css";

export default function Activity() {
  const { currentUser, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !currentUser) return;

    const loadActivity = async () => {
      setLoading(true);
      try {
        setError("");
        const data = await fetchCollaborationRequests("incoming");
        setRequests(data);
      } catch (error) {
        console.error("Error loading activity:", error);
        setError("Unable to load collaboration requests.");
      } finally {
        setLoading(false);
      }
    };
    loadActivity();
  }, [authLoading, currentUser]);

  const handleRespond = async (requestId, action) => {
    try {
      await respondToCollaborationRequest(requestId, action);
      setRequests((prev) =>
        prev.map((request) =>
          request._id === requestId
            ? { ...request, status: action === "accept" ? "accepted" : "rejected" }
            : request
        )
      );
    } catch (err) {
      console.error("Unable to respond to request:", err);
      setError("Unable to respond to request.");
    }
  };

  return (
    <div className="app-page activity-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h1 className="app-title">Activity</h1>
            <p className="app-subtitle">Recent updates and interactions.</p>
          </div>
        </div>

        {loading ? (
          <div className="activity-state">Loading activity...</div>
        ) : error ? (
          <div className="activity-state">{error}</div>
        ) : requests.length === 0 ? (
          <div className="activity-state">No collaboration requests yet.</div>
        ) : (
          <div className="app-list">
            {requests.map((request) => (
              <div key={request._id} className="app-card activity-card">
                <div className="activity-header">
                  <div>
                    <h3>{request.requester?.name || "User"}</h3>
                    <p>{request.requester?.email}</p>
                  </div>
                  <span className={`activity-status ${request.status}`}>
                    {request.status}
                  </span>
                </div>
                <div className="activity-details">
                  <p>
                    <strong>Idea:</strong> {request.idea?.title || "General request"}
                  </p>
                  {request.requester?.roles?.length ? (
                    <p>
                      <strong>Roles:</strong> {request.requester.roles.join(", ")}
                    </p>
                  ) : null}
                  {request.requester?.skills?.length ? (
                    <p>
                      <strong>Skills:</strong> {request.requester.skills.slice(0, 4).join(", ")}
                    </p>
                  ) : null}
                </div>
                {request.message ? (
                  <p className="activity-message">{request.message}</p>
                ) : null}
                <div className="activity-footer">
                  <span className="activity-time">
                    {new Date(request.createdAt).toLocaleString()}
                  </span>
                  {request.status === "pending" ? (
                    <div className="activity-actions">
                      <button
                        className="app-button"
                        onClick={() => handleRespond(request._id, "accept")}
                      >
                        Accept
                      </button>
                      <button
                        className="app-button-secondary"
                        onClick={() => handleRespond(request._id, "reject")}
                      >
                        Reject
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

