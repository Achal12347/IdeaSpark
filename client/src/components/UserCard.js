import "../styles/UserCard.css";

export default function UserCard({ user, onClick }) {
  const name = user?.name || user?.username || "Member";
  const roleText = user?.roles?.length ? user.roles.join(", ") : "Member";
  const avatarText = name ? name[0].toUpperCase() : "U";

  return (
    <button type="button" className="user-card" onClick={onClick}>
      <div className="user-avatar">{avatarText}</div>
      <div className="user-info">
        <div className="user-title">
          <h4>{name}</h4>
          {user?.isCollaborator ? (
            <span className="user-pill">Collaborated</span>
          ) : null}
        </div>
        <p className="user-subtitle">{roleText}</p>
      </div>
      <span className="user-action">View</span>
    </button>
  );
}
