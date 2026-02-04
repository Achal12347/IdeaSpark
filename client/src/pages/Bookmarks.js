import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBookmarks } from "../services/bookmarkService";
import { useAuth } from "../context/AuthContext";
import IdeaCard from "../components/IdeaCard";
import apiRequest from "../services/api";
import io from "socket.io-client";
import "../styles/appPageTheme.css";
import "../styles/Bookmarks.css";

export default function Bookmarks() {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (authLoading || !currentUser) return;

    const loadBookmarks = async () => {
      setLoading(true);
      try {
        const data = await fetchBookmarks();
        setBookmarks(data);
        const profile = await apiRequest("/api/users/me");
        setUserId(profile?._id || "");
      } catch (error) {
        console.error("Error loading bookmarks:", error);
      } finally {
        setLoading(false);
      }
    };
    loadBookmarks();
  }, [authLoading, currentUser]);

  useEffect(() => {
    if (authLoading || !currentUser) return;
    const socketUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(
      /\/api\/?$/,
      ""
    );
    const socket = io(socketUrl, { transports: ["websocket"] });
    socket.on("bookmarksUpdated", async (payload) => {
      if (payload?.userId !== userId) return;
      const data = await fetchBookmarks();
      setBookmarks(data);
    });
    return () => socket.disconnect();
  }, [authLoading, currentUser, userId]);

  return (
    <div className="app-page bookmarks-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h1 className="app-title">Bookmarks</h1>
            <p className="app-subtitle">Ideas you have saved for later.</p>
          </div>
        </div>

        {loading ? (
          <div className="bookmarks-loading">Loading bookmarks...</div>
        ) : bookmarks.length === 0 ? (
          <div className="no-bookmarks">You have not bookmarked any ideas yet.</div>
        ) : (
          <div className="bookmarks-list">
            {bookmarks.map((bookmark) => (
              <IdeaCard
                key={bookmark._id}
                idea={bookmark}
                variant="user"
                className="app-card"
                onClick={() => navigate(`/idea/${bookmark._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
