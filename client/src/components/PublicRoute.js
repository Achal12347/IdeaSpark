import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const [redirectTo, setRedirectTo] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkRole = async () => {
      if (!currentUser) {
        setRedirectTo(null);
        return;
      }

      try {
        const token = await currentUser.getIdToken(true);
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setRedirectTo("/dashboard");
          return;
        }

        const data = await res.json();
        if (data.role === "admin") {
          setRedirectTo("/admin/dashboard");
        } else if (data.exists) {
          setRedirectTo("/dashboard");
        } else {
          setRedirectTo("/profile-setup");
        }
      } catch (error) {
        console.error("PublicRoute error:", error);
        setRedirectTo("/dashboard");
      }
    };

    if (!loading) {
      checkRole();
    }
  }, [currentUser, loading, location.pathname]);

  if (loading) return <p>Loading...</p>;

  if (currentUser && redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
