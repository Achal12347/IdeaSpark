import { useEffect, useState } from "react";
import { auth } from "../firebase";
import apiRequest from "../services/api";
import "../styles/appPageTheme.css";
import "../styles/AccountDeleted.css";

export default function AccountDeleted() {
  const [reason, setReason] = useState("");
  const [deletedAt, setDeletedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [requestReason, setRequestReason] = useState("");
  const [requestStatus, setRequestStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadReason = async () => {
      try {
        const profile = await apiRequest("/api/users/me");
        if (profile?.deletionReason) {
          setReason(profile.deletionReason);
        }
        if (profile?.deletedAt) {
          setDeletedAt(new Date(profile.deletedAt).toLocaleString());
        }
        const requests = await apiRequest("/api/recovery-requests/me?type=account");
        if (Array.isArray(requests) && requests.length > 0) {
          setRequestStatus(requests[0]);
        }
      } catch (error) {
        setReason("");
      } finally {
        setLoading(false);
      }
    };
    loadReason();
  }, []);

  const handleRequest = async () => {
    if (!requestReason.trim()) return;
    setSubmitting(true);
    try {
      const response = await apiRequest("/api/recovery-requests", {
        method: "POST",
        body: JSON.stringify({
          type: "account",
          reason: requestReason.trim(),
        }),
      });
      setRequestStatus(response?.request || null);
      setRequestReason("");
    } catch (error) {
      // no-op for now
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="app-page account-deleted-page">
      <div className="app-container">
        <div className="account-deleted-card app-card">
          <h1>Your account has been deleted</h1>
          {loading ? (
            <p className="account-deleted-note">Loading details...</p>
          ) : (
            <>
              <p className="account-deleted-note">
                Your account was removed by an administrator.
              </p>
              {reason ? (
                <div className="account-deleted-reason">
                  <span>Reason</span>
                  <p>{reason}</p>
                </div>
              ) : null}
              {deletedAt ? (
                <p className="account-deleted-meta">Deleted on {deletedAt}</p>
              ) : null}
              <div className="account-deleted-recovery">
                <h3>Request account recovery</h3>
              {requestStatus ? (
                <div className="account-deleted-status">
                  <span>Status</span>
                  <p>{requestStatus.status}</p>
                  {requestStatus.adminNote ? (
                    <p className="account-deleted-admin-note">
                      Admin note: {requestStatus.adminNote}
                    </p>
                  ) : null}
                  {requestStatus.status === "approved" ? (
                    <p className="account-deleted-note">
                      Your account is restored. Please sign out and log back in.
                    </p>
                  ) : null}
                </div>
              ) : (
                  <>
                    <textarea
                      className="account-deleted-input"
                      placeholder="Explain why you want to recover your account"
                      value={requestReason}
                      onChange={(e) => setRequestReason(e.target.value)}
                    />
                    <button
                      className="app-button"
                      onClick={handleRequest}
                      disabled={!requestReason.trim() || submitting}
                    >
                      {submitting ? "Submitting..." : "Submit recovery request"}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
          <div className="account-deleted-actions">
            <button className="app-button" onClick={handleSignOut}>
              Sign out
            </button>
            <a className="app-button-secondary" href="/contact">
              Contact support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
