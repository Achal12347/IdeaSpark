import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createIdea } from "../services/ideaService";
import "../styles/PostIdea.css";

export default function PostIdea() {
  const [idea, setIdea] = useState({
    title: "",
    problemStatement: "",
    solutionDescription: "",
    targetAudience: "",
    marketCategory: "",
    monetizationModel: "",
    stageOfIdea: "",
    lookingFor: [],
    estimatedBudget: "",
    equityShare: "",
    tags: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setIdea({ ...idea, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setIdea((prevIdea) => ({
      ...prevIdea,
      lookingFor: checked
        ? [...prevIdea.lookingFor, value]
        : prevIdea.lookingFor.filter((item) => item !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createIdea({
        ...idea,
        tags: idea.tags.split(",").map(tag => tag.trim()),
      });
      alert("Idea posted successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error posting idea:", error);
      alert("Error posting idea: " + error.message);
    }
  };

  return (
    <div className="post-idea-page">
      <h2>Post a New Idea</h2>
      <form onSubmit={handleSubmit}>
        {/* Core Idea Info */}
        <h3>🔹 Core Idea Info (MANDATORY)</h3>
        <input
          type="text"
          name="title"
          placeholder="Idea Title (Short, catchy)"
          value={idea.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="problemStatement"
          placeholder="Problem Statement (What real problem does this solve? Who is affected?)"
          value={idea.problemStatement}
          onChange={handleChange}
          required
        />
        <textarea
          name="solutionDescription"
          placeholder="Solution Description (How does your idea solve the problem? What makes it better than existing solutions?)"
          value={idea.solutionDescription}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="targetAudience"
          placeholder="Target Audience (Students, startups, enterprises, investors, etc.)"
          value={idea.targetAudience}
          onChange={handleChange}
          required
        />

        {/* Business / Growth */}
        <h3>🔹 Business / Growth (IMPORTANT)</h3>
        <select name="marketCategory" value={idea.marketCategory} onChange={handleChange} required>
          <option value="">Select Market Category</option>
          <option value="Tech">Tech</option>
          <option value="Health">Health</option>
          <option value="Finance">Finance</option>
          <option value="Education">Education</option>
          <option value="AI">AI</option>
          <option value="Web3">Web3</option>
          <option value="Other">Other</option>
        </select>
        <select name="monetizationModel" value={idea.monetizationModel} onChange={handleChange} required>
          <option value="">Select Monetization Model</option>
          <option value="Free">Free</option>
          <option value="Subscription">Subscription</option>
          <option value="Ads">Ads</option>
          <option value="SaaS">SaaS</option>
          <option value="Commission">Commission</option>
          <option value="Other">Other</option>
        </select>
        <select name="stageOfIdea" value={idea.stageOfIdea} onChange={handleChange} required>
          <option value="">Select Stage of Idea</option>
          <option value="Just an idea">Just an idea</option>
          <option value="Prototype">Prototype</option>
          <option value="MVP">MVP</option>
          <option value="Launched">Launched</option>
        </select>

        {/* Collaboration & Investment */}
        <h3>🔹 Collaboration & Investment</h3>
        <p>What are you looking for? (Select all that apply)</p>
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              value="Co-founder"
              checked={idea.lookingFor.includes("Co-founder")}
              onChange={handleCheckboxChange}
            />
            Co-founder
          </label>
          <label>
            <input
              type="checkbox"
              value="Developer"
              checked={idea.lookingFor.includes("Developer")}
              onChange={handleCheckboxChange}
            />
            Developer
          </label>
          <label>
            <input
              type="checkbox"
              value="Designer"
              checked={idea.lookingFor.includes("Designer")}
              onChange={handleCheckboxChange}
            />
            Designer
          </label>
          <label>
            <input
              type="checkbox"
              value="Investor"
              checked={idea.lookingFor.includes("Investor")}
              onChange={handleCheckboxChange}
            />
            Investor
          </label>
          <label>
            <input
              type="checkbox"
              value="Mentor"
              checked={idea.lookingFor.includes("Mentor")}
              onChange={handleCheckboxChange}
            />
            Mentor
          </label>
          <label>
            <input
              type="checkbox"
              value="Other"
              checked={idea.lookingFor.includes("Other")}
              onChange={handleCheckboxChange}
            />
            Other
          </label>
        </div>
        <input
          type="text"
          name="estimatedBudget"
          placeholder="Estimated Budget Needed (Optional)"
          value={idea.estimatedBudget}
          onChange={handleChange}
        />
        <input
          type="text"
          name="equityShare"
          placeholder="Equity Willing to Share (Optional)"
          value={idea.equityShare}
          onChange={handleChange}
        />
        <input
          type="text"
          name="tags"
          placeholder="Tags (comma separated)"
          value={idea.tags}
          onChange={handleChange}
        />
        <button type="submit">Post Idea</button>
      </form>
    </div>
  );
}
