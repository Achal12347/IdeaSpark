import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const { currentUser, loading: authLoading } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setAllowed(false);
      setLoading(false);
      return;
    }

    const checkUserExists = async () => {
      try {
        console.log("API_URL:", process.env.REACT_APP_API_URL);
        const token = await currentUser.getIdToken(true);
        console.log("ID Token:", token);
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users/${currentUser.uid}/exists`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Response status:", res.status);
        const data = await res.json();
        console.log("Response data:", data);

        if (!data.exists && location.pathname !== "/profile-setup") {
          setAllowed(false);
        } else {
          setAllowed(true);
        }
      } catch (error) {
        console.error("Error checking user existence:", error);
        setAllowed(false);
      }
      setLoading(false);
    };

    checkUserExists();
  }, [currentUser, authLoading, location.pathname]);

  if (authLoading || loading) return <p>Loading...</p>;
  if (!allowed) return <Navigate to="/profile-setup" replace />;

  return children;
}
