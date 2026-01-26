import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const { currentUser, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setChecking(false);
      return;
    }

    const checkProfile = async () => {
      try {
        const token = await currentUser.getIdToken(true);
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users/${currentUser.uid}/exists`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        setHasProfile(data.exists);
      } catch (err) {
        console.error("Profile check failed:", err);
        setHasProfile(false);
      } finally {
        setChecking(false);
      }
    };

    checkProfile();
  }, [currentUser, authLoading]);

  if (authLoading || checking) return <p>Loading...</p>;

  // ❌ Not logged in
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // 🚨 IMPORTANT FIX:
  // Always allow profile setup page
  if (location.pathname === "/profile-setup") {
    return children;
  }

  // ❌ Logged in but no profile → force profile setup
  if (!hasProfile) {
    return <Navigate to="/profile-setup" replace />;
  }

  // ✅ Logged in + profile exists
  return children;
}
