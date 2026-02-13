import { useEffect, useState } from "react";
import "../styles/UserCard.css";

export default function UserDetailsModal({ user, onClose, onDelete, deleteLoading }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    setReason("");
  }, [user?._id]);

  if (!user) return null;

  const linkValues = [user.links?.github, user.links?.portfolio, user.links?.linkedin].filter(Boolean);
  const linksText = linkValues.length ? linkValues.join(" - ") : "Not specified";

  return (
    <div className="user-modal-overlay" onClick={onClose}>
      <div className="user-modal" onClick={(event) => event.stopPropagation()}>
        <div className="user-modal-header">
          <div>
            <h3>{user.name || user.username || "Member"}</h3>
            <p>{user.email || "Email hidden"}</p>
          </div>
          <button type="button" className="user-close" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="user-modal-body">
          <div>
            <span className="user-label">Roles</span>
            <p>{user.roles?.length ? user.roles.join(", ") : "Not specified"}</p>
          </div>
          <div>
            <span className="user-label">Skills</span>
            <p>{user.skills?.length ? user.skills.join(", ") : "Not specified"}</p>
          </div>
          <div>
            <span className="user-label">Interests</span>
            <p>{user.interests?.length ? user.interests.join(", ") : "Not specified"}</p>
          </div>
          <div>
            <span className="user-label">Experience</span>
            <p>{user.experienceLevel || "Not specified"}</p>
          </div>
          <div>
            <span className="user-label">Availability</span>
            <p>{user.availability || "Not specified"}</p>
          </div>
          <div>
            <span className="user-label">Bio</span>
            <p>{user.bio || "Not specified"}</p>
          </div>
          <div>
            <span className="user-label">Links</span>
            <p>{linksText}</p>
          </div>
          {onDelete ? (
            <div className="user-delete-block">
              <span className="user-label">Delete user</span>
              <textarea
                className="user-delete-input"
                placeholder="Reason for deletion"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
              <button
                type="button"
                className="user-delete-btn"
                onClick={() => onDelete(user._id, reason)}
                disabled={!reason.trim() || deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete user"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
