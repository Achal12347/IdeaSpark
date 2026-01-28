import { useState, useEffect } from "react";
import apiRequest from "../services/api";

export default function InvestorDashboard() {
  const [ideas, setIdeas] = useState([]);

  useEffect(() => {
    const loadIdeas = async () => {
      try {
        const ideasData = await apiRequest('/api/ideas');
        setIdeas(ideasData);
      } catch (error) {
        console.error("Error loading ideas:", error);
      }
    };
    loadIdeas();
  }, []);

  return (
    <div className="investor-dashboard">
      <h2>Investor Dashboard</h2>
      <div className="ideas-for-investment">
        {ideas.map((idea) => (
          <div key={idea._id} className="idea-card">
            <h3>{idea.title}</h3>
            <p>{idea.description}</p>
            <button>Invest</button>
          </div>
        ))}
      </div>
    </div>
  );
}
