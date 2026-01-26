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

    // Not logged in
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const checkProfile = async () => {
      try {
        const token = await currentUser.getIdToken(true);

        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users/${currentUser.uid}/exists`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setHasProfile(data.exists);
      } catch (err) {
        console.error("Profile check failed:", err);
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [currentUser, authLoading]);

  if (authLoading || loading) return <p>Loading...</p>;

  // ❌ Not logged in → login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Logged in but no profile
  if (!hasProfile && location.pathname !== "/profile-setup") {
    return <Navigate to="/profile-setup" replace />;
  }

  // ✅ Allow access
  return children;
}
