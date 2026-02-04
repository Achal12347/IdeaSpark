import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchUserProfile, updateUserProfile } from "../services/userService";
import { auth } from "../firebase";
import io from "socket.io-client";
import "../styles/appPageTheme.css";
import "../styles/Settings.css";

const notificationDefaults = {
  ideaComments: true,
  teamInvites: true,
  hackathonUpdates: true,
  investorInterest: true,
  emailNotifications: false,
  inAppNotifications: true,
};

const appearanceDefaults = {
  theme: "light",
  density: "comfortable",
};

const collaborationOptions = [
  "Team",
  "Collaborators",
  "Mentorship",
  "Investment",
];

const availabilityOptions = ["Part-time", "Full-time", "Weekends"];

export default function Settings() {
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    links: { github: "", portfolio: "", linkedin: "" },
    collaborationPreferences: [],
    availability: "",
    notificationSettings: notificationDefaults,
    appearanceSettings: appearanceDefaults,
    createdAt: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchUserProfile();
        setProfile({
          name: data?.name || "",
          bio: data?.bio || "",
          links: {
            github: data?.links?.github || "",
            portfolio: data?.links?.portfolio || "",
            linkedin: data?.links?.linkedin || "",
          },
          collaborationPreferences: data?.collaborationPreferences || [],
          availability: data?.availability || "",
          notificationSettings: {
            ...notificationDefaults,
            ...(data?.notificationSettings || {}),
          },
          appearanceSettings: {
            ...appearanceDefaults,
            ...(data?.appearanceSettings || {}),
          },
          createdAt: data?.createdAt || "",
        });

        const userEmail = auth.currentUser?.email || "";
        setContactForm((prev) => ({
          ...prev,
          name: data?.name || prev.name,
          email: userEmail || prev.email,
        }));
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const socketUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(
      /\/api\/?$/,
      ""
    );
    const socket = io(socketUrl, { transports: ["websocket"] });
    socket.on("userUpdated", async (payload) => {
      if (!payload?.userId) return;
      if (!auth.currentUser) return;
      const data = await fetchUserProfile();
      if (data?._id !== payload.userId) return;
      setProfile({
        name: data?.name || "",
        bio: data?.bio || "",
        links: {
          github: data?.links?.github || "",
          portfolio: data?.links?.portfolio || "",
          linkedin: data?.links?.linkedin || "",
        },
        collaborationPreferences: data?.collaborationPreferences || [],
        availability: data?.availability || "",
        notificationSettings: {
          ...notificationDefaults,
          ...(data?.notificationSettings || {}),
        },
        appearanceSettings: {
          ...appearanceDefaults,
          ...(data?.appearanceSettings || {}),
        },
        createdAt: data?.createdAt || "",
      });
    });
    return () => socket.disconnect();
  }, []);

  const lastLoginTime = useMemo(() => {
    const raw = auth.currentUser?.metadata?.lastSignInTime;
    return raw ? new Date(raw).toLocaleString() : "Not available";
  }, []);

  const createdOn = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString()
    : "Not available";

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleLinksChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      links: { ...prev.links, [e.target.name]: e.target.value },
    }));
  };

  const toggleNotification = (key) => {
    setProfile((prev) => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [key]: !prev.notificationSettings[key],
      },
    }));
  };

  const toggleCollaboration = (value) => {
    setProfile((prev) => {
      const exists = prev.collaborationPreferences.includes(value);
      return {
        ...prev,
        collaborationPreferences: exists
          ? prev.collaborationPreferences.filter((item) => item !== value)
          : [...prev.collaborationPreferences, value],
      };
    });
  };

  const handleAppearanceChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      appearanceSettings: {
        ...prev.appearanceSettings,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({
        name: profile.name,
        bio: profile.bio,
        links: profile.links,
        collaborationPreferences: profile.collaborationPreferences,
        availability: profile.availability,
        notificationSettings: profile.notificationSettings,
        appearanceSettings: profile.appearanceSettings,
      });
      setToast("Settings updated successfully.");
      document.documentElement.setAttribute(
        "data-theme",
        profile.appearanceSettings.theme || "light"
      );
      setTimeout(() => setToast(""), 2600);
    } catch (error) {
      console.error("Error updating profile:", error);
      setToast("Failed to update settings.");
      setTimeout(() => setToast(""), 2600);
    } finally {
      setSaving(false);
    }
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus("");
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to submit feedback.");
      }
      setContactStatus("Thanks! Your feedback has been sent.");
      setContactForm((prev) => ({ ...prev, message: "" }));
    } catch (error) {
      setContactStatus(error.message || "Unable to submit feedback.");
    }
  };

  if (loading) {
    return (
      <div className="app-page settings-page">
        <div className="app-container">
          <div className="settings-loading">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page settings-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h1 className="app-title">Settings</h1>
            <p className="app-subtitle">Personalize your IdeaSpark experience.</p>
          </div>
        </div>

        <form className="settings-form app-card" onSubmit={handleSubmit}>
          <section className="settings-section">
            <h3>Profile basics</h3>
            <p className="section-note">Visible to others on your public profile.</p>
            <div className="field-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Display name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={profile.name || ""}
                  onChange={handleProfileChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email (login)
                </label>
                <input
                  id="email"
                  type="email"
                  value={auth.currentUser?.email || ""}
                  className="form-input"
                  disabled
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="bio">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio || ""}
                onChange={handleProfileChange}
                className="form-textarea"
                maxLength={150}
              />
            </div>
            <div className="field-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="github">
                  GitHub
                </label>
                <input
                  id="github"
                  type="url"
                  name="github"
                  value={profile.links.github || ""}
                  onChange={handleLinksChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="portfolio">
                  Portfolio
                </label>
                <input
                  id="portfolio"
                  type="url"
                  name="portfolio"
                  value={profile.links.portfolio || ""}
                  onChange={handleLinksChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="linkedin">
                  LinkedIn
                </label>
                <input
                  id="linkedin"
                  type="url"
                  name="linkedin"
                  value={profile.links.linkedin || ""}
                  onChange={handleLinksChange}
                  className="form-input"
                />
              </div>
            </div>
          </section>

          <section className="settings-section">
            <h3>Notification settings</h3>
            <p className="section-note">
              Reduces notification fatigue and improves engagement.
            </p>
            <div className="toggle-grid">
              <button
                type="button"
                className={`toggle-item ${profile.notificationSettings.ideaComments ? "active" : ""}`}
                onClick={() => toggleNotification("ideaComments")}
              >
                Idea comments
              </button>
              <button
                type="button"
                className={`toggle-item ${profile.notificationSettings.teamInvites ? "active" : ""}`}
                onClick={() => toggleNotification("teamInvites")}
              >
                Team invites
              </button>
              <button
                type="button"
                className={`toggle-item ${profile.notificationSettings.hackathonUpdates ? "active" : ""}`}
                onClick={() => toggleNotification("hackathonUpdates")}
              >
                Hackathon updates
              </button>
              <button
                type="button"
                className={`toggle-item ${profile.notificationSettings.investorInterest ? "active" : ""}`}
                onClick={() => toggleNotification("investorInterest")}
              >
                Investor interest
              </button>
              <button
                type="button"
                className={`toggle-item ${profile.notificationSettings.emailNotifications ? "active" : ""}`}
                onClick={() => toggleNotification("emailNotifications")}
              >
                Email notifications
              </button>
              <button
                type="button"
                className={`toggle-item ${profile.notificationSettings.inAppNotifications ? "active" : ""}`}
                onClick={() => toggleNotification("inAppNotifications")}
              >
                In-app notifications
              </button>
            </div>
          </section>

          <section className="settings-section">
            <h3>Collaboration preferences</h3>
            <p className="section-note">
              Helps optimize team formation and collaboration matching.
            </p>
            <div className="chip-row">
              {collaborationOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`chip-toggle ${
                    profile.collaborationPreferences.includes(option) ? "active" : ""
                  }`}
                  onClick={() => toggleCollaboration(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="chip-row">
              {availabilityOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`chip-toggle ${profile.availability === option ? "active" : ""}`}
                  onClick={() => setProfile((prev) => ({ ...prev, availability: option }))}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>

          <section className="settings-section">
            <h3>Appearance</h3>
            <p className="section-note">Optional, for personalization.</p>
            <div className="toggle-grid">
              <button
                type="button"
                className={`toggle-item ${profile.appearanceSettings.theme === "light" ? "active" : ""}`}
                onClick={() => handleAppearanceChange("theme", "light")}
              >
                Light mode
              </button>
              <button
                type="button"
                className={`toggle-item ${profile.appearanceSettings.theme === "dark" ? "active" : ""}`}
                onClick={() => handleAppearanceChange("theme", "dark")}
              >
                Dark mode
              </button>
              <button
                type="button"
                className={`toggle-item ${profile.appearanceSettings.density === "comfortable" ? "active" : ""}`}
                onClick={() => handleAppearanceChange("density", "comfortable")}
              >
                Comfortable layout
              </button>
              <button
                type="button"
                className={`toggle-item ${profile.appearanceSettings.density === "compact" ? "active" : ""}`}
                onClick={() => handleAppearanceChange("density", "compact")}
              >
                Compact layout
              </button>
            </div>
          </section>

          <section className="settings-section">
            <h3>Security activity</h3>
            <div className="security-grid">
              <div>
                <span className="meta-label">Last login</span>
                <p className="meta-value">{lastLoginTime}</p>
              </div>
              <div>
                <span className="meta-label">Account created</span>
                <p className="meta-value">{createdOn}</p>
              </div>
              <div>
                <span className="meta-label">Login device</span>
                <p className="meta-value">
                  {navigator.userAgent || "Not available"}
                </p>
              </div>
            </div>
          </section>

          <section className="settings-section">
            <h3>About & help</h3>
            <div className="about-block">
              <p className="meta-value">
                IdeaSpark helps founders, builders, and investors move from ideas to
                execution with collaboration-first workflows.
              </p>
              <div className="about-meta">
                <span className="app-pill">Version 1.0.0</span>
                <Link className="app-pill link-pill" to="/privacy#terms">
                  Terms
                </Link>
                <Link className="app-pill link-pill" to="/privacy#privacy">
                  Privacy
                </Link>
              </div>
            </div>

            <div className="feedback-block">
              <h4>Contact / feedback</h4>
              <div className="field-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="feedbackName">
                    Name
                  </label>
                  <input
                    id="feedbackName"
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="feedbackEmail">
                    Email
                  </label>
                  <input
                    id="feedbackEmail"
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="feedbackMessage">
                  Message
                </label>
                <textarea
                  id="feedbackMessage"
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  className="form-textarea"
                  placeholder="Share your feedback or questions..."
                />
              </div>
              {contactStatus ? <p className="status-note">{contactStatus}</p> : null}
              <button type="button" className="submit-button" onClick={handleContactSubmit}>
                Send feedback
              </button>
            </div>
          </section>

          <button type="submit" className="submit-button" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
        {toast ? <div className="settings-toast">{toast}</div> : null}
      </div>
    </div>
  );
}
