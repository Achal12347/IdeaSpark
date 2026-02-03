import React, { useState, useEffect } from "react";
import { fetchUserProfile, updateUserProfile } from "../services/userService";
import "../styles/appPageTheme.css";
import "../styles/Settings.css";

export default function Settings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    expertise: "",
    workplace: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchUserProfile();
        setProfile(data);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(profile);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
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
            <p className="app-subtitle">Update your public profile details.</p>
          </div>
        </div>

        <form className="settings-form app-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={profile.name || ""}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={profile.email || ""}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="expertise">
              Expertise
            </label>
            <input
              id="expertise"
              type="text"
              name="expertise"
              value={profile.expertise || ""}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="workplace">
              Workplace
            </label>
            <input
              id="workplace"
              type="text"
              name="workplace"
              value={profile.workplace || ""}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio || ""}
              onChange={handleChange}
              className="form-textarea"
            />
          </div>
          <button type="submit" className="submit-button" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

