import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { buildApiUrl } from "../services/apiBase";

export default function AdminRoute({ children }) {
  const [allowed, setAllowed] = useState(null); // null = still checking
  const [loading, setLoading] = useState(true);
  const { currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    const verifyAdmin = async () => {
      if (authLoading) return;

      if (!currentUser) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      try {
        const token = await currentUser.getIdToken(true);
        const res = await fetch(buildApiUrl("/api/auth/me"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setAllowed(false);
          setLoading(false);
          return;
        }

        const data = await res.json();

        // 🔒 KEY CHECK: Only admin allowed
        if (data.role !== "admin") {
          setAllowed(false);
        } else {
          setAllowed(true);
        }

      } catch (err) {
        console.error("AdminRoute fetch error:", err);
        setAllowed(false);
      }

      setLoading(false);
    };

    verifyAdmin();
  }, [currentUser, authLoading]);

  // Show loading while checking
  if (loading || allowed === null) return <p>Loading...</p>;

  // Redirect if not admin
  if (!allowed) return <Navigate to="/login" replace />;

  // Admin allowed → render children
  return children;
}
