import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError("Could not load users.");
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  // Logout handler
  const handleLogout = async () => {
    navigate("/", { replace: true });
    await auth.signOut();
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>IdeaSpark Admin Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      {error && <p className="admin-error">{error}</p>}
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Expertise</th>
              <th>Workplace</th>
              <th>Role</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name || "-"}</td>
                <td>{u.email}</td>
                <td>{u.expertise || "-"}</td>
                <td>{u.workplace || "-"}</td>
                <td>{u.role}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
