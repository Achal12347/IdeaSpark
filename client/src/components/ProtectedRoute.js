import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      const token = await user.getIdToken(true);
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/${user.uid}/exists`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      if (!data.exists && location.pathname !== "/profile-setup") {
        setAllowed(false);
      } else {
        setAllowed(true);
      }

      setLoading(false);
    });
  }, [ location.pathname ]);

  if (loading) return <p>Loading...</p>;
  if (!allowed) return <Navigate to="/profile-setup" replace />;

  return children;
}
