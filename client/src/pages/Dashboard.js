import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchIdeas } from "../services/ideaService";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboardTheme.css";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);

  useEffect(() => {
    if (authLoading || !currentUser) {
      setLoadingIdeas(false);
      return;
    }

    const loadIdeas = async () => {
      setLoadingIdeas(true);
      try {
        const data = await fetchIdeas();
        setIdeas(data);
      } catch (error) {
        console.error("Error fetching ideas:", error);
      } finally {
        setLoadingIdeas(false);
      }
    };
    loadIdeas();
  }, [authLoading, currentUser]);

  const handleLogout = async () => {
    navigate("/");
    await signOut(auth);
  };

  const profileName =
    currentUser?.displayName || currentUser?.email || "Profile";
  const profileInitial = profileName ? profileName[0].toUpperCase() : "P";

  return (
    <div className="dashboard-shell">
      <div className="dashboard-frame">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2 className="logo">IdeaHub</h2>
          <nav>
            <ul>
              <li className="active" onClick={() => navigate("/dashboard")}>
                Feed
              </li>
              <li onClick={() => navigate("/my-ideas")}>My Ideas</li>
              <li onClick={() => navigate("/bookmarks")}>Bookmarks</li>
              <li onClick={() => navigate("/members")}>Members</li>
              <li onClick={() => navigate("/investors")}>Investors</li>
              <li onClick={() => navigate("/investor/dashboard")}>
                Investor Dashboard
              </li>
              <li onClick={() => alert("Hackathon will be announced shortly")}>
                Hackathons
              </li>
              <li onClick={() => navigate("/activity")}>Activity</li>
              <li onClick={() => navigate("/settings")}>Settings</li>
            </ul>
          </nav>
        </aside>

        {/* Main Section */}
        <main className="main">
          {/* Top Bar */}
          <header className="topbar">
            <div className="topbar-left">
              <h2 className="topbar-title">Dashboard</h2>
              <div className="search-field">
                <input type="text" placeholder="Search ideas, users..." />
              </div>
            </div>
            <div className="top-actions">
              <button
                className="btn-primary"
                onClick={() => navigate("/add-idea")}
              >
                Create Post
              </button>
              <div className="profile-menu">
                <button className="profile-trigger" type="button">
                  <span className="avatar">{profileInitial}</span>
                  <span className="profile-name">{profileName}</span>
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

          {/* Feed */}
          <section className="feed">
            <div className="section-title">
              <h3>Idea Feed</h3>
              <span className="section-subtitle">Latest ideas from the community</span>
            </div>

            {loadingIdeas ? (
              <p>Loading ideas...</p>
            ) : (
              ideas.map((idea) => (
                <div
                  key={idea._id}
                  className="idea-card"
                  onClick={() => navigate(`/idea/${idea._id}`)}
                >
                  <h4>{idea.title}</h4>
                  <p>{idea.solutionDescription}</p>
                  <div className="tags">
                    {idea.tags &&
                      idea.tags.map((tag, index) => (
                        <span key={index}>{tag}</span>
                      ))}
                  </div>
                  <div className="stats">
                    <span>Views {idea.views || 0}</span>
                    <span>Likes {idea.likes || 0}</span>
                    <span>Comments {idea.comments || 0}</span>
                  </div>
                </div>
              ))
            )}
          </section>
        </main>

        {/* Right Panel */}
        <aside className="right-panel">
          <div className="panel-card">
            <h4>Insights</h4>
            <ul className="insights-list">
              <li onClick={() => navigate("/trending-ideas")}>Trending Ideas</li>
              <li onClick={() => navigate("/investor-views")}>
                Investors viewed your profile
              </li>
              <li onClick={() => navigate("/weekly-stats")}>Weekly Stats</li>
              <li onClick={() => navigate("/suggested-collaborators")}>
                Suggested Collaborators
              </li>
            </ul>
          </div>

          <div className="panel-card">
            <h4>Quick Actions</h4>
            <button className="btn-primary" onClick={() => navigate("/add-idea")}>
              Create Post
            </button>
            <button onClick={() => navigate("/activity")}>View Activity</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
