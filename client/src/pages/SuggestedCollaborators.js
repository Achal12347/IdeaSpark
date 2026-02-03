import React, { useState, useEffect } from "react";
import { fetchSuggestedCollaborators } from "../services/userService";
import { fetchMyIdeas } from "../services/ideaService";
import { createCollaborationRequest } from "../services/collaborationService";
import { useAuth } from "../context/AuthContext";
import "../styles/appPageTheme.css";
import "../styles/SuggestedCollaborators.css";

export default function SuggestedCollaborators() {
  const { currentUser, loading: authLoading } = useAuth();
  const [collaborators, setCollaborators] = useState([]);
  const [myIdeas, setMyIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    if (authLoading || !currentUser) return;

    const loadCollaborators = async () => {
      setLoading(true);
      try {
        const [data, ideaData] = await Promise.all([
          fetchSuggestedCollaborators(),
          fetchMyIdeas(),
        ]);
        setCollaborators(data);
        setMyIdeas(ideaData || []);
      } catch (error) {
        console.error("Error loading suggested collaborators:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCollaborators();
  }, [authLoading, currentUser]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedIdeaId(myIdeas[0]?._id || "");
    setMessage(
      user?.name
        ? `Hi ${user.name}, I'd like to collaborate on one of my ideas.`
        : "I'd like to collaborate on one of my ideas."
    );
    setStatus({ type: "", message: "" });
  };

  const handleRequest = async () => {
    if (!selectedUser) return;
    if (!selectedIdeaId) {
      setStatus({ type: "error", message: "Select an idea first." });
      return;
    }

    try {
      await createCollaborationRequest({
        recipientId: selectedUser._id,
        ideaId: selectedIdeaId,
        message,
      });
      setStatus({ type: "success", message: "Collaboration request sent." });
    } catch (error) {
      setStatus({ type: "error", message: "Unable to send request." });
    }
  };

  return (
    <div className="app-page collaborators-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h1 className="app-title">Suggested Collaborators</h1>
            <p className="app-subtitle">People who match your skills and goals.</p>
          </div>
        </div>

        {loading ? (
          <div className="collaborators-loading">Loading suggested collaborators...</div>
        ) : collaborators.length === 0 ? (
          <div className="no-collaborators">No suggested collaborators at the moment.</div>
        ) : (
          <div className="collaborators-grid">
            <div className="collaborators-list">
              {collaborators.map((user) => (
                <div
                  key={user._id}
                  className={`collaborator-card app-card ${
                    selectedUser?._id === user._id ? "selected" : ""
                  }`}
                >
                  <div className="collaborator-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="collaborator-info">
                    <h3>{user.name || "User"}</h3>
                    <p>Expertise: {user.expertise || "â€”"}</p>
                    <p>Workplace: {user.workplace || "â€”"}</p>
                  </div>
                  <button className="connect-btn" onClick={() => handleSelectUser(user)}>
                    View Details
                  </button>
                </div>
              ))}
            </div>

            <div className="collaborator-panel app-card">
              {selectedUser ? (
                <>
                  <div className="panel-header">
                    <div>
                      <h3>{selectedUser.name || "User"}</h3>
                      <p>{selectedUser.email}</p>
                    </div>
                    {selectedUser.roles?.length ? (
                      <span className="app-pill">{selectedUser.roles.join(", ")}</span>
                    ) : null}
                  </div>
                  <div className="panel-details">
                    <p><strong>Skills:</strong> {selectedUser.skills?.join(", ") || "â€”"}</p>
                    <p><strong>Interests:</strong> {selectedUser.interests?.join(", ") || "â€”"}</p>
                    <p><strong>Experience:</strong> {selectedUser.experienceLevel || "â€”"}</p>
                    <p><strong>Availability:</strong> {selectedUser.availability || "â€”"}</p>
                  </div>
                  <div className="panel-field">
                    <label>Select Idea</label>
                    <select
                      className="app-select"
                      value={selectedIdeaId}
                      onChange={(event) => setSelectedIdeaId(event.target.value)}
                      disabled={myIdeas.length === 0}
                    >
                      {myIdeas.map((idea) => (
                        <option key={idea._id} value={idea._id}>
                          {idea.title}
                        </option>
                      ))}
                    </select>
                    {myIdeas.length === 0 ? (
                      <p className="panel-hint">Create an idea to send a collaboration request.</p>
                    ) : null}
                  </div>
                  <div className="panel-field">
                    <label>Message</label>
                    <textarea
                      className="app-textarea"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                    />
                  </div>
                  {status.message ? (
                    <p className={`panel-status ${status.type}`}>{status.message}</p>
                  ) : null}
                  <div className="panel-actions">
                    <button
                      className="app-button"
                      onClick={handleRequest}
                      disabled={myIdeas.length === 0}
                    >
                      Request Collaboration
                    </button>
                  </div>
                </>
              ) : (
                <div className="panel-placeholder">
                  <h3>Select a collaborator</h3>
                  <p>Click on a user to view details and send a collaboration request.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
