import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { fetchIdeas } from "../services/ideaService";
import { fetchUserProfile } from "../services/userService";
import "../styles/AdminDashboard.css";

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
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const ideasData = await fetchIdeas();
        setIdeas(ideasData);
        setStats((prev) => ({ ...prev, totalIdeas: ideasData.length }));

        const usersData = await fetchUserProfile();
        setUsers(usersData);
        setStats((prev) => ({ ...prev, totalUsers: usersData.length }));

        // Placeholder for activeToday and pendingReviews
        setStats((prev) => ({ ...prev, activeToday: 89 })); // Placeholder
        setStats((prev) => ({ ...prev, pendingReviews: 12 })); // Placeholder
      } catch (error) {
        console.error("Error loading admin data:", error);
      }
    };
    loadData();
  }, []);

  // Logout handler
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
            {ideas.map((idea) => (
              <div key={idea._id} className="idea-card">
                <h4>{idea.title}</h4>
                <p>{idea.description}</p>
              </div>
            ))}
          </section>
        );
      case "Users":
        return (
          <section className="admin-content">
            <h3>All Users</h3>
            <div className="users-list">
              {users.map((user) => (
                <div key={user._id} className="user-card">
                  <h4>{user.name}</h4>
                  <p>Expertise: {user.expertise}</p>
                  <p>Workplace: {user.workplace}</p>
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
            <button>Create New Hackathon</button>
            <button>Manage Active Hackathons</button>
            <button>View Rankings</button>
          </section>
        );
      default:
        return (
          <section className="admin-content">
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Users</h4>
                <p>{stats.totalUsers}</p>
              </div>
              <div className="stat-card">
                <h4>Total Ideas</h4>
                <p>{stats.totalIdeas}</p>
              </div>
              <div className="stat-card">
                <h4>Active Today</h4>
                <p>{stats.activeToday}</p>
              </div>
              <div className="stat-card highlight">
                <h4>Pending Reviews</h4>
                <p>{stats.pendingReviews}</p>
              </div>
            </div>
          </section>
        );
    }
  };

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
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
          <button onClick={() => setPageTitle("Investors")}>Investors</button>
          <button onClick={() => setPageTitle("Hackathons")}>Hackathons</button>
          <button onClick={() => setPageTitle("Analytics")}>Analytics</button>
          <button onClick={() => setPageTitle("Reports")}>Reports</button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="admin-main">
        {/* TOP BAR */}
        <header className="admin-topbar">
          <h3>{pageTitle}</h3>

          <div className="topbar-actions">
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
            />

            <button className="icon-btn">🔔</button>

            <div className="admin-profile">
              <span>Admin</span>
              <img
                src="https://i.pravatar.cc/40"
                alt="Admin"
              />
            </div>
          </div>
        </header>

        {renderContent()}
      </div>
    </div>
  );
}
