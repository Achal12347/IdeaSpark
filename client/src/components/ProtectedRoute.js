import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileExists, setProfileExists] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const token = await currentUser.getIdToken();

        const res = await fetch(
          `http://localhost:5000/api/users/${currentUser.uid}/exists`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setProfileExists(data.exists);
      } catch (err) {
        console.error(err);
        setProfileExists(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading...</p>;
  }

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Allow profile-setup page even if profile does not exist
  if (!profileExists && location.pathname !== "/profile-setup") {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
};

export default ProtectedRoute;
