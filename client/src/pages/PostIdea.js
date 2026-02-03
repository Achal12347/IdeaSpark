import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createIdea } from "../services/ideaService";
import "../styles/PostIdea.css";

const lookingForOptions = [
  "Co-founder",
  "Developer",
  "Designer",
  "Investor",
  "Mentor",
  "Other",
];

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
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setIdea({ ...idea, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (value) => {
    setIdea((prevIdea) => ({
      ...prevIdea,
      lookingFor: prevIdea.lookingFor.includes(value)
        ? prevIdea.lookingFor.filter((item) => item !== value)
        : [...prevIdea.lookingFor, value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setIsSubmitting(true);
    try {
      await createIdea({
        ...idea,
        tags: idea.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      setStatus("Idea posted successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error posting idea:", error);
      setStatus(`Error posting idea: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-idea-page">
      <div className="post-idea-shell">
        <div className="post-idea-header">
          <div>
            <h2>Post a new idea</h2>
            <p>Share your vision and find the right people to build it.</p>
          </div>
        </div>

        <form className="post-idea-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <h3>Core idea info</h3>
            <p>These details help others understand the problem and solution.</p>
            <div className="field">
              <label htmlFor="title">Idea title</label>
              <input
                id="title"
                type="text"
                name="title"
                placeholder="Short, catchy headline"
                value={idea.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="problemStatement">Problem statement</label>
              <textarea
                id="problemStatement"
                name="problemStatement"
                placeholder="What real problem does this solve? Who is affected?"
                value={idea.problemStatement}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="solutionDescription">Solution description</label>
              <textarea
                id="solutionDescription"
                name="solutionDescription"
                placeholder="How does your idea solve the problem?"
                value={idea.solutionDescription}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="targetAudience">Target audience</label>
              <input
                id="targetAudience"
                type="text"
                name="targetAudience"
                placeholder="Students, startups, enterprises, investors, etc."
                value={idea.targetAudience}
                onChange={handleChange}
                required
              />
            </div>
          </section>

          <section className="form-section">
            <h3>Business and growth</h3>
            <p>Help investors understand the market and monetization path.</p>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="marketCategory">Market category</label>
                <select
                  id="marketCategory"
                  name="marketCategory"
                  value={idea.marketCategory}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Tech">Tech</option>
                  <option value="Health">Health</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="AI">AI</option>
                  <option value="Web3">Web3</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="monetizationModel">Monetization model</label>
                <select
                  id="monetizationModel"
                  name="monetizationModel"
                  value={idea.monetizationModel}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select model</option>
                  <option value="Free">Free</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Ads">Ads</option>
                  <option value="SaaS">SaaS</option>
                  <option value="Commission">Commission</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="stageOfIdea">Stage of idea</label>
                <select
                  id="stageOfIdea"
                  name="stageOfIdea"
                  value={idea.stageOfIdea}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select stage</option>
                  <option value="Just an idea">Just an idea</option>
                  <option value="Prototype">Prototype</option>
                  <option value="MVP">MVP</option>
                  <option value="Launched">Launched</option>
                </select>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3>Collaboration and investment</h3>
            <p>Let the community know how they can support your idea.</p>
            <div className="chip-grid">
              {lookingForOptions.map((option) => (
                <label key={option} className="chip">
                  <input
                    type="checkbox"
                    checked={idea.lookingFor.includes(option)}
                    onChange={() => handleCheckboxChange(option)}
                  />
                  {option}
                </label>
              ))}
            </div>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="estimatedBudget">Estimated budget</label>
                <input
                  id="estimatedBudget"
                  type="text"
                  name="estimatedBudget"
                  placeholder="Optional"
                  value={idea.estimatedBudget}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="equityShare">Equity share</label>
                <input
                  id="equityShare"
                  type="text"
                  name="equityShare"
                  placeholder="Optional"
                  value={idea.equityShare}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="tags">Tags</label>
                <input
                  id="tags"
                  type="text"
                  name="tags"
                  placeholder="AI, health, fintech"
                  value={idea.tags}
                  onChange={handleChange}
                />
                <span className="helper-text">Separate tags with commas.</span>
              </div>
            </div>
          </section>

          {status ? <p className="helper-text">{status}</p> : null}

          <div className="post-idea-actions">
            <button className="ghost-btn" type="button" onClick={() => navigate("/dashboard")}>
              Cancel
            </button>
            <button className="primary-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post idea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
