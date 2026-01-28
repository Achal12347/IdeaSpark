import { useState, useEffect } from "react";
import apiRequest from "../services/api";

export default function InvestorDashboard() {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [pitchContent, setPitchContent] = useState('');

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

  const handleSubmitPitch = async () => {
    if (!selectedIdea || !pitchContent.trim()) return;
    try {
      await apiRequest(`/api/ideas/${selectedIdea._id}/pitches`, 'POST', { pitchContent });
      setPitchContent('');
      setSelectedIdea(null);
      alert('Pitch submitted successfully!');
    } catch (error) {
      console.error("Error submitting pitch:", error);
    }
  };

  return (
    <div className="investor-dashboard">
      <h2>Investor Dashboard</h2>
      <div className="ideas-for-investment">
        {ideas.map((idea) => (
          <div key={idea._id} className="idea-card">
            <h3>{idea.title}</h3>
            <p>{idea.problemStatement}</p>
            <button onClick={() => setSelectedIdea(idea)}>Pitch to Investor</button>
          </div>
        ))}
      </div>
      {selectedIdea && (
        <div className="pitch-form">
          <h3>Submit Pitch for: {selectedIdea.title}</h3>
          <textarea
            placeholder="Enter your pitch..."
            value={pitchContent}
            onChange={(e) => setPitchContent(e.target.value)}
          />
          <button onClick={handleSubmitPitch}>Submit Pitch</button>
          <button onClick={() => setSelectedIdea(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
