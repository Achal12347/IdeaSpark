import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { buildApiUrl } from "../services/apiBase";

export default function ProtectedRoute({ children }) {
  const { currentUser, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasProfile, setHasProfile] = useState(() => {
    const cached = localStorage.getItem("ideaspark_hasProfile");
    return cached === "true";
  });
  const [accountDeleted, setAccountDeleted] = useState(false);

  useEffect(() => {
    if (authLoading || !currentUser) {
      setChecking(false);
      return;
    }

    const checkProfile = async () => {
      try {
        const token = await currentUser.getIdToken(true);
        const res = await fetch(buildApiUrl(`/api/users/${currentUser.uid}/exists`), {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        const exists = Boolean(data.exists);
        const deleted = Boolean(data.deleted);
        setAccountDeleted(deleted);
        if (deleted) {
          localStorage.setItem("ideaspark_account_deleted", "true");
        } else {
          localStorage.removeItem("ideaspark_account_deleted");
        }
        setHasProfile(exists);
        localStorage.setItem("ideaspark_hasProfile", exists ? "true" : "false");
      } catch (err) {
        console.error(err);
        // If the check fails, keep the user on the current page
        // and rely on cached profile state if available.
        if (!localStorage.getItem("ideaspark_hasProfile")) {
          setHasProfile(true);
        }
      } finally {
        setChecking(false);
      }
    };

    checkProfile();
  }, [currentUser, authLoading]);

  if (authLoading || checking) return <p>Loading...</p>;

  if (!currentUser) return <Navigate to="/" replace />;

  if (accountDeleted) return <Navigate to="/account-deleted" replace />;

  if (!hasProfile) return <Navigate to="/profile-setup" replace />;

  return children;
}
