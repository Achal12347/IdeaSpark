import { useEffect, useState } from "react";
import { fetchUserProfile, updateUserProfile } from "../services/userService";
import io from "socket.io-client";
import "../styles/appPageTheme.css";
import "../styles/ProfileSetup.css";

const roleOptions = [
  "Student",
  "Developer",
  "Designer",
  "Entrepreneur",
  "Investor",
  "Mentor",
];

const skillOptions = [
  "Web Development",
  "Mobile App Development",
  "AI / ML",
  "UI / UX",
  "Marketing",
  "Finance",
  "Data Science",
];

const domainOptions = [
  "EdTech",
  "FinTech",
  "HealthTech",
  "AgriTech",
  "Social Impact",
  "E-commerce",
];

const lookingForOptions = [
  "Join a team",
  "Build my own idea",
  "Explore ideas",
  "Find collaborators",
  "Invest / mentor",
];

const availabilityOptions = ["Part-time", "Full-time", "Weekends"];

const emptyLinks = {
  github: "",
  portfolio: "",
  linkedin: "",
};

export default function Profile() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    bio: "",
    roles: [],
    skills: [],
    interests: [],
    experienceLevel: "",
    lookingFor: [],
    availability: "",
    links: emptyLinks,
    profilePhoto: "",
  });
  const [photoPreview, setPhotoPreview] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await fetchUserProfile();
        setFormData({
          fullName: profileData?.name || "",
          username: profileData?.username || "",
          bio: profileData?.bio || "",
          roles: profileData?.roles || [],
          skills: profileData?.skills || [],
          interests: profileData?.interests || [],
          experienceLevel: profileData?.experienceLevel || "",
          lookingFor: profileData?.collaborationPreferences || [],
          availability: profileData?.availability || "",
          links: {
            github: profileData?.links?.github || "",
            portfolio: profileData?.links?.portfolio || "",
            linkedin: profileData?.links?.linkedin || "",
          },
          profilePhoto: profileData?.profilePhoto || "",
        });
        setPhotoPreview(profileData?.profilePhoto || "");
      } catch (error) {
        console.error("Error loading profile:", error);
        setStatus({ type: "error", message: "Unable to load profile details." });
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
      const profileData = await fetchUserProfile();
      if (profileData?._id !== payload.userId) return;
      setFormData({
        fullName: profileData?.name || "",
        username: profileData?.username || "",
        bio: profileData?.bio || "",
        roles: profileData?.roles || [],
        skills: profileData?.skills || [],
        interests: profileData?.interests || [],
        experienceLevel: profileData?.experienceLevel || "",
        lookingFor: profileData?.collaborationPreferences || [],
        availability: profileData?.availability || "",
        links: {
          github: profileData?.links?.github || "",
          portfolio: profileData?.links?.portfolio || "",
          linkedin: profileData?.links?.linkedin || "",
        },
        profilePhoto: profileData?.profilePhoto || "",
      });
      setPhotoPreview(profileData?.profilePhoto || "");
    });
    return () => socket.disconnect();
  }, []);

  const toggleMulti = (field, value) => {
    setFormData((prev) => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLinksChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      links: {
        ...prev.links,
        [name]: value,
      },
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const maxSize = 300 * 1024;
    if (file.size > maxSize) {
      setStatus({
        type: "error",
        message: "Please choose an image under 300KB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setPhotoPreview(result);
      setFormData((prev) => ({ ...prev, profilePhoto: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview("");
    setFormData((prev) => ({ ...prev, profilePhoto: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!formData.fullName.trim()) {
      setStatus({ type: "error", message: "Full name is required." });
      return;
    }

    if (!formData.username.trim()) {
      setStatus({ type: "error", message: "Username is required." });
      return;
    }

    if (!formData.roles.length) {
      setStatus({ type: "error", message: "Select at least one role." });
      return;
    }

    if (!formData.experienceLevel) {
      setStatus({ type: "error", message: "Select your experience level." });
      return;
    }

    if (formData.bio.length > 150) {
      setStatus({
        type: "error",
        message: "Bio must be 150 characters or less.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserProfile({
        name: formData.fullName.trim(),
        username: formData.username.trim(),
        profilePhoto: formData.profilePhoto,
        bio: formData.bio.trim(),
        roles: formData.roles,
        skills: formData.skills,
        interests: formData.interests,
        experienceLevel: formData.experienceLevel,
        collaborationPreferences: formData.lookingFor,
        availability: formData.availability,
        links: formData.links,
      });
      setStatus({ type: "success", message: "" });
      setToast("Profile updated");
      setTimeout(() => setToast(""), 2600);
    } catch (error) {
      console.error("Error updating profile:", error);
      setStatus({ type: "error", message: error.message || "Update failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-shell">
        <div className="profile-card">
          <p className="helper-text">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-shell">
      <form className="profile-card" onSubmit={handleSubmit}>
        <div className="profile-header">
          <div>
            <h2>Edit your profile</h2>
            <p>Keep your details fresh for better matches and collaboration.</p>
          </div>
          <div className="photo-block">
            <div className="photo-preview">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" />
              ) : (
                <span>{formData.fullName ? formData.fullName[0] : "IS"}</span>
              )}
            </div>
            <div className="photo-actions">
              <label className="ghost-btn" htmlFor="profilePhoto">
                Upload photo
              </label>
              <input
                id="profilePhoto"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              {photoPreview ? (
                <button
                  type="button"
                  className="text-btn"
                  onClick={handleRemovePhoto}
                >
                  Remove
                </button>
              ) : null}
              <p className="helper-text">Optional. JPG/PNG, up to 300KB.</p>
            </div>
          </div>
        </div>

        <section className="profile-section">
          <div className="section-header">
            <h3>Basic identity</h3>
            <p>Tell us who you are. Keep it short and clear.</p>
          </div>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Jane Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="janedoe"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <span className="helper-text">Unique handle for idea posts.</span>
            </div>
          </div>
          <div className="field">
            <label htmlFor="bio">Short bio</label>
            <textarea
              id="bio"
              name="bio"
              placeholder="Tell us about yourself (max 150 chars)"
              value={formData.bio}
              onChange={handleChange}
              maxLength={150}
            />
            <span className="helper-text">
              {formData.bio.length}/150 characters
            </span>
          </div>
        </section>

        <section className="profile-section">
          <div className="section-header">
            <h3>User role</h3>
            <p>Select one or more roles. This powers role-based features.</p>
          </div>
          <div className="chip-grid">
            {roleOptions.map((role) => (
              <button
                key={role}
                type="button"
                className={`chip ${formData.roles.includes(role) ? "active" : ""}`}
                onClick={() => toggleMulti("roles", role)}
              >
                {role}
              </button>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <div className="section-header">
            <h3>Skills and interests</h3>
            <p>Pick the areas you are strongest in and curious about.</p>
          </div>
          <div className="field">
            <label>Your skills</label>
            <div className="chip-grid">
              {skillOptions.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className={`chip ${formData.skills.includes(skill) ? "active" : ""}`}
                  onClick={() => toggleMulti("skills", skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Domains you are interested in</label>
            <div className="chip-grid">
              {domainOptions.map((domain) => (
                <button
                  key={domain}
                  type="button"
                  className={`chip ${formData.interests.includes(domain) ? "active" : ""}`}
                  onClick={() => toggleMulti("interests", domain)}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="profile-section">
          <div className="section-header">
            <h3>Experience level</h3>
            <p>Helps us match teams and mentors appropriately.</p>
          </div>
          <div className="chip-grid">
            {["Beginner", "Intermediate", "Advanced"].map((level) => (
              <button
                key={level}
                type="button"
                className={`chip ${formData.experienceLevel === level ? "active" : ""}`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, experienceLevel: level }))
                }
              >
                {level}
              </button>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <div className="section-header">
            <h3>Collaboration preferences</h3>
            <p>Tell us what you are looking for inside the community.</p>
          </div>
          <div className="chip-grid">
            {lookingForOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`chip ${formData.lookingFor.includes(option) ? "active" : ""}`}
                onClick={() => toggleMulti("lookingFor", option)}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <div className="section-header">
            <h3>Availability</h3>
            <p>Optional, but helpful for team compatibility.</p>
          </div>
          <div className="chip-grid">
            {availabilityOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`chip ${formData.availability === option ? "active" : ""}`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, availability: option }))
                }
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <div className="section-header">
            <h3>Social links</h3>
            <p>Add links that showcase your work. Optional.</p>
          </div>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="github">GitHub</label>
              <input
                id="github"
                name="github"
                type="url"
                placeholder="https://github.com/username"
                value={formData.links.github}
                onChange={handleLinksChange}
              />
            </div>
            <div className="field">
              <label htmlFor="portfolio">Portfolio</label>
              <input
                id="portfolio"
                name="portfolio"
                type="url"
                placeholder="https://yourportfolio.com"
                value={formData.links.portfolio}
                onChange={handleLinksChange}
              />
            </div>
            <div className="field">
              <label htmlFor="linkedin">LinkedIn</label>
              <input
                id="linkedin"
                name="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={formData.links.linkedin}
                onChange={handleLinksChange}
              />
            </div>
          </div>
        </section>

        {status.message ? (
          <p className={`status ${status.type}`}>{status.message}</p>
        ) : null}

        <div className="profile-actions">
          <button className="primary-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </div>
        {toast ? <div className="profile-toast">{toast}</div> : null}
      </form>
    </div>
  );
}
