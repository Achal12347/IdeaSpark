import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { useEffect, useState } from "react";

export default function AdminRoute({ children }) {
  const [allowed, setAllowed] = useState(null); // null = still checking
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      const user = auth.currentUser;

      if (!user) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      try {
        // Get Firebase ID token
        const token = await user.getIdToken();

        // Call backend to fetch user info
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
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
  }, []);

  // Show loading while checking
  if (loading || allowed === null) return <p>Loading...</p>;

  // Redirect if not admin
  if (!allowed) return <Navigate to="/login" replace />;

  // Admin allowed → render children
  return children;
}
