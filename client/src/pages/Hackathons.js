import { useState, useEffect } from "react";
import apiRequest from "../services/api";
import "../styles/Hackathons.css";

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [rankings, setRankings] = useState([]);

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

  const handleViewRankings = async (hackathonId) => {
    try {
      const rankingsData = await apiRequest(`/api/hackathons/${hackathonId}/rankings`);
      setRankings(rankingsData);
      setSelectedHackathon(hackathonId);
    } catch (error) {
      console.error("Error loading rankings:", error);
    }
  };

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
            <button onClick={() => handleViewRankings(hackathon._id)}>View Rankings</button>
          </div>
        ))}
      </div>
      {selectedHackathon && (
        <div className="rankings-section">
          <h3>Rankings</h3>
          <ul>
            {rankings.map((submission, index) => (
              <li key={submission._id}>
                #{index + 1} - {submission.idea?.title} by {submission.team?.name} - Score: {submission.averageScore?.toFixed(1)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
