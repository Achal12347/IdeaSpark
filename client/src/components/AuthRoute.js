import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
