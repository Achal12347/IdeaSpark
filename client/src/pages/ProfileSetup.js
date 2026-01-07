import { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileSetup.css";

export default function ProfileSetup() {
  const [name, setName] = useState("");
  const [expertise, setExpertise] = useState("");
  const [workplace, setWorkplace] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = await auth.currentUser.getIdToken();

    await fetch("http://localhost:5000/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, expertise, workplace }),
    });

    navigate("/dashboard");
  };

  return (
    <div className="profile-container">
      <form className="profile-card" onSubmit={handleSubmit}>
        <h2>Complete Your Profile</h2>

        <input
          placeholder="Your Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <input
          placeholder="Expertise (e.g. Web Dev)"
          value={expertise}
          onChange={e => setExpertise(e.target.value)}
          required
        />

        <input
          placeholder="Workplace / College"
          value={workplace}
          onChange={e => setWorkplace(e.target.value)}
          required
        />

        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
}
