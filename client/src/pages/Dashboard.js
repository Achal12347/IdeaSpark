import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";


export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    navigate("/");
    await signOut(auth);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Dashboard</h1>
        <div className="dashboard-actions">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}
