import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import IdeaCard from "../components/IdeaCard";
import "../styles/appPageTheme.css";
import "../styles/Unauthorized.css";

export default function Unauthorized() {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promptIdea, setPromptIdea] = useState(null);

  useEffect(() => {
    const loadPublic = async () => {
      try {
        const baseUrl = process.env.REACT_APP_API_URL || "";
        const ideasResponse = await fetch(`${baseUrl}/api/ideas`);
        const ideasData = await ideasResponse.json();
        const sortedIdeas = Array.isArray(ideasData)
          ? [...ideasData].sort((a, b) => {
              const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
              const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
              return bTime - aTime;
            })
          : [];
        setIdeas(sortedIdeas);

        const usersResponse = await fetch(`${baseUrl}/api/public/users`);
        const usersData = await usersResponse.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        console.error("Public explore error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPublic();
  }, []);

  const handleIdeaClick = (idea) => {
    setPromptIdea(idea);
  };

  return (
    <div className="app-page unauthorized-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h1 className="app-title">Explore Ideas</h1>
            <p className="app-subtitle">
              Discover real projects shared by the IdeaSpark community.
            </p>
          </div>
          <button className="app-button" onClick={() => navigate("/signup")}>Join now</button>
        </div>

        {loading ? (
          <div className="unauthorized-loading">Loading ideas...</div>
        ) : (
          <div className="unauthorized-grid">
            <section className="unauthorized-ideas">
              <h3>Latest ideas</h3>
              <div className="ideas-grid app-grid">
                {(ideas || []).slice(0, 8).map((idea) => (
                  <IdeaCard
                    key={idea._id}
                    idea={idea}
                    variant="user"
                    className="app-card"
                    onClick={() => handleIdeaClick(idea)}
                  />
                ))}
              </div>
            </section>

            <aside className="unauthorized-users app-card">
              <h3>Meet the builders</h3>
              <p className="unauthorized-note">Top contributors recently active on the platform.</p>
              <div className="unauthorized-user-list">
                {users.slice(0, 10).map((user) => (
                  <div key={user._id} className="unauthorized-user">
                    <div className="unauthorized-avatar">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="unauthorized-user-name">{user.name || user.username || "Member"}</p>
                      <p className="unauthorized-user-role">
                        {user.roles?.length ? user.roles.join(", ") : "Community member"}
                      </p>
                    </div>
                  </div>
                ))}
                {users.length === 0 ? (
                  <p className="unauthorized-note">No public profiles available.</p>
                ) : null}
              </div>
              <button className="app-button-secondary" onClick={() => navigate("/signup")}>See full community</button>
            </aside>
          </div>
        )}
      </div>

      {promptIdea ? (
        <div className="unauthorized-overlay" onClick={() => setPromptIdea(null)}>
          <div className="unauthorized-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Sign in to view details</h3>
            <p>
              Create an account to view full idea details, connect with founders,
              and start collaborating.
            </p>
            <div className="unauthorized-actions">
              <button className="app-button" onClick={() => navigate("/signup")}>Sign up</button>
              <button className="app-button-secondary" onClick={() => navigate("/login")}>Log in</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
