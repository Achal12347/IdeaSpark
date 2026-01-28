import { useState, useEffect } from "react";
import { fetchUserProfile, updateUserProfile } from "../services/userService";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    expertise: "",
    workplace: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await fetchUserProfile();
        setProfile(profileData);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(profile);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="profile-page">
      <h2>My Profile</h2>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={profile.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="expertise"
            placeholder="Expertise"
            value={profile.expertise}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="workplace"
            placeholder="Workplace"
            value={profile.workplace}
            onChange={handleChange}
            required
          />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
        <div>
          <p>Name: {profile.name}</p>
          <p>Expertise: {profile.expertise}</p>
          <p>Workplace: {profile.workplace}</p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  );
}
