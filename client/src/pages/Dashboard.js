import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGetIdeasQuery } from "../store/apiSlice";
import { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import IdeaCard from "../components/IdeaCard";
import "../styles/dashboardTheme.css";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: ideas = [], isLoading: loadingIdeas, refetch } = useGetIdeasQuery(
    undefined,
    {
      skip: authLoading || !currentUser,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
      pollingInterval: 15000,
    }
  );
  const socketUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(
    /\/api\/?$/,
    ""
  );

  useEffect(() => {
    if (authLoading || !currentUser) return;
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socket.on("ideasUpdated", () => {
      refetch();
    });
    return () => socket.disconnect();
  }, [authLoading, currentUser, refetch, socketUrl]);

  const handleLogout = async () => {
    navigate("/");
    await signOut(auth);
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const sortedIdeas = useMemo(() => {
    return [...ideas].sort((a, b) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [ideas]);
  const filteredIdeas = useMemo(() => {
    if (!normalizedSearch) return sortedIdeas;
    return sortedIdeas.filter((idea) => {
      const tags = Array.isArray(idea.tags) ? idea.tags.join(" ") : "";
      const author = idea.author?.name || idea.author?.email || "";
      const haystack = `${idea.title || ""} ${idea.problemStatement || ""} ${idea.solutionDescription || ""} ${tags} ${author}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [normalizedSearch, sortedIdeas]);

  const profileName =
    currentUser?.displayName || currentUser?.email || "Profile";
  const profileInitial = profileName ? profileName[0].toUpperCase() : "P";

  return (
    <div className="dashboard-shell">
      <div className="dashboard-frame">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2 className="logo">IdeaSpark</h2>
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
              <li onClick={() => navigate("/hackathons")}>Hackathons</li>
              <li onClick={() => navigate("/messages")}>Messages</li>
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
                <input
                  type="text"
                  placeholder="Search ideas, users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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

          <nav className="mobile-nav">
            <button className="active" onClick={() => navigate("/dashboard")}>
              Feed
            </button>
            <button onClick={() => navigate("/my-ideas")}>My Ideas</button>
            <button onClick={() => navigate("/bookmarks")}>Bookmarks</button>
            <button onClick={() => navigate("/members")}>Members</button>
            <button onClick={() => navigate("/investors")}>Investors</button>
            <button onClick={() => navigate("/investor/dashboard")}>
              Investor Dashboard
            </button>
            <button onClick={() => navigate("/hackathons")}>Hackathons</button>
            <button onClick={() => navigate("/messages")}>Messages</button>
            <button onClick={() => navigate("/activity")}>Activity</button>
            <button onClick={() => navigate("/settings")}>Settings</button>
          </nav>

          {/* Feed */}
          <section className="feed">
            <div className="section-title">
              <h3>Idea Feed</h3>
              <span className="section-subtitle">Latest ideas from the community</span>
            </div>

            {loadingIdeas ? (
              <p>Loading ideas...</p>
            ) : (
              filteredIdeas.map((idea) => (
                <IdeaCard
                  key={idea._id}
                  idea={idea}
                  variant="user"
                  onClick={() => navigate(`/idea/${idea._id}`)}
                />
              ))
            )}
            <div className="mobile-panels">
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
            </div>
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
