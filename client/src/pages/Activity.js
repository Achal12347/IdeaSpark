import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchCollaborationRequests,
  respondToCollaborationRequest,
} from "../services/collaborationService";
import { useAuth } from "../context/AuthContext";
import apiRequest from "../services/api";
import io from "socket.io-client";
import "../styles/appPageTheme.css";
import "../styles/Activity.css";

export default function Activity() {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminMessages, setAdminMessages] = useState([]);
  const [directConversations, setDirectConversations] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [activityFeed, setActivityFeed] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !currentUser) return;

    const loadActivity = async () => {
      setLoading(true);
      setActivityLoading(true);
      try {
        setError("");
        const data = await fetchCollaborationRequests("incoming");
        setRequests(data);
        const inbox = await apiRequest("/api/admin-messages/inbox");
        setAdminMessages(Array.isArray(inbox) ? inbox : []);
        const dm = await apiRequest("/api/direct-messages/conversations");
        setDirectConversations(Array.isArray(dm) ? dm : []);
        const profile = await apiRequest("/api/users/me");
        setCurrentUserId(profile?._id || "");
        const activity = await apiRequest("/api/activity?limit=60");
        setActivityFeed(Array.isArray(activity) ? activity : []);
      } catch (error) {
        console.error("Error loading activity:", error);
        setError("Unable to load collaboration requests.");
      } finally {
        setLoading(false);
        setActivityLoading(false);
      }
    };
    loadActivity();
  }, [authLoading, currentUser]);

  useEffect(() => {
    if (authLoading || !currentUser) return;
    const socketUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(
      /\/api\/?$/,
      ""
    );
    const socket = io(socketUrl, { transports: ["websocket"] });
    socket.on("adminMessage", (message) => {
      const recipientType = message?.recipientType;
      const recipientId = message?.recipientId;
      const matches =
        recipientType === "public" ||
        (recipientType === "user" && recipientId === currentUserId);
      if (matches) {
        setAdminMessages((prev) =>
          prev.some((item) => item._id === message._id) ? prev : [message, ...prev]
        );
      }
    });
    socket.on("directMessage", async (message) => {
      const senderId = message?.sender?._id || message?.sender;
      const recipientId = message?.recipient?._id || message?.recipient;
      if (![senderId, recipientId].includes(currentUserId)) return;
      const dm = await apiRequest("/api/direct-messages/conversations");
      setDirectConversations(Array.isArray(dm) ? dm : []);
    });
    socket.on("activityUpdated", async (payload) => {
      if (payload?.userId && payload.userId !== currentUserId) return;
      const activity = await apiRequest("/api/activity?limit=60");
      setActivityFeed(Array.isArray(activity) ? activity : []);
    });
    socket.on("collaborationRequest", async (payload) => {
      if (payload?.recipient !== currentUserId) return;
      const data = await fetchCollaborationRequests("incoming");
      setRequests(data);
    });
    return () => socket.disconnect();
  }, [authLoading, currentUser, currentUserId]);

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

        <div className="app-header">
          <div>
            <h2 className="app-title">Your Activity</h2>
            <p className="app-subtitle">Everything you have done across the platform.</p>
          </div>
        </div>
        {activityLoading ? (
          <div className="activity-state">Loading activity timeline...</div>
        ) : activityFeed.length === 0 ? (
          <div className="activity-state">No activity yet.</div>
        ) : (
          <div className="app-list">
            {activityFeed.map((item) => (
              <div key={item._id} className="app-card activity-card activity-feed-card">
                <div className="activity-header">
                  <div>
                    <h3>{item.title || "Activity update"}</h3>
                    {item.message ? <p>{item.message}</p> : null}
                  </div>
                  <span className="activity-type">{item.type?.replace(/_/g, " ")}</span>
                </div>
                <div className="activity-footer">
                  <span className="activity-time">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                  {item.link ? (
                    <button
                      className="app-button-secondary"
                      onClick={() => navigate(item.link)}
                    >
                      View
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

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

        <div className="app-header">
          <div>
            <h2 className="app-title">Admin Messages</h2>
            <p className="app-subtitle">Announcements and private messages.</p>
          </div>
        </div>
        {adminMessages.length === 0 ? (
          <div className="activity-state">No admin messages yet.</div>
        ) : (
          <div className="app-list">
            {adminMessages.map((message) => (
              <div key={message._id} className="app-card activity-card">
                <div className="activity-header">
                  <div>
                    <h3>{message.sender?.name || "Admin"}</h3>
                    <p>{message.sender?.email}</p>
                  </div>
                  <span className="activity-time">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="activity-message">{message.content}</p>
              </div>
            ))}
          </div>
        )}

        <div className="app-header">
          <div>
            <h2 className="app-title">Direct Messages</h2>
            <p className="app-subtitle">Recent private conversations.</p>
          </div>
        </div>
        {directConversations.length === 0 ? (
          <div className="activity-state">No direct messages yet.</div>
        ) : (
          <div className="app-list">
            {directConversations.slice(0, 5).map((item) => (
              <div key={item.user._id} className="app-card activity-card">
                <div className="activity-header">
                  <div>
                    <h3>{item.user.name || item.user.email}</h3>
                    <p>{item.lastMessage?.content}</p>
                  </div>
                  <span className="activity-time">
                    {item.lastMessage?.createdAt
                      ? new Date(item.lastMessage.createdAt).toLocaleString()
                      : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

