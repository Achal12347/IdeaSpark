import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchIdeas } from "../services/ideaService";
import "../styles/Dashboard.css";


export default function Dashboard() {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);

  useEffect(() => {
    const loadIdeas = async () => {
      try {
        const data = await fetchIdeas();
        setIdeas(data);
      } catch (error) {
        console.error("Error fetching ideas:", error);
      }
    };
    loadIdeas();
  }, []);

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
            <li onClick={() => alert("Hackathon will be announced shortly")}>Hackathons</li>
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
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </header>

        {/* Feed */}
        <section className="feed">
          <h3>Idea Feed</h3>

          {ideas.map((idea) => (
            <div key={idea._id} className="idea-card">
              <h4>{idea.title}</h4>
              <p>{idea.description}</p>
              <div className="tags">
                {idea.tags && idea.tags.map((tag, index) => (
                  <span key={index}>{tag}</span>
                ))}
              </div>
              <div className="stats">
                <span>👀 {idea.views || 0}</span>
                <span>⭐ {idea.likes || 0}</span>
                <span>💬 {idea.comments || 0}</span>
              </div>
            </div>
          ))}
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
