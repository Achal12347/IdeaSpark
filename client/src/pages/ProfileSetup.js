import React, { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    expertise: "",
    workplace: "",
    bio: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch(`http://localhost:5000/api/users/${auth.currentUser.uid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", width: "400px" }}>
        <input placeholder="Full Name" name="name" onChange={handleChange} required />
        <input placeholder="Expertise" name="expertise" onChange={handleChange} required />
        <input placeholder="Workplace" name="workplace" onChange={handleChange} />
        <textarea placeholder="Bio" name="bio" onChange={handleChange} />
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
};

export default ProfileSetup;
