import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const { currentUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (authLoading) return;

    // Not logged in → redirect to login
    if (!currentUser) {
      setLoading(false);
      setHasProfile(false);
      return;
    }

    // Check if user has a profile
    const checkUserExists = async () => {
      try {
        const token = await currentUser.getIdToken(true);
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users/${currentUser.uid}/exists`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setHasProfile(data.exists);
      } catch (error) {
        console.error("Profile check failed:", error);
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserExists();
  }, [currentUser, authLoading, location.pathname]);

  if (authLoading || loading) return <p>Loading...</p>;

  // ❌ Not logged in
  if (!currentUser) return <Navigate to="/" replace />;

  // ❌ Logged in but no profile
  if (!hasProfile && location.pathname !== "/profile-setup") {
    return <Navigate to="/profile-setup" replace />;
  }

  // ✅ Logged in and has profile
  return children;
}
