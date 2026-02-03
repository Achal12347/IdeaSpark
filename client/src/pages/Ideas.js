import { useNavigate } from "react-router-dom";
import { useGetIdeasQuery } from "../store/apiSlice";
import "../styles/Ideas.css";

export default function Ideas() {
  const navigate = useNavigate();
  const { data: ideas = [], isLoading } = useGetIdeasQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  return (
    <div className="ideas-page">
      <h2>All Ideas</h2>
      {isLoading ? (
        <p>Loading ideas...</p>
      ) : (
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
      )}
    </div>
  );
}
