import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchIdeas } from "../services/ideaService";
import "../styles/Ideas.css";

export default function Ideas() {
  const [ideas, setIdeas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadIdeas = async () => {
      try {
        const ideasData = await fetchIdeas();
        setIdeas(ideasData);
      } catch (error) {
        console.error("Error loading ideas:", error);
      }
    };
    loadIdeas();
  }, []);

  return (
    <div className="ideas-page">
      <h2>All Ideas</h2>
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
