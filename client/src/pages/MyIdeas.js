import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyIdeas } from "../services/ideaService";
import "../styles/MyIdeas.css";

export default function MyIdeas() {
  const [ideas, setIdeas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadIdeas = async () => {
      try {
        const ideasData = await fetchMyIdeas();
        setIdeas(ideasData);
      } catch (error) {
        console.error("Error loading my ideas:", error);
      }
    };
    loadIdeas();
  }, []);

  return (
    <div className="ideas-page">
      <h2>My Ideas</h2>
      <div className="ideas-grid">
        {ideas.map((idea) => (
          <div key={idea._id} className="idea-card" onClick={() => navigate(`/idea/${idea._id}`)}>
            <h3>{idea.title}</h3>
            <p>{idea.description}</p>
            <div className="tags">
              {idea.tags?.map((tag, index) => (
                <span key={index}>{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
