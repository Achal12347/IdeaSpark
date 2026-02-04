import { useEffect, useState } from "react";
import apiRequest from "../services/api";
import io from "socket.io-client";
import "../styles/appPageTheme.css";
import "../styles/Hackathons.css";

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [status, setStatus] = useState("");
  const [teamForm, setTeamForm] = useState({ name: "", members: "" });
  const [submissionForm, setSubmissionForm] = useState({
    title: "",
    description: "",
    problemStatement: "",
    solutionExplanation: "",
    githubLink: "",
    demoLink: "",
    files: "",
  });
  const [hackathonMessages, setHackathonMessages] = useState([]);
  const [profile, setProfile] = useState(null);
  const [adminChatMessages, setAdminChatMessages] = useState([]);
  const [adminChatDraft, setAdminChatDraft] = useState("");

  const selectedHackathonData = hackathons.find(
    (hackathon) => hackathon._id === selectedHackathon
  );

  const refreshHackathons = async () => {
    const hackathonsData = await apiRequest("/api/hackathons");
    setHackathons(hackathonsData);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        await refreshHackathons();
        const userProfile = await apiRequest("/api/users/me");
        setProfile(userProfile);
      } catch (error) {
        console.error("Error loading hackathons:", error);
      }
    };
    loadAll();
  }, []);

  const handleViewRankings = async (hackathonId) => {
    try {
      const rankingsData = await apiRequest(`/api/hackathons/${hackathonId}/rankings`);
      setRankings(rankingsData);
      setSelectedHackathon(hackathonId);
    } catch (error) {
      console.error("Error loading rankings:", error);
    }
  };

  const loadHackathonMessages = async (hackathonId) => {
    try {
      const data = await apiRequest(`/api/admin-messages/hackathon/${hackathonId}/inbox`);
      setHackathonMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading hackathon messages:", error);
    }
  };

  const loadAdminHackathonChat = async (hackathonId) => {
    try {
      const data = await apiRequest(
        `/api/admin-messages/hackathon/${hackathonId}/admin-chat`
      );
      setAdminChatMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading admin hackathon chat:", error);
    }
  };

  const currentPhase = (hackathon) => {
    const now = new Date();
    if (now < new Date(hackathon.registrationStart)) return "Registration opens soon";
    if (now <= new Date(hackathon.registrationEnd)) return "Registration open";
    if (now <= new Date(hackathon.submissionDeadline)) return "Submission phase";
    if (now <= new Date(hackathon.resultAnnouncement)) return "Judging in progress";
    return "Results announced";
  };

  const countdownTo = (dateValue) => {
    if (!dateValue) return "TBD";
    const diff = new Date(dateValue).getTime() - Date.now();
    if (diff <= 0) return "Live";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return `${days}d ${hours}h`;
  };

  const handleRegister = async (hackathonId) => {
    setStatus("");
    try {
      await apiRequest(`/api/hackathons/${hackathonId}/register`, { method: "POST" });
      setStatus("Registered successfully.");
      await refreshHackathons();
    } catch (error) {
      setStatus("Unable to register.");
    }
  };

  const handleCreateTeam = async () => {
    if (!selectedHackathonData) return;
    if (!teamForm.name.trim()) return;
    setStatus("");
    try {
      const memberEmails = teamForm.members
        ? teamForm.members.split(",").map((email) => email.trim()).filter(Boolean)
        : [];
      await apiRequest(`/api/hackathons/${selectedHackathonData._id}/teams`, {
        method: "POST",
        body: JSON.stringify({ name: teamForm.name, memberEmails }),
      });
      setTeamForm({ name: "", members: "" });
      setStatus("Team created.");
      await refreshHackathons();
    } catch (error) {
      setStatus("Unable to create team.");
    }
  };

  const handleSubmitProject = async () => {
    if (!selectedHackathonData?.myTeam?._id) return;
    if (!submissionForm.title.trim() || !submissionForm.description.trim()) {
      setStatus("Title and description are required.");
      return;
    }
    setStatus("");
    try {
      const files = submissionForm.files
        ? submissionForm.files.split(",").map((file) => file.trim()).filter(Boolean)
        : [];
      await apiRequest(`/api/hackathons/${selectedHackathonData._id}/submit`, {
        method: "POST",
        body: JSON.stringify({
          teamId: selectedHackathonData.myTeam._id,
          ...submissionForm,
          files,
        }),
      });
      setStatus("Submission saved.");
      await refreshHackathons();
    } catch (error) {
      setStatus("Unable to submit.");
    }
  };

  useEffect(() => {
    if (!selectedHackathonData?._id) return;
    loadHackathonMessages(selectedHackathonData._id);
    if (profile?.role === "admin") {
      loadAdminHackathonChat(selectedHackathonData._id);
    }
  }, [selectedHackathonData?._id, profile?.role]);

  useEffect(() => {
    const socketUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(
      /\/api\/?$/,
      ""
    );
    const socket = io(socketUrl, { transports: ["websocket"] });
    socket.on("adminMessage", (message) => {
      const hackathonId =
        typeof message?.hackathon === "string" ? message.hackathon : message?.hackathon?._id;
      if (!selectedHackathonData?._id || hackathonId !== selectedHackathonData._id) return;
      if (message?.recipientType === "hackathon_admin" && profile?.role === "admin") {
        setAdminChatMessages((prev) =>
          prev.some((item) => item._id === message._id) ? prev : [message, ...prev]
        );
      }
      if (["public", "hackathon_team"].includes(message?.recipientType)) {
        setHackathonMessages((prev) =>
          prev.some((item) => item._id === message._id) ? prev : [message, ...prev]
        );
      }
    });
    socket.on("hackathonUpdated", async (hackathonId) => {
      await refreshHackathons();
      if (selectedHackathonData?._id && hackathonId === selectedHackathonData._id) {
        loadHackathonMessages(selectedHackathonData._id);
        if (profile?.role === "admin") {
          loadAdminHackathonChat(selectedHackathonData._id);
        }
      }
    });
    return () => socket.disconnect();
  }, [selectedHackathonData?._id, profile?.role]);

  const isAdmin = profile?.role === "admin";
  const isCouncil =
    isAdmin &&
    selectedHackathonData?.councilAdmins?.some(
      (adminId) => adminId === profile?._id
    );

  return (
    <div className="app-page hackathons-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h2 className="app-title">Hackathons</h2>
            <p className="app-subtitle">Track upcoming events and explore the rankings.</p>
          </div>
        </div>

        {hackathons.length === 0 ? (
          <div className="hackathons-empty app-card">
            <h3>No hackathons yet</h3>
            <p>Check back soon for upcoming events.</p>
          </div>
        ) : (
          <div className="hackathons-grid">
            <div className="hackathons-list">
              {hackathons.map((hackathon) => (
                <div key={hackathon._id} className="hackathon-card app-card">
                  <div className="hackathon-card-header">
                    <h3>{hackathon.title}</h3>
                    <span className="app-pill">{hackathon.status}</span>
                  </div>
                  <p className="hackathon-description">{hackathon.description}</p>
                  <div className="hackathon-meta">
                    <span>Theme: {hackathon.theme || "Open"}</span>
                    <span>Participants: {hackathon.participantCount || 0}</span>
                    <span>Submissions: {hackathon.submissionCount || 0}</span>
                  </div>
                  <div className="hackathon-meta">
                    <span>Registration ends in: {countdownTo(hackathon.registrationEnd)}</span>
                    <span>Submission due: {new Date(hackathon.submissionDeadline).toLocaleDateString()}</span>
                  </div>
                  <div className="hackathon-actions">
                    <button
                      className="app-button-secondary"
                      onClick={() => setSelectedHackathon(hackathon._id)}
                    >
                      View Details
                    </button>
                    {!hackathon.isRegistered ? (
                      <button
                        className="app-button"
                        onClick={() => handleRegister(hackathon._id)}
                      >
                        Join Hackathon
                      </button>
                    ) : (
                      <span className="app-pill">Registered</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="hackathon-detail app-card">
              {selectedHackathonData ? (
                <>
                  <div className="detail-header">
                    <div>
                      <h3>{selectedHackathonData.title}</h3>
                      <p>{currentPhase(selectedHackathonData)}</p>
                    </div>
                    <span className="app-pill">{selectedHackathonData.status}</span>
                  </div>
                  {status ? <p className="status-note">{status}</p> : null}
                  <div className="detail-grid">
                    <div>
                      <span className="detail-label">Registration</span>
                      <p>
                        {new Date(selectedHackathonData.registrationStart).toLocaleDateString()} -{" "}
                        {new Date(selectedHackathonData.registrationEnd).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="detail-label">Submission deadline</span>
                      <p>{new Date(selectedHackathonData.submissionDeadline).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="detail-label">Results</span>
                      <p>{new Date(selectedHackathonData.resultAnnouncement).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="detail-label">Team limit</span>
                      <p>{selectedHackathonData.teamLimit || 5} people</p>
                    </div>
                  </div>

                  {isAdmin ? (
                    <div className="detail-block admin-confirmations">
                      <h4>Admin confirmations</h4>
                      <div className="detail-grid">
                        <div>
                          <span className="detail-label">Launch confirmations</span>
                          <p>
                            {selectedHackathonData.launchConfirmations?.length || 0}/4
                          </p>
                        </div>
                        <div>
                          <span className="detail-label">Winner confirmations</span>
                          <p>
                            {selectedHackathonData.winnerConfirmations?.length || 0}/4
                          </p>
                        </div>
                      </div>
                      {isCouncil ? (
                        <div className="hackathon-actions">
                          <button
                            className="app-button"
                            onClick={async () => {
                              await apiRequest(
                                `/api/hackathons/${selectedHackathonData._id}/confirm-launch`,
                                { method: "POST" }
                              );
                              await refreshHackathons();
                            }}
                          >
                            Confirm launch
                          </button>
                          <button
                            className="app-button-secondary"
                            onClick={async () => {
                              await apiRequest(
                                `/api/hackathons/${selectedHackathonData._id}/confirm-winners`,
                                { method: "POST" }
                              );
                              await refreshHackathons();
                            }}
                          >
                            Confirm winners
                          </button>
                        </div>
                      ) : (
                        <p className="status-note">
                          Only the selected council admins can confirm.
                        </p>
                      )}
                    </div>
                  ) : null}

                  {!selectedHackathonData.isRegistered ? (
                    <button
                      className="app-button"
                      onClick={() => handleRegister(selectedHackathonData._id)}
                    >
                      Register now
                    </button>
                  ) : null}

                  {selectedHackathonData.isRegistered && !selectedHackathonData.myTeam ? (
                    <div className="detail-block">
                      <h4>Create your team</h4>
                      <input
                        className="app-input"
                        placeholder="Team name"
                        value={teamForm.name}
                        onChange={(event) =>
                          setTeamForm((prev) => ({ ...prev, name: event.target.value }))
                        }
                      />
                      <input
                        className="app-input"
                        placeholder="Member emails (comma separated)"
                        value={teamForm.members}
                        onChange={(event) =>
                          setTeamForm((prev) => ({ ...prev, members: event.target.value }))
                        }
                      />
                      <button className="app-button" onClick={handleCreateTeam}>
                        Create team
                      </button>
                    </div>
                  ) : null}

                  {selectedHackathonData.myTeam ? (
                    <div className="detail-block">
                      <h4>Submit your project</h4>
                      <input
                        className="app-input"
                        placeholder="Project title"
                        value={submissionForm.title}
                        onChange={(event) =>
                          setSubmissionForm((prev) => ({ ...prev, title: event.target.value }))
                        }
                      />
                      <textarea
                        className="app-textarea"
                        placeholder="Project description"
                        value={submissionForm.description}
                        onChange={(event) =>
                          setSubmissionForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                      />
                      <textarea
                        className="app-textarea"
                        placeholder="Problem statement"
                        value={submissionForm.problemStatement}
                        onChange={(event) =>
                          setSubmissionForm((prev) => ({
                            ...prev,
                            problemStatement: event.target.value,
                          }))
                        }
                      />
                      <textarea
                        className="app-textarea"
                        placeholder="Solution explanation"
                        value={submissionForm.solutionExplanation}
                        onChange={(event) =>
                          setSubmissionForm((prev) => ({
                            ...prev,
                            solutionExplanation: event.target.value,
                          }))
                        }
                      />
                      <input
                        className="app-input"
                        placeholder="GitHub link"
                        value={submissionForm.githubLink}
                        onChange={(event) =>
                          setSubmissionForm((prev) => ({ ...prev, githubLink: event.target.value }))
                        }
                      />
                      <input
                        className="app-input"
                        placeholder="Demo link"
                        value={submissionForm.demoLink}
                        onChange={(event) =>
                          setSubmissionForm((prev) => ({ ...prev, demoLink: event.target.value }))
                        }
                      />
                      <input
                        className="app-input"
                        placeholder="File URLs (comma separated)"
                        value={submissionForm.files}
                        onChange={(event) =>
                          setSubmissionForm((prev) => ({ ...prev, files: event.target.value }))
                        }
                      />
                      <button className="app-button" onClick={handleSubmitProject}>
                        Submit project
                      </button>
                    </div>
                  ) : null}

                  <button
                    className="app-button-secondary"
                    onClick={() => handleViewRankings(selectedHackathonData._id)}
                  >
                    View rankings
                  </button>

                  <div className="detail-block">
                    <h4>Hackathon updates</h4>
                    {hackathonMessages.length === 0 ? (
                      <p className="status-note">No updates yet.</p>
                    ) : (
                      <div className="hackathon-messages">
                        {hackathonMessages.map((message) => (
                          <div key={message._id} className="message-card">
                            <p className="message-content">{message.content}</p>
                            <span className="message-meta">
                              {message.sender?.name || "Admin"} •{" "}
                              {new Date(message.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {isAdmin ? (
                    <div className="detail-block admin-chat">
                      <h4>Admin-only discussion</h4>
                      {adminChatMessages.length === 0 ? (
                        <p className="status-note">No admin messages yet.</p>
                      ) : (
                        <div className="hackathon-messages">
                          {adminChatMessages.map((message) => (
                            <div key={message._id} className="message-card">
                              <p className="message-content">{message.content}</p>
                              <span className="message-meta">
                                {message.sender?.name || "Admin"} •{" "}
                                {new Date(message.createdAt).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <textarea
                        className="app-textarea"
                        placeholder="Message other admins..."
                        value={adminChatDraft}
                        onChange={(event) => setAdminChatDraft(event.target.value)}
                      />
                      <button
                        className="app-button"
                        onClick={async () => {
                          if (!adminChatDraft.trim()) return;
                          await apiRequest("/api/admin-messages", {
                            method: "POST",
                            body: JSON.stringify({
                              recipientType: "hackathon_admin",
                              content: adminChatDraft,
                              hackathonId: selectedHackathonData._id,
                              visibility: "private",
                            }),
                          });
                          setAdminChatDraft("");
                          await loadAdminHackathonChat(selectedHackathonData._id);
                        }}
                      >
                        Send to admins
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="detail-placeholder">
                  <h3>Select a hackathon</h3>
                  <p>Pick an event to see phases, register, and submit.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedHackathon ? (
          <div className="rankings-section app-card">
            <div className="rankings-header">
              <h3>Rankings</h3>
              {selectedHackathonData?.title ? (
                <span className="app-pill">{selectedHackathonData.title}</span>
              ) : null}
            </div>
            <ul className="rankings-list">
              {rankings.map((submission, index) => (
                <li key={submission._id}>
                  <span className="rankings-rank">#{index + 1}</span>
                  <span className="rankings-title">{submission.title || "Untitled"}</span>
                  <span className="rankings-team">
                    {submission.team?.name || "Unknown team"}
                  </span>
                  <span className="rankings-score">
                    Score: {submission.averageScore?.toFixed(1) ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
