import { useState, useEffect } from "react";
import apiRequest from "../services/api";

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([]);

  useEffect(() => {
    const loadHackathons = async () => {
      try {
        const hackathonsData = await apiRequest('/api/hackathons');
        setHackathons(hackathonsData);
      } catch (error) {
        console.error("Error loading hackathons:", error);
      }
    };
    loadHackathons();
  }, []);

  return (
    <div className="hackathons-page">
      <h2>Hackathons</h2>
      <div className="hackathons-list">
        {hackathons.map((hackathon) => (
          <div key={hackathon._id} className="hackathon-card">
            <h3>{hackathon.name}</h3>
            <p>{hackathon.description}</p>
            <p>Start: {new Date(hackathon.startDate).toLocaleDateString()}</p>
            <p>End: {new Date(hackathon.endDate).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
