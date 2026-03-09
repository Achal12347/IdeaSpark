import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGetIdeasQuery } from "../store/apiSlice";
import { useEffect, useMemo, useState, useCallback } from "react";
import io from "socket.io-client";
import IdeaCard from "../components/IdeaCard";
import apiRequest from "../services/api";
import "../styles/dashboardTheme.css";
import "../styles/Dashboard.css";

const FEED_FILTERS = [
  { id: "all", label: "All" },
  { id: "trending", label: "Trending" },
  { id: "funding", label: "Seeking Funding" },
  { id: "domain", label: "My Domain" },
  { id: "active", label: "Recently Active" },
];

const DASHBOARD_MODULES = [
  { id: "insights", label: "Insights" },
  { id: "quickActions", label: "Quick Actions" },
  { id: "gamification", label: "Progress + Badges" },
];

const loadStoredValue = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [feedFilter, setFeedFilter] = useState("all");
  const [quickToast, setQuickToast] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [personalizationOpen, setPersonalizationOpen] = useState(false);
  const [moduleOrder, setModuleOrder] = useState(() =>
    loadStoredValue("ideaspark.dashboard.moduleOrder", DASHBOARD_MODULES.map((item) => item.id))
  );
  const [hiddenModules, setHiddenModules] = useState(() =>
    loadStoredValue("ideaspark.dashboard.hiddenModules", {})
  );
  const [messageNotifications, setMessageNotifications] = useState([]);
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

  const loadMessageNotifications = useCallback(async () => {
    if (authLoading || !currentUser) return;
    try {
      const data = await apiRequest(
        "/api/activity?type=direct_message_received&undismissed=true&limit=10"
      );
      setMessageNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to load notifications:", error);
    }
  }, [authLoading, currentUser]);

  useEffect(() => {
    if (authLoading || !currentUser) return;
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socket.on("ideasUpdated", () => {
      refetch();
    });
    socket.on("directMessage", () => {
      loadMessageNotifications();
    });
    socket.on("activityUpdated", () => {
      loadMessageNotifications();
    });
    return () => socket.disconnect();
  }, [authLoading, currentUser, refetch, socketUrl, loadMessageNotifications]);

  useEffect(() => {
    loadMessageNotifications();
  }, [loadMessageNotifications]);

  useEffect(() => {
    if (authLoading || !currentUser) return;
    const loadProfile = async () => {
      try {
        const data = await apiRequest("/api/users/me");
        setUserProfile(data || null);
      } catch (error) {
        setUserProfile(null);
      }
    };
    loadProfile();
  }, [authLoading, currentUser]);

  useEffect(() => {
    window.localStorage.setItem(
      "ideaspark.dashboard.moduleOrder",
      JSON.stringify(moduleOrder)
    );
  }, [moduleOrder]);

  useEffect(() => {
    window.localStorage.setItem(
      "ideaspark.dashboard.hiddenModules",
      JSON.stringify(hiddenModules)
    );
  }, [hiddenModules]);

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
  const trendingIds = useMemo(() => {
    const ranked = [...sortedIdeas]
      .map((idea) => ({
        id: idea._id,
        score:
          Number(idea.views || 0) +
          Number(idea.averageRating || 0) * 18 +
          Number(idea.totalRatings || 0) * 8,
      }))
      .sort((a, b) => b.score - a.score);
    const topSize = Math.max(1, Math.ceil(ranked.length * 0.25));
    return new Set(ranked.slice(0, topSize).map((item) => item.id));
  }, [sortedIdeas]);
  const domainInterestSet = useMemo(() => {
    return new Set((userProfile?.interests || []).map((item) => item.toLowerCase()));
  }, [userProfile?.interests]);

  const matchesFeedFilter = useCallback(
    (idea, filterId) => {
      if (filterId === "all") return true;
      if (filterId === "trending") return trendingIds.has(idea._id);
      if (filterId === "funding") return (idea.fundingStatus || "seeking") !== "funded";
      if (filterId === "domain") {
        if (domainInterestSet.size === 0) return false;
        const market = (idea.marketCategory || "").toLowerCase();
        const tags = Array.isArray(idea.tags)
          ? idea.tags.map((tag) => String(tag).toLowerCase())
          : [];
        return domainInterestSet.has(market) || tags.some((tag) => domainInterestSet.has(tag));
      }
      if (filterId === "active") {
        if (!idea?.createdAt) return false;
        const createdTime = new Date(idea.createdAt).getTime();
        if (!createdTime) return false;
        return Date.now() - createdTime <= 7 * 24 * 60 * 60 * 1000;
      }
      return true;
    },
    [domainInterestSet, trendingIds]
  );

  const filterCounts = useMemo(() => {
    const counts = { all: sortedIdeas.length, trending: 0, funding: 0, domain: 0, active: 0 };
    sortedIdeas.forEach((idea) => {
      FEED_FILTERS.forEach((filter) => {
        if (filter.id === "all") return;
        if (matchesFeedFilter(idea, filter.id)) {
          counts[filter.id] += 1;
        }
      });
    });
    return counts;
  }, [sortedIdeas, matchesFeedFilter]);

  const filteredIdeas = useMemo(() => {
    const filteredByTab = sortedIdeas.filter((idea) => matchesFeedFilter(idea, feedFilter));
    if (!normalizedSearch) return filteredByTab;
    return filteredByTab.filter((idea) => {
      const tags = Array.isArray(idea.tags) ? idea.tags.join(" ") : "";
      const author = idea.author?.name || idea.author?.email || "";
      const haystack = `${idea.title || ""} ${idea.problemStatement || ""} ${idea.solutionDescription || ""} ${tags} ${author}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [feedFilter, matchesFeedFilter, normalizedSearch, sortedIdeas]);

  const completionChecks = useMemo(
    () => [
      Boolean(userProfile?.name),
      Boolean(userProfile?.bio),
      Array.isArray(userProfile?.roles) && userProfile.roles.length > 0,
      Array.isArray(userProfile?.skills) && userProfile.skills.length > 0,
      Array.isArray(userProfile?.interests) && userProfile.interests.length > 0,
      Boolean(
        userProfile?.links?.github ||
          userProfile?.links?.portfolio ||
          userProfile?.links?.linkedin
      ),
    ],
    [userProfile]
  );
  const profileCompletion = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100
  );
  const weeklyIdeaCount = sortedIdeas.filter((idea) => {
    if (!idea?.createdAt) return false;
    const createdTime = new Date(idea.createdAt).getTime();
    return Date.now() - createdTime <= 7 * 24 * 60 * 60 * 1000;
  }).length;
  const badges = useMemo(() => {
    const nextBadges = [];
    if (profileCompletion >= 80) nextBadges.push("Builder Ready");
    if (sortedIdeas.length >= 1) nextBadges.push("First Spark");
    if (sortedIdeas.length >= 5) nextBadges.push("Consistent Creator");
    if (weeklyIdeaCount >= 2) nextBadges.push("Weekly Momentum");
    return nextBadges;
  }, [profileCompletion, sortedIdeas.length, weeklyIdeaCount]);

  const profileName =
    currentUser?.displayName || currentUser?.email || "Profile";
  const profileInitial = profileName ? profileName[0].toUpperCase() : "P";

  const setToast = (message) => {
    setQuickToast(message);
    window.setTimeout(() => setQuickToast(""), 1600);
  };

  const handleIdeaQuickAction = async (actionId, idea) => {
    if (actionId === "bookmark") {
      try {
        await apiRequest("/api/users/bookmarks", {
          method: "POST",
          body: JSON.stringify({ ideaId: idea._id }),
        });
        setToast("Saved to bookmarks");
      } catch (error) {
        setToast("Already saved");
      }
      return true;
    }
    if (actionId === "comment") {
      navigate(`/idea/${idea._id}`);
      return true;
    }
    if (actionId === "pitch") {
      navigate("/investors");
      return true;
    }
    return false;
  };

  const toggleModuleVisibility = (moduleId) => {
    setHiddenModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const moveModule = (moduleId, direction) => {
    setModuleOrder((prev) => {
      const index = prev.indexOf(moduleId);
      if (index < 0) return prev;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[nextIndex];
      updated[nextIndex] = temp;
      return updated;
    });
  };

  const renderDashboardModule = (moduleId) => {
    if (moduleId === "insights") {
      return (
        <div className="panel-card" key={moduleId}>
          <h4>Insights</h4>
          <ul className="insights-list">
            <li onClick={() => navigate("/trending-ideas")}>Trending Ideas</li>
            <li onClick={() => navigate("/investors")}>Investors viewed your profile</li>
            <li onClick={() => navigate("/weekly-stats")}>Weekly Stats</li>
            <li onClick={() => navigate("/suggested-collaborators")}>
              Suggested Collaborators
            </li>
          </ul>
        </div>
      );
    }

    if (moduleId === "quickActions") {
      return (
        <div className="panel-card" key={moduleId}>
          <h4>Quick Actions</h4>
          <button className="btn-primary" onClick={() => navigate("/add-idea")}>
            Create Post
          </button>
          <button onClick={() => navigate("/activity")}>View Activity</button>
          <button onClick={() => navigate("/messages")}>Open Messages</button>
        </div>
      );
    }

    if (moduleId === "gamification") {
      return (
        <div className="panel-card" key={moduleId}>
          <h4>Progress + Badges</h4>
          <div className="completion-meta">
            <span>Profile completion</span>
            <strong>{profileCompletion}%</strong>
          </div>
          <div className="completion-track">
            <span style={{ width: `${profileCompletion}%` }} />
          </div>
          <p className="completion-note">
            {weeklyIdeaCount} ideas posted in the last 7 days.
          </p>
          <div className="badge-row">
            {badges.length === 0 ? (
              <span className="badge-pill muted">No badges yet</span>
            ) : (
              badges.map((badge) => (
                <span key={badge} className="badge-pill">
                  {badge}
                </span>
              ))
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const visibleModuleOrder = moduleOrder.filter((moduleId) => !hiddenModules[moduleId]);

  return (
    <div className="dashboard-shell dashboard-layout-shell">
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
            <div className="dashboard-hero card">
              <div>
                <h3>Build momentum this week</h3>
                <p>
                  Filter your feed, act quickly, and keep your idea streak alive with
                  smart shortcuts.
                </p>
              </div>
              <div className="dashboard-hero-metrics">
                <span>{sortedIdeas.length} ideas in your feed</span>
                <span>{messageNotifications.length} unread private alerts</span>
                <span>{badges.length} active badges</span>
              </div>
            </div>

            {messageNotifications.length > 0 ? (
              <div className="dashboard-notification">
                <div>
                  <h4>
                    {messageNotifications.length === 1
                      ? "You have a new private message"
                      : `You have ${messageNotifications.length} new private messages`}
                  </h4>
                  <p>Please check the Messages page to respond.</p>
                </div>
                <div className="dashboard-notification-actions">
                  <button
                    className="btn-primary"
                    onClick={() => navigate("/messages")}
                  >
                    Open Messages
                  </button>
                  <button
                    onClick={async () => {
                      await apiRequest("/api/activity/dismiss", {
                        method: "POST",
                        body: JSON.stringify({ type: "direct_message_received" }),
                      });
                      setMessageNotifications([]);
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : null}
            <div className="section-title">
              <h3>Idea Feed</h3>
              <span className="section-subtitle">Latest ideas from the community</span>
            </div>

            <div className="feed-filter-row">
              {FEED_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  className={`feed-filter-chip ${feedFilter === filter.id ? "active" : ""}`}
                  onClick={() => setFeedFilter(filter.id)}
                >
                  <span>{filter.label}</span>
                  <small>{filterCounts[filter.id] || 0}</small>
                </button>
              ))}
            </div>

            {loadingIdeas ? (
              <div className="feed-skeleton-list">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="feed-skeleton card" />
                ))}
              </div>
            ) : filteredIdeas.length > 0 ? (
              filteredIdeas.map((idea) => (
                <IdeaCard
                  key={idea._id}
                  idea={idea}
                  variant="user"
                  className="card"
                  quickActions={[
                    { id: "bookmark", label: "Save" },
                    { id: "comment", label: "Comment" },
                    { id: "share", label: "Share" },
                  ]}
                  onQuickAction={handleIdeaQuickAction}
                  onClick={() => navigate(`/idea/${idea._id}`)}
                />
              ))
            ) : (
              <div className="feed-empty card">
                <h4>No ideas match this view</h4>
                <p>Try another filter or create a fresh idea to spark collaboration.</p>
                <div className="feed-empty-actions">
                  <button className="btn-primary" onClick={() => setFeedFilter("all")}>
                    Reset Filters
                  </button>
                  <button onClick={() => navigate("/add-idea")}>Create Idea</button>
                </div>
              </div>
            )}
            <div className="mobile-panels">
              {visibleModuleOrder.map((moduleId) => renderDashboardModule(moduleId))}
            </div>
          </section>
        </main>

        {/* Right Panel */}
        <aside className="right-panel">
          <div className="panel-card module-customizer">
            <div className="module-customizer-head">
              <h4>Customize Dashboard</h4>
              <button onClick={() => setPersonalizationOpen((prev) => !prev)}>
                {personalizationOpen ? "Hide" : "Edit"}
              </button>
            </div>
            {personalizationOpen ? (
              <div className="module-customizer-list">
                {DASHBOARD_MODULES.map((module) => {
                  const currentIndex = moduleOrder.indexOf(module.id);
                  return (
                    <div key={module.id} className="module-customizer-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={!hiddenModules[module.id]}
                          onChange={() => toggleModuleVisibility(module.id)}
                        />
                        {module.label}
                      </label>
                      <div className="module-customizer-actions">
                        <button onClick={() => moveModule(module.id, "up")}>Up</button>
                        <button onClick={() => moveModule(module.id, "down")}>Down</button>
                      </div>
                      <small>Position {currentIndex + 1}</small>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="module-customizer-note">
                Reorder modules and show only what you use daily.
              </p>
            )}
          </div>
          {visibleModuleOrder.map((moduleId) => renderDashboardModule(moduleId))}
        </aside>
      </div>
      {quickToast ? <div className="dashboard-toast">{quickToast}</div> : null}
    </div>
  );
}
