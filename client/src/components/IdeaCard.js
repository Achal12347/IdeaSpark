import "../styles/IdeaCard.css";

const formatCurrency = (value) => {
  if (value === undefined || value === null || value === "") {
    return "N/A";
  }
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return "N/A";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numberValue);
};

const formatPercent = (value) => {
  if (value === undefined || value === null || value === "") {
    return "N/A";
  }
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return "N/A";
  }
  return `${numberValue}%`;
};

export default function IdeaCard({
  idea,
  variant = "user",
  onClick,
  className = "",
  actionLabel,
  onAction,
}) {
  const summaryBase =
    idea.description || idea.solutionDescription || idea.problemStatement || "";
  const summary =
    variant === "investor"
      ? idea.pitchMessage || summaryBase
      : summaryBase;
  const tags = Array.isArray(idea.tags) ? idea.tags : [];
  const authorName =
    idea.author?.name || idea.author?.email || idea.author?.username || "Unknown";
  const createdDate = idea.createdAt
    ? new Date(idea.createdAt).toLocaleDateString()
    : "N/A";
  const fundingStatus = idea.fundingStatus || "seeking";
  const budgetLabel = formatCurrency(idea.estimatedBudget);
  const equityLabel = formatPercent(idea.equityShare);

  const handleKeyDown = (event) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`idea-card idea-card-${variant} ${className}`.trim()}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="idea-card-header">
        <h4>{idea.title}</h4>
        {variant === "investor" ? (
          <span className={`idea-card-badge status-${fundingStatus}`}>
            {fundingStatus}
          </span>
        ) : null}
      </div>

      {summary ? <p className="idea-card-description">{summary}</p> : null}

      {variant !== "investor" && tags.length > 0 ? (
        <div className="idea-card-tags">
          {tags.map((tag, index) => (
            <span key={`${tag}-${index}`} className="idea-card-tag">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {variant === "user" ? (
        <div className="idea-card-stats">
          <span>Views {idea.views || 0}</span>
          <span>Rating {idea.averageRating ? idea.averageRating.toFixed(1) : "0.0"}</span>
          <span>Stage {idea.stageOfIdea || "N/A"}</span>
        </div>
      ) : null}

      {variant === "investor" ? (
        <div className="idea-card-meta">
          <span>Budget {budgetLabel}</span>
          <span>Equity {equityLabel}</span>
        </div>
      ) : null}

      {variant === "admin" ? (
        <div className="idea-card-meta">
          <span>Owner {authorName}</span>
          <span>Date {createdDate}</span>
          <span>Status {fundingStatus}</span>
        </div>
      ) : null}

      {actionLabel || onAction ? (
        <div className="idea-card-footer">
          <span className="idea-card-link">View details</span>
          {onAction ? (
            <button
              type="button"
              className="idea-card-action"
              onClick={(event) => {
                event.stopPropagation();
                onAction();
              }}
            >
              {actionLabel || "Action"}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="idea-card-footer">
          <span className="idea-card-link">View details</span>
        </div>
      )}
    </div>
  );
}
