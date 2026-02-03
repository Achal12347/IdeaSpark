import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { fetchIdeas } from "../services/ideaService";
import { fetchUserProfile } from "../services/userService";
import "../styles/dashboardTheme.css";
import "../styles/AdminDashboard.css";

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M4 7h16M4 12h16M4 17h16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M7 17l-3 3V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H7z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 9h8M8 12h5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 01-6 0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function AdminDashboard() {
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIdeas: 0,
    activeToday: 0,
    pendingReviews: 0,
  });
  const [ideas, setIdeas] = useState([]);
  const [users, setUsers] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setMessagesError("");
        const ideasData = await fetchIdeas();
        setIdeas(ideasData);
        setStats((prev) => ({ ...prev, totalIdeas: ideasData.length }));

        const usersData = await fetchUserProfile();
        setUsers(usersData);
        setStats((prev) => ({ ...prev, totalUsers: usersData.length }));

        setStats((prev) => ({ ...prev, activeToday: 89 }));
        setStats((prev) => ({ ...prev, pendingReviews: 12 }));

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
      } catch (error) {
        console.error("Error loading admin data:", error);
        setMessagesError(error.message || "Unable to load contact messages.");
      } finally {
        setLoadingMessages(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    navigate("/", { replace: true });
    await auth.signOut();
  };

  const renderContent = () => {
    switch (pageTitle) {
      case "Ideas":
        return (
          <section className="admin-content">
            <h3>All Ideas</h3>
            <div className="admin-grid">
              {ideas.map((idea) => (
                <div key={idea._id} className="idea-card card">
                  <h4>{idea.title}</h4>
                  <p>{idea.description}</p>
                </div>
              ))}
            </div>
          </section>
        );
      case "Users":
        return (
          <section className="admin-content">
            <h3>All Users</h3>
            <div className="admin-grid">
              {users.map((user) => (
                <div key={user._id} className="user-card card">
                  <h4>{user.name}</h4>
                  <p>Roles: {user.roles?.length ? user.roles.join(", ") : "—"}</p>
                  <p>
                    Skills:{" "}
                    {user.skills?.length ? user.skills.slice(0, 3).join(", ") : "—"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        );
      case "Hackathons":
        return (
          <section className="admin-content">
            <h3>Hackathon Management</h3>
            <p>Control hackathon modes, create events, manage submissions, and view rankings.</p>
            <div className="admin-actions">
              <button className="btn-primary">Create New Hackathon</button>
              <button>Manage Active Hackathons</button>
              <button>View Rankings</button>
            </div>
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
            {messagesError ? (
              <p className="admin-error">{messagesError}</p>
            ) : null}
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
                <h4>Active Today</h4>
                <p>{stats.activeToday}</p>
              </div>
              <div className="stat-card card highlight">
                <h4>Pending Reviews</h4>
                <p>{stats.pendingReviews}</p>
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
            <button onClick={() => navigate("/analytics")}>Analytics</button>
            <button onClick={() => navigate("/reports")}>Reports</button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <div className="main admin-main">
          {/* TOP BAR */}
          <header className="topbar admin-topbar">
            <div className="topbar-left">
              <button className="icon-btn" aria-label="Menu">
                <MenuIcon />
              </button>
              <h3 className="topbar-title">{pageTitle}</h3>
              <div className="search-field">
                <input type="text" placeholder="Search..." className="search-input" />
              </div>
            </div>

            <div className="top-actions">
              <button className="btn-primary" onClick={() => navigate("/add-idea")}>
                Create Post
              </button>
              <button className="icon-btn" aria-label="Messages">
                <MessageIcon />
              </button>
              <button className="icon-btn" aria-label="Notifications">
                <BellIcon />
              </button>
              <div className="profile-menu">
                <button className="profile-trigger" type="button">
                  <span className="avatar">A</span>
                  <span className="profile-name">Admin</span>
                  <span className="chevron">v</span>
                </button>
                <div className="profile-dropdown">
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
    </div>
  );
}
