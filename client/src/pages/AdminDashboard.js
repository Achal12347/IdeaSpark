import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import apiRequest from "../services/api";
import { fetchIdeas } from "../services/ideaService";
import { fetchAllUsers } from "../services/userService";
import IdeaCard from "../components/IdeaCard";
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
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setMessagesError("");
        const [ideasData, usersData] = await Promise.all([
          fetchIdeas(),
          fetchAllUsers(),
        ]);
        const analyticsData = await apiRequest("/api/analytics").catch(() => null);

        const safeIdeas = Array.isArray(ideasData) ? ideasData : [];
        const safeUsers = Array.isArray(usersData) ? usersData : [];

        setIdeas(safeIdeas);
        setUsers(safeUsers);
        setAnalytics(analyticsData || null);

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
                  <div key={user._id} className="user-card card">
                    <h4>{user.name || user.email || "User"}</h4>
                    <p>Roles: {user.roles?.length ? user.roles.join(", ") : "N/A"}</p>
                    <p>
                      Skills:{" "}
                      {user.skills?.length ? user.skills.slice(0, 3).join(", ") : "N/A"}
                    </p>
                    <p>Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
                  </div>
                ))
              )}
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
    </div>
  );
}
