import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiRequest from "../services/api";

export default function IdeaDetails() {
  const { id } = useParams();
  const [idea, setIdea] = useState(null);

  useEffect(() => {
    const loadIdea = async () => {
      try {
        const ideaData = await apiRequest(`/api/ideas/${id}`);
        setIdea(ideaData);
      } catch (error) {
        console.error("Error loading idea:", error);
      }
    };
    loadIdea();
  }, [id]);

  if (!idea) return <div>Loading...</div>;

  return (
    <div className="idea-details-page">
      <h2>{idea.title}</h2>
      <p>{idea.description}</p>
      <div className="tags">
        {idea.tags?.map((tag, index) => (
          <span key={index}>{tag}</span>
        ))}
      </div>
      <p>Posted by: {idea.author?.name}</p>
    </div>
  );
}
