import { useEffect, useMemo, useRef, useState } from "react";
import { addBookmark } from "../services/bookmarkService";
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
  quickActions,
  onQuickAction,
}) {
  const [quickFeedback, setQuickFeedback] = useState("");
  const feedbackTimerRef = useRef(null);
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

  const resolvedQuickActions = useMemo(() => {
    if (Array.isArray(quickActions)) return quickActions;
    if (variant === "user") {
      return [
        { id: "bookmark", label: "Save" },
        { id: "share", label: "Share" },
      ];
    }
    return [{ id: "share", label: "Share" }];
  }, [quickActions, variant]);

  const setFeedback = (message) => {
    setQuickFeedback(message);
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      setQuickFeedback("");
    }, 1700);
  };

  const handleQuickAction = async (event, actionId) => {
    event.stopPropagation();
    event.preventDefault();
    try {
      if (onQuickAction) {
        const result = await onQuickAction(actionId, idea);
        if (result !== false) return;
      }

      if (actionId === "share") {
        const shareUrl = `${window.location.origin}/idea/${idea._id}`;
        await navigator.clipboard.writeText(shareUrl);
        setFeedback("Link copied");
        return;
      }

      if (actionId === "bookmark") {
        await addBookmark(idea._id);
        setFeedback("Saved");
      }
    } catch (error) {
      setFeedback("Action failed");
    }
  };

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`idea-card idea-card-${variant} ${className}`.trim()}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="idea-card-main">
        <div className="idea-card-header">
          <h4>{idea.title}</h4>
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
      </div>

      <div className="idea-card-side">
        {variant === "investor" ? (
          <span className={`idea-card-badge status-${fundingStatus}`}>
            {fundingStatus}
          </span>
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

        {resolvedQuickActions.length > 0 ? (
          <div className="idea-card-quick-actions">
            {resolvedQuickActions.map((action) => (
              <button
                key={action.id}
                type="button"
                className="idea-card-quick-btn"
                onClick={(event) => handleQuickAction(event, action.id)}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
        {quickFeedback ? (
          <span className="idea-card-feedback">{quickFeedback}</span>
        ) : null}
      </div>
    </div>
  );
}
