import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { buildApiUrl } from "../services/apiBase";

export default function AuthRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const [accountDeleted, setAccountDeleted] = useState(() => {
    return localStorage.getItem("ideaspark_account_deleted") === "true";
  });

  useEffect(() => {
    const checkDeleted = async () => {
      if (!currentUser) return;
      if (accountDeleted) return;
      try {
        const token = await currentUser.getIdToken(true);
        const res = await fetch(buildApiUrl("/api/auth/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data?.deleted) {
          setAccountDeleted(true);
          localStorage.setItem("ideaspark_account_deleted", "true");
        }
      } catch (error) {
        // no-op
      }
    };
    checkDeleted();
  }, [currentUser, accountDeleted]);

  if (loading) return <p>Loading...</p>;

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (accountDeleted) {
    return <Navigate to="/account-deleted" replace />;
  }

  return children;
}
