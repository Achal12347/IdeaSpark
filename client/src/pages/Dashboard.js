import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";


export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    navigate("/");
    await signOut(auth);
  };

   return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">IdeaHub</h2>
        <nav>
          <ul>
            <li className="active">Feed</li>
            <li onClick={() => navigate("/my-ideas")}>My Ideas</li>
            <li>Bookmarks</li>
            <li>Members</li>
            <li>Investors</li>
            <li>Activity</li>
            <li>Settings</li>
          </ul>
        </nav>
      </aside>

      {/* Main Section */}
      <main className="main">
        {/* Top Bar */}
        <header className="topbar">
          <input type="text" placeholder="Search ideas, users..." />
          <div className="top-actions">
            <span className="notification">🔔</span>
            <div className="profile-menu">
              <span className="avatar">A</span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </header>

        {/* Feed */}
        <section className="feed">
          <h3>Idea Feed</h3>

          {/* Idea Card */}
          <div className="idea-card">
            <h4>AI Resume Analyzer</h4>
            <p>
              An AI-based tool that reviews resumes and suggests improvements
              based on job descriptions.
            </p>
            <div className="tags">
              <span>AI</span>
              <span>HR</span>
              <span>SaaS</span>
            </div>
            <div className="stats">
              <span>👀 124</span>
              <span>⭐ 32</span>
              <span>💬 8</span>
            </div>
          </div>

          <div className="idea-card">
            <h4>Smart Parking System</h4>
            <p>
              IoT-based smart parking solution for urban cities with real-time
              slot availability.
            </p>
            <div className="tags">
              <span>IoT</span>
              <span>Smart City</span>
            </div>
            <div className="stats">
              <span>👀 98</span>
              <span>⭐ 21</span>
              <span>💬 5</span>
            </div>
          </div>
        </section>
      </main>

      {/* Right Panel */}
      <aside className="right-panel">
        <h4>Insights</h4>
        <ul>
          <li>🔥 Trending Ideas</li>
          <li>👤 Investors viewed your profile</li>
          <li>📊 Weekly Stats</li>
          <li>💡 Suggested Collaborators</li>
        </ul>
      </aside>

      {/* Floating Add Idea Button */}
      <button
        className="fab"
        onClick={() => navigate("/add-idea")}
        title="Add Idea"
      >
        +
      </button>
    </div>
  );
}
