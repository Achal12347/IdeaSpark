import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = async () => {
    navigate("/", { replace: true });
    await auth.signOut();
  };

 return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2 className="logo">IdeaSpark</h2>

        <nav className="sidebar-nav">
          <button onClick={() => setPageTitle("Dashboard")} className="active">Dashboard</button>
          <button onClick={() => setPageTitle("Users")}>Users</button>
          <button onClick={() => setPageTitle("Ideas")}>Ideas</button>
          <button onClick={() => setPageTitle("Investors")}>Investors</button>
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

        {/* DASHBOARD CONTENT */}
        <section className="admin-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Users</h4>
              <p>1,240</p>
            </div>

            <div className="stat-card">
              <h4>Total Ideas</h4>
              <p>342</p>
            </div>

            <div className="stat-card">
              <h4>Active Today</h4>
              <p>89</p>
            </div>

            <div className="stat-card highlight">
              <h4>Pending Reviews</h4>
              <p>12</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}