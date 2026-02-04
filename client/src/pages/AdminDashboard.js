import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import apiRequest from "../services/api";
import { fetchIdeas } from "../services/ideaService";
import { fetchAllUsers, fetchAdmins } from "../services/userService";
import io from "socket.io-client";
import IdeaCard from "../components/IdeaCard";
import UserCard from "../components/UserCard";
import UserDetailsModal from "../components/UserDetailsModal";
import "../styles/dashboardTheme.css";
import "../styles/AdminDashboard.css";

const buildMonthlySeries = (items, dateKey, monthsCount = 6) => {
  const now = new Date();
  const buckets = [];

  for (let i = monthsCount - 1; i >= 0; i -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
      label: monthDate.toLocaleString("en-US", { month: "short" }),
      count: 0,
    });
  }

  items.forEach((item) => {
    const rawDate = item?.[dateKey] || item?.createdAt || item?.updatedAt;
    if (!rawDate) return;
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return;
    const key = `${parsed.getFullYear()}-${parsed.getMonth()}`;
    const bucket = buckets.find((entry) => entry.key === key);
    if (bucket) {
      bucket.count += 1;
    }
  });

  return buckets;
};

export default function AdminDashboard() {
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIdeas: 0,
    totalComments: 0,
    avgIdeasPerUser: 0,
    activeToday: 0,
    pendingReviews: 0,
  });
  const [ideas, setIdeas] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [hackathons, setHackathons] = useState([]);
  const [hackathonLoading, setHackathonLoading] = useState(false);
  const [hackathonError, setHackathonError] = useState("");
  const [hackathonForm, setHackathonForm] = useState({
    title: "",
    description: "",
    theme: "",
    banner: "",
    registrationStart: "",
    registrationEnd: "",
    submissionDeadline: "",
    resultAnnouncement: "",
    teamLimit: 5,
    rules: "",
    allowedTechnologies: "",
    submissionFormat: "",
    judgingCriteria: "",
    prizes: "",
  });
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [judgeDrafts, setJudgeDrafts] = useState({});
  const [admins, setAdmins] = useState([]);
  const [messageForm, setMessageForm] = useState({
    recipientType: "public",
    recipientId: "",
    hackathonId: "",
    content: "",
  });
  const [adminMessages, setAdminMessages] = useState([]);
  const [hackathonAdminMessages, setHackathonAdminMessages] = useState([]);
  const [hackathonAdminDraft, setHackathonAdminDraft] = useState("");
  const [teams, setTeams] = useState([]);
  const [councilSelection, setCouncilSelection] = useState([]);
  const [hostSelection, setHostSelection] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setMessagesError("");
        const [ideasData, usersData, adminsData] = await Promise.all([
          fetchIdeas(),
          fetchAllUsers(),
          fetchAdmins(),
        ]);
        const analyticsData = await apiRequest("/api/analytics").catch(() => null);
        const hackathonData = await apiRequest("/api/hackathons").catch(() => []);

        const safeIdeas = Array.isArray(ideasData) ? ideasData : [];
        const safeUsers = Array.isArray(usersData) ? usersData : [];

        setIdeas(safeIdeas);
        setUsers(safeUsers);
        setAdmins(Array.isArray(adminsData) ? adminsData : []);
        setAnalytics(analyticsData || null);
        setHackathons(Array.isArray(hackathonData) ? hackathonData : []);

        const todayLabel = new Date().toDateString();
        const activeToday = safeUsers.filter((user) => {
          const activityDate = new Date(user.updatedAt || user.createdAt || Date.now());
          return activityDate.toDateString() === todayLabel;
        }).length;
        const pendingReviews = safeIdeas.filter(
          (idea) => (idea.fundingStatus || "seeking") !== "funded"
        ).length;

        setStats({
          totalUsers: safeUsers.length,
          totalIdeas: safeIdeas.length,
          totalComments: analyticsData?.totalComments || 0,
          avgIdeasPerUser: analyticsData?.avgIdeasPerUser
            ? Number(analyticsData.avgIdeasPerUser.toFixed(1))
            : 0,
          activeToday,
          pendingReviews,
        });

        const userSeries = buildMonthlySeries(safeUsers, "createdAt");
        const ideaSeries = buildMonthlySeries(safeIdeas, "createdAt");
        const combined = userSeries.map((entry, index) => ({
          label: entry.label,
          users: entry.count,
          ideas: ideaSeries[index]?.count || 0,
        }));
        setGrowthData(combined);

        const apiBaseUrl = process.env.REACT_APP_API_URL;
        if (apiBaseUrl && auth.currentUser) {
          setLoadingMessages(true);
          const token = await auth.currentUser.getIdToken(true);
          const response = await fetch(`${apiBaseUrl}/api/contact?limit=50`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || "Unable to load messages");
          }
          setContactMessages(data);
        }
        const adminInbox = await apiRequest("/api/admin-messages/admin").catch(() => []);
        setAdminMessages(Array.isArray(adminInbox) ? adminInbox : []);
      } catch (error) {
        console.error("Error loading admin data:", error);
        setMessagesError(error.message || "Unable to load contact messages.");
      } finally {
        setLoadingMessages(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const socketUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(
      /\/api\/?$/,
      ""
    );
    const socket = io(socketUrl, { transports: ["websocket"] });
    socket.on("adminMessage", (message) => {
      if (message?.recipientType === "admin") {
        setAdminMessages((prev) =>
          prev.some((item) => item._id === message._id) ? prev : [message, ...prev]
        );
      }
      const hackathonId =
        typeof message?.hackathon === "string" ? message.hackathon : message?.hackathon?._id;
      if (
        message?.recipientType === "hackathon_admin" &&
        selectedHackathon?._id &&
        hackathonId === selectedHackathon._id
      ) {
        setHackathonAdminMessages((prev) =>
          prev.some((item) => item._id === message._id) ? prev : [message, ...prev]
        );
      }
    });
    socket.on("hackathonUpdated", async (hackathonId) => {
      const data = await apiRequest("/api/hackathons");
      setHackathons(Array.isArray(data) ? data : []);
      if (selectedHackathon?._id && hackathonId === selectedHackathon._id) {
        const submissionsData = await apiRequest(
          `/api/hackathons/${selectedHackathon._id}/submissions`
        );
        setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
      }
    });
    return () => socket.disconnect();
  }, [selectedHackathon?._id]);

  const handleLogout = async () => {
    navigate("/", { replace: true });
    await auth.signOut();
  };

  const maxGrowth = growthData.reduce((maxValue, entry) => {
    return Math.max(maxValue, entry.users || 0, entry.ideas || 0);
  }, 1);

  const renderContent = () => {
    switch (pageTitle) {
      case "Ideas":
        return (
          <section className="admin-content">
            <h3>All Ideas</h3>
            <div className="admin-grid">
              {ideas.length === 0 ? (
                <p>No ideas found yet.</p>
              ) : (
                ideas.map((idea) => (
                  <IdeaCard
                    key={idea._id}
                    idea={idea}
                    variant="admin"
                    className="card"
                    onClick={() => navigate(`/idea/${idea._id}`)}
                  />
                ))
              )}
            </div>
          </section>
        );
      case "Users":
        return (
          <section className="admin-content">
            <h3>All Users</h3>
            <div className="admin-grid">
              {users.length === 0 ? (
                <p>No users found yet.</p>
              ) : (
                users.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    onClick={() => setSelectedUser(user)}
                  />
                ))
              )}
            </div>
          </section>
        );
      case "Hackathons":
        return (
          <section className="admin-content">
            <h3>Hackathon Management</h3>
            <p>Control hackathon phases, submissions, and winner announcements.</p>

            {hackathonError ? <p className="admin-error">{hackathonError}</p> : null}

            <div className="admin-card stack">
              <h4>Create hackathon</h4>
              <div className="admin-grid">
                {admins.map((admin) => (
                  <label key={admin._id} className="admin-chip">
                    <input
                      type="checkbox"
                      checked={councilSelection.includes(admin._id)}
                      onChange={() =>
                        setCouncilSelection((prev) =>
                          prev.includes(admin._id)
                            ? prev.filter((id) => id !== admin._id)
                            : prev.length < 4
                              ? [...prev, admin._id]
                              : prev
                        )
                      }
                    />
                    {admin.name || admin.email}
                  </label>
                ))}
              </div>
              <select
                className="admin-input"
                value={hostSelection}
                onChange={(e) => setHostSelection(e.target.value)}
              >
                <option value="">Select host admin</option>
                {councilSelection.map((adminId) => {
                  const admin = admins.find((item) => item._id === adminId);
                  return (
                    <option key={adminId} value={adminId}>
                      {admin?.name || admin?.email || "Admin"}
                    </option>
                  );
                })}
              </select>
              <div className="admin-grid">
                <input
                  className="admin-input"
                  placeholder="Title"
                  value={hackathonForm.title}
                  onChange={(e) =>
                    setHackathonForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
                <input
                  className="admin-input"
                  placeholder="Theme"
                  value={hackathonForm.theme}
                  onChange={(e) =>
                    setHackathonForm((prev) => ({ ...prev, theme: e.target.value }))
                  }
                />
                <input
                  className="admin-input"
                  placeholder="Banner image URL"
                  value={hackathonForm.banner}
                  onChange={(e) =>
                    setHackathonForm((prev) => ({ ...prev, banner: e.target.value }))
                  }
                />
                <input
                  className="admin-input"
                  type="date"
                  value={hackathonForm.registrationStart}
                  onChange={(e) =>
                    setHackathonForm((prev) => ({ ...prev, registrationStart: e.target.value }))
                  }
                />
                <input
                  className="admin-input"
                  type="date"
                  value={hackathonForm.registrationEnd}
                  onChange={(e) =>
                    setHackathonForm((prev) => ({ ...prev, registrationEnd: e.target.value }))
                  }
                />
                <input
                  className="admin-input"
                  type="date"
                  value={hackathonForm.submissionDeadline}
                  onChange={(e) =>
                    setHackathonForm((prev) => ({ ...prev, submissionDeadline: e.target.value }))
                  }
                />
                <input
                  className="admin-input"
                  type="date"
                  value={hackathonForm.resultAnnouncement}
                  onChange={(e) =>
                    setHackathonForm((prev) => ({ ...prev, resultAnnouncement: e.target.value }))
                  }
                />
                <input
                  className="admin-input"
                  type="number"
                  placeholder="Team limit"
                  value={hackathonForm.teamLimit}
                  onChange={(e) =>
                    setHackathonForm((prev) => ({ ...prev, teamLimit: e.target.value }))
                  }
                />
              </div>
              <textarea
                className="admin-textarea"
                placeholder="Description"
                value={hackathonForm.description}
                onChange={(e) =>
                  setHackathonForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
              <input
                className="admin-input"
                placeholder="Rules (comma separated)"
                value={hackathonForm.rules}
                onChange={(e) =>
                  setHackathonForm((prev) => ({ ...prev, rules: e.target.value }))
                }
              />
              <input
                className="admin-input"
                placeholder="Allowed technologies (comma separated)"
                value={hackathonForm.allowedTechnologies}
                onChange={(e) =>
                  setHackathonForm((prev) => ({ ...prev, allowedTechnologies: e.target.value }))
                }
              />
              <input
                className="admin-input"
                placeholder="Submission format (comma separated)"
                value={hackathonForm.submissionFormat}
                onChange={(e) =>
                  setHackathonForm((prev) => ({ ...prev, submissionFormat: e.target.value }))
                }
              />
              <input
                className="admin-input"
                placeholder="Judging criteria (comma separated)"
                value={hackathonForm.judgingCriteria}
                onChange={(e) =>
                  setHackathonForm((prev) => ({ ...prev, judgingCriteria: e.target.value }))
                }
              />
              <input
                className="admin-input"
                placeholder="Prizes (comma separated)"
                value={hackathonForm.prizes}
                onChange={(e) =>
                  setHackathonForm((prev) => ({ ...prev, prizes: e.target.value }))
                }
              />
              <button
                className="btn-primary"
                onClick={async () => {
                  setHackathonLoading(true);
                  setHackathonError("");
                  try {
                    const payload = {
                      ...hackathonForm,
                      teamLimit: Number(hackathonForm.teamLimit) || 5,
                      rules: hackathonForm.rules
                        ? hackathonForm.rules.split(",").map((r) => r.trim()).filter(Boolean)
                        : [],
                      allowedTechnologies: hackathonForm.allowedTechnologies
                        ? hackathonForm.allowedTechnologies.split(",").map((r) => r.trim()).filter(Boolean)
                        : [],
                      submissionFormat: hackathonForm.submissionFormat
                        ? hackathonForm.submissionFormat.split(",").map((r) => r.trim()).filter(Boolean)
                        : [],
                      judgingCriteria: hackathonForm.judgingCriteria
                        ? hackathonForm.judgingCriteria.split(",").map((r) => r.trim()).filter(Boolean)
                        : [],
                      prizes: hackathonForm.prizes
                        ? hackathonForm.prizes.split(",").map((r) => r.trim()).filter(Boolean)
                        : [],
                    };
                    const created = await apiRequest("/api/hackathons", {
                      method: "POST",
                      body: JSON.stringify(payload),
                    });
                    if (councilSelection.length === 4 && hostSelection && created?._id) {
                      await apiRequest(`/api/hackathons/${created._id}/council`, {
                        method: "POST",
                        body: JSON.stringify({
                          adminIds: councilSelection,
                          hostId: hostSelection,
                        }),
                      });
                    }
                    const data = await apiRequest("/api/hackathons");
                    setHackathons(Array.isArray(data) ? data : []);
                    setHackathonForm({
                      title: "",
                      description: "",
                      theme: "",
                      banner: "",
                      registrationStart: "",
                      registrationEnd: "",
                      submissionDeadline: "",
                      resultAnnouncement: "",
                      teamLimit: 5,
                      rules: "",
                      allowedTechnologies: "",
                      submissionFormat: "",
                      judgingCriteria: "",
                      prizes: "",
                    });
                    setCouncilSelection([]);
                    setHostSelection("");
                  } catch (error) {
                    setHackathonError("Unable to create hackathon.");
                  } finally {
                    setHackathonLoading(false);
                  }
                }}
                disabled={hackathonLoading}
              >
                {hackathonLoading ? "Creating..." : "Create Hackathon"}
              </button>
            </div>

            <div className="admin-card stack">
              <h4>Existing hackathons</h4>
              {hackathons.length === 0 ? (
                <p>No hackathons yet.</p>
              ) : (
                <div className="admin-grid">
                  {hackathons.map((hackathon) => (
                    <div key={hackathon._id} className="card">
                      <h4>{hackathon.title}</h4>
                      <p>{hackathon.description}</p>
                      <p>Status: {hackathon.status}</p>
                      <p>
                        Launch confirmations: {hackathon.launchConfirmations?.length || 0}/4
                      </p>
                      <p>
                        Winner confirmations: {hackathon.winnerConfirmations?.length || 0}/4
                      </p>
                      <div className="admin-actions">
                        <button
                          onClick={async () => {
                            if (councilSelection.length !== 4 || !hostSelection) {
                              setHackathonError("Select 4 admins and a host first.");
                              return;
                            }
                            await apiRequest(`/api/hackathons/${hackathon._id}/council`, {
                              method: "POST",
                              body: JSON.stringify({
                                adminIds: councilSelection,
                                hostId: hostSelection,
                              }),
                            });
                            const data = await apiRequest("/api/hackathons");
                            setHackathons(Array.isArray(data) ? data : []);
                          }}
                        >
                          Assign council
                        </button>
                        <button
                          onClick={async () => {
                            await apiRequest(
                              `/api/hackathons/${hackathon._id}/confirm-launch`,
                              { method: "POST" }
                            );
                            const data = await apiRequest("/api/hackathons");
                            setHackathons(Array.isArray(data) ? data : []);
                          }}
                        >
                          Confirm launch
                        </button>
                        <button
                          className="btn-primary"
                          onClick={async () => {
                            setSelectedHackathon(hackathon);
                            setSubmissionsLoading(true);
                            const data = await apiRequest(
                              `/api/hackathons/${hackathon._id}/submissions`
                            );
                            setSubmissions(Array.isArray(data) ? data : []);
                            setSubmissionsLoading(false);
                            const adminChat = await apiRequest(
                              `/api/admin-messages/hackathon/${hackathon._id}/admin-chat`
                            );
                            setHackathonAdminMessages(Array.isArray(adminChat) ? adminChat : []);
                          }}
                        >
                          View submissions
                        </button>
                        <button
                          onClick={async () => {
                            await apiRequest(`/api/hackathons/${hackathon._id}/announce`, {
                              method: "POST",
                            });
                          }}
                        >
                          Compute winners
                        </button>
                        <button
                          onClick={async () => {
                            await apiRequest(
                              `/api/hackathons/${hackathon._id}/confirm-winners`,
                              { method: "POST" }
                            );
                            const data = await apiRequest("/api/hackathons");
                            setHackathons(Array.isArray(data) ? data : []);
                          }}
                        >
                          Confirm winners
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedHackathon ? (
              <div className="admin-card stack">
                <h4>Submissions: {selectedHackathon.title}</h4>
                {submissionsLoading ? (
                  <p>Loading submissions...</p>
                ) : submissions.length === 0 ? (
                  <p>No submissions yet.</p>
                ) : (
                  submissions.map((submission) => (
                    <div key={submission._id} className="card">
                      <h5>{submission.title}</h5>
                      <p>{submission.description}</p>
                      <p>Team: {submission.team?.name || "Unknown"}</p>
                      <div className="admin-grid">
                        {["innovation", "feasibility", "design", "technical", "impact"].map(
                          (field) => (
                            <input
                              key={field}
                              className="admin-input"
                              type="number"
                              placeholder={field}
                              value={judgeDrafts[submission._id]?.[field] || ""}
                              onChange={(e) =>
                                setJudgeDrafts((prev) => ({
                                  ...prev,
                                  [submission._id]: {
                                    ...prev[submission._id],
                                    [field]: Number(e.target.value),
                                  },
                                }))
                              }
                            />
                          )
                        )}
                      </div>
                      <textarea
                        className="admin-textarea"
                        placeholder="Feedback"
                        value={judgeDrafts[submission._id]?.feedback || ""}
                        onChange={(e) =>
                          setJudgeDrafts((prev) => ({
                            ...prev,
                            [submission._id]: {
                              ...prev[submission._id],
                              feedback: e.target.value,
                            },
                          }))
                        }
                      />
                      <button
                        className="btn-primary"
                        onClick={async () => {
                          await apiRequest(
                            `/api/hackathons/${selectedHackathon._id}/submissions/${submission._id}/judge`,
                            {
                              method: "POST",
                              body: JSON.stringify({
                                scores: judgeDrafts[submission._id] || {},
                                feedback: judgeDrafts[submission._id]?.feedback || "",
                              }),
                            }
                          );
                        }}
                      >
                        Submit score
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : null}

            {selectedHackathon ? (
              <div className="admin-card stack">
                <h4>Admin-only hackathon chat</h4>
                <div className="admin-chat-list">
                  {hackathonAdminMessages.length === 0 ? (
                    <p>No admin messages yet.</p>
                  ) : (
                    hackathonAdminMessages.map((message) => (
                      <div key={message._id} className="card">
                        <p>{message.content}</p>
                        <small>
                          {message.sender?.name || "Admin"} •{" "}
                          {new Date(message.createdAt).toLocaleString()}
                        </small>
                      </div>
                    ))
                  )}
                </div>
                <textarea
                  className="admin-textarea"
                  placeholder="Write a private admin message..."
                  value={hackathonAdminDraft}
                  onChange={(e) => setHackathonAdminDraft(e.target.value)}
                />
                <button
                  className="btn-primary"
                  onClick={async () => {
                    if (!hackathonAdminDraft.trim()) return;
                    await apiRequest("/api/admin-messages", {
                      method: "POST",
                      body: JSON.stringify({
                        recipientType: "hackathon_admin",
                        content: hackathonAdminDraft,
                        hackathonId: selectedHackathon._id,
                        visibility: "private",
                      }),
                    });
                    const data = await apiRequest(
                      `/api/admin-messages/hackathon/${selectedHackathon._id}/admin-chat`
                    );
                    setHackathonAdminMessages(Array.isArray(data) ? data : []);
                    setHackathonAdminDraft("");
                  }}
                >
                  Send to admins
                </button>
              </div>
            ) : null}
          </section>
        );
      case "Investors":
        return (
          <section className="admin-content">
            <h3>Investor Management</h3>
            <p>Manage investor profiles, view pitches, and track investments.</p>
            <div className="admin-actions">
              <button className="btn-primary">View All Investors</button>
              <button>Manage Pitches</button>
              <button>Investment Tracking</button>
            </div>
          </section>
        );
      case "Messages":
        return (
          <section className="admin-content">
            <h3>Contact Messages</h3>
            {messagesError ? <p className="admin-error">{messagesError}</p> : null}
            {loadingMessages ? (
              <p>Loading messages...</p>
            ) : (
              <div className="message-list">
                {contactMessages.length === 0 ? (
                  <p>No messages yet.</p>
                ) : (
                  contactMessages.map((message) => (
                    <div key={message._id} className="message-card card">
                      <div className="message-header">
                        <div>
                          <h4>{message.name}</h4>
                          <p>{message.email}</p>
                        </div>
                        <span className="message-date">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="message-body">{message.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        );
      case "Admin Messages":
        return (
          <section className="admin-content">
            <h3>Admin Message Center</h3>
            <p>Send announcements or private messages to admins, users, or teams.</p>
            <div className="admin-card stack">
              <div className="admin-grid">
                <select
                  className="admin-input"
                  value={messageForm.recipientType}
                  onChange={(e) =>
                    setMessageForm((prev) => ({ ...prev, recipientType: e.target.value }))
                  }
                >
                  <option value="public">Public (all users)</option>
                  <option value="admin">Admin (private)</option>
                  <option value="user">User (private)</option>
                  <option value="hackathon_team">Hackathon team</option>
                </select>
                <select
                  className="admin-input"
                  value={messageForm.recipientId}
                  onChange={(e) =>
                    setMessageForm((prev) => ({ ...prev, recipientId: e.target.value }))
                  }
                >
                  <option value="">Select recipient</option>
                  {messageForm.recipientType === "admin" &&
                    admins.map((admin) => (
                      <option key={admin._id} value={admin._id}>
                        {admin.name || admin.email}
                      </option>
                    ))}
                  {messageForm.recipientType === "user" &&
                    users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name || user.email}
                      </option>
                    ))}
                  {messageForm.recipientType === "hackathon_team" &&
                    teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                </select>
                <select
                  className="admin-input"
                  value={messageForm.hackathonId}
                  onChange={async (e) => {
                    const hackathonId = e.target.value;
                    setMessageForm((prev) => ({ ...prev, hackathonId }));
                    if (hackathonId) {
                      const data = await apiRequest(`/api/hackathons/${hackathonId}/teams`);
                      setTeams(Array.isArray(data) ? data : []);
                    }
                  }}
                >
                  <option value="">Hackathon (optional)</option>
                  {hackathons.map((hackathon) => (
                    <option key={hackathon._id} value={hackathon._id}>
                      {hackathon.title}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="admin-textarea"
                placeholder="Write a message..."
                value={messageForm.content}
                onChange={(e) =>
                  setMessageForm((prev) => ({ ...prev, content: e.target.value }))
                }
              />
              <button
                className="btn-primary"
                onClick={async () => {
                  await apiRequest("/api/admin-messages", {
                    method: "POST",
                    body: JSON.stringify({
                      recipientType: messageForm.recipientType,
                      recipientId: messageForm.recipientId || undefined,
                      content: messageForm.content,
                      hackathonId: messageForm.hackathonId || undefined,
                      visibility: messageForm.recipientType === "public" ? "public" : "private",
                    }),
                  });
                  const inbox = await apiRequest("/api/admin-messages/admin");
                  setAdminMessages(Array.isArray(inbox) ? inbox : []);
                  setMessageForm((prev) => ({ ...prev, content: "" }));
                }}
              >
                Publish message
              </button>
            </div>

            <div className="admin-card stack">
              <h4>Recent messages</h4>
              {adminMessages.length === 0 ? (
                <p>No admin messages yet.</p>
              ) : (
                adminMessages.map((message) => (
                  <div key={message._id} className="card">
                    <p>{message.content}</p>
                    <small>
                      {message.sender?.name || "Admin"} •{" "}
                      {new Date(message.createdAt).toLocaleString()}
                    </small>
                  </div>
                ))
              )}
            </div>
          </section>
        );
      default:
        return (
          <section className="admin-content">
            <div className="stats-grid">
              <div className="stat-card card">
                <h4>Total Users</h4>
                <p>{stats.totalUsers}</p>
              </div>
              <div className="stat-card card">
                <h4>Total Ideas</h4>
                <p>{stats.totalIdeas}</p>
              </div>
              <div className="stat-card card">
                <h4>Total Comments</h4>
                <p>{stats.totalComments}</p>
              </div>
              <div className="stat-card card">
                <h4>Avg Ideas / User</h4>
                <p>{stats.avgIdeasPerUser}</p>
              </div>
              <div className="stat-card card">
                <h4>Active Today</h4>
                <p>{stats.activeToday}</p>
              </div>
              <div className="stat-card card highlight">
                <h4>Ideas Seeking Funding</h4>
                <p>{stats.pendingReviews}</p>
              </div>
            </div>

            <div className="admin-analytics">
              <div className="chart-card card">
                <div className="chart-header">
                  <h4>User + Idea Growth</h4>
                  <p>Last 6 months activity</p>
                </div>
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-dot users" /> Users
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot ideas" /> Ideas
                  </span>
                </div>
                {growthData.length === 0 ? (
                  <p className="chart-empty">Not enough data yet.</p>
                ) : (
                  <div className="chart-grid">
                    {growthData.map((entry) => (
                      <div key={entry.label} className="chart-column">
                        <div className="chart-bars">
                          <span
                            className="chart-bar users"
                            style={{ height: `${(entry.users / maxGrowth) * 100}%` }}
                          />
                          <span
                            className="chart-bar ideas"
                            style={{ height: `${(entry.ideas / maxGrowth) * 100}%` }}
                          />
                        </div>
                        <span className="chart-label">{entry.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="analytics-card card">
                <h4>Analytics Snapshot</h4>
                <p>Top categories and engagement highlights.</p>
                <div className="analytics-list">
                  {(analytics?.ideasByCategory || []).slice(0, 4).map((category) => (
                    <div key={category._id || "unknown"} className="analytics-row">
                      <span>{category._id || "Uncategorized"}</span>
                      <span>{category.count} ideas</span>
                    </div>
                  ))}
                </div>
                {analytics?.trendingIdeas?.length ? (
                  <div className="analytics-trending">
                    <p>Top trending idea</p>
                    <strong>{analytics.trendingIdeas[0].title}</strong>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        );
    }
  };

  return (
    <div className="dashboard-shell admin-shell">
      <div className="dashboard-frame admin-frame">
        {/* SIDEBAR */}
        <aside className="sidebar admin-sidebar">
          <h2 className="logo">IdeaSpark</h2>

          <nav className="sidebar-nav">
            <button
              onClick={() => setPageTitle("Dashboard")}
              className={pageTitle === "Dashboard" ? "active" : ""}
            >
              Dashboard
            </button>
            <button
              onClick={() => setPageTitle("Users")}
              className={pageTitle === "Users" ? "active" : ""}
            >
              Users
            </button>
            <button
              onClick={() => setPageTitle("Ideas")}
              className={pageTitle === "Ideas" ? "active" : ""}
            >
              Ideas
            </button>
            <button
              onClick={() => setPageTitle("Investors")}
              className={pageTitle === "Investors" ? "active" : ""}
            >
              Investors
            </button>
            <button
              onClick={() => setPageTitle("Hackathons")}
              className={pageTitle === "Hackathons" ? "active" : ""}
            >
              Hackathons
            </button>
            <button
              onClick={() => setPageTitle("Messages")}
              className={pageTitle === "Messages" ? "active" : ""}
            >
              Messages
            </button>
            <button
              onClick={() => setPageTitle("Admin Messages")}
              className={pageTitle === "Admin Messages" ? "active" : ""}
            >
              Admin Messages
            </button>
            <button onClick={() => navigate("/analytics")}>Analytics</button>
            <button onClick={() => navigate("/reports")}>Reports</button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <div className="main admin-main">
          {/* TOP BAR */}
          <header className="topbar admin-topbar">
            <div className="topbar-left">
              <h3 className="topbar-title">{pageTitle}</h3>
              <div className="search-field">
                <input type="text" placeholder="Search..." className="search-input" />
              </div>
            </div>

            <div className="top-actions">
              <button className="btn-primary" onClick={() => navigate("/add-idea")}> 
                Create Post
              </button>
              <div className="profile-menu">
                <button className="profile-trigger" type="button">
                  <span className="avatar">A</span>
                  <span className="profile-name">Admin</span>
                  <span className="chevron">v</span>
                </button>
                <div className="profile-dropdown">
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/profile")}
                  >
                    Profile
                  </button>
                  <button className="logout-btn btn-danger" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          {renderContent()}
        </div>
      </div>
      <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}
