import { useState, useEffect } from "react";
import apiRequest from "../services/api";
import "../styles/appPageTheme.css";
import "../styles/Hackathons.css";

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [rankings, setRankings] = useState([]);
  const selectedHackathonData = hackathons.find(
    (hackathon) => hackathon._id === selectedHackathon
  );

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
    <div className="app-page hackathons-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h2 className="app-title">Hackathons</h2>
            <p className="app-subtitle">Track upcoming events and explore the rankings.</p>
          </div>
        </div>

        {hackathons.length === 0 ? (
          <div className="hackathons-empty app-card">
            <h3>No hackathons yet</h3>
            <p>Check back soon for upcoming events.</p>
          </div>
        ) : (
          <div className="hackathons-list app-grid">
            {hackathons.map((hackathon) => (
              <div key={hackathon._id} className="hackathon-card app-card">
                <div className="hackathon-card-header">
                  <h3>{hackathon.name}</h3>
                  <span className="app-pill">Active</span>
                </div>
                <p className="hackathon-description">{hackathon.description}</p>
                <div className="hackathon-meta">
                  <span>Start: {new Date(hackathon.startDate).toLocaleDateString()}</span>
                  <span>End: {new Date(hackathon.endDate).toLocaleDateString()}</span>
                </div>
                <button
                  className="app-button-secondary"
                  onClick={() => handleViewRankings(hackathon._id)}
                >
                  View Rankings
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedHackathon ? (
          <div className="rankings-section app-card">
            <div className="rankings-header">
              <h3>Rankings</h3>
              {selectedHackathonData?.name ? (
                <span className="app-pill">{selectedHackathonData.name}</span>
              ) : null}
            </div>
            <ul className="rankings-list">
              {rankings.map((submission, index) => (
                <li key={submission._id}>
                  <span className="rankings-rank">#{index + 1}</span>
                  <span className="rankings-title">
                    {submission.idea?.title || "Untitled"}
                  </span>
                  <span className="rankings-team">
                    {submission.team?.name || "Unknown team"}
                  </span>
                  <span className="rankings-score">
                    Score: {submission.averageScore?.toFixed(1) ?? "â€”"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
