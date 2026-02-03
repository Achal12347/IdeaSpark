import React, { useState, useEffect } from "react";
import { fetchUserActivity } from "../services/activityService";
import { useAuth } from "../context/AuthContext";
import "../styles/appPageTheme.css";
import "../styles/Activity.css";

export default function Activity() {
  const { currentUser, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !currentUser) return;

    const loadActivity = async () => {
      setLoading(true);
      try {
        const data = await fetchUserActivity();
        setActivities(data);
      } catch (error) {
        console.error("Error loading activity:", error);
      } finally {
        setLoading(false);
      }
    };
    loadActivity();
  }, [authLoading, currentUser]);

  return (
    <div className="app-page activity-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h1 className="app-title">Activity</h1>
            <p className="app-subtitle">Recent updates and interactions.</p>
          </div>
        </div>

        {loading ? (
          <div className="activity-state">Loading activity...</div>
        ) : activities.length === 0 ? (
          <div className="activity-state">No recent activity.</div>
        ) : (
          <div className="app-list">
            {activities.map((activity, index) => (
              <div key={index} className="app-card activity-card">
                <p className="activity-text">{activity.description}</p>
                <span className="activity-time">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

