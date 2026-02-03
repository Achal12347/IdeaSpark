import React, { useState, useEffect } from "react";
import { fetchBookmarks } from "../services/bookmarkService";
import { useAuth } from "../context/AuthContext";
import "../styles/appPageTheme.css";
import "../styles/Bookmarks.css";

export default function Bookmarks() {
  const { currentUser, loading: authLoading } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !currentUser) return;

    const loadBookmarks = async () => {
      setLoading(true);
      try {
        const data = await fetchBookmarks();
        setBookmarks(data);
      } catch (error) {
        console.error("Error loading bookmarks:", error);
      } finally {
        setLoading(false);
      }
    };
    loadBookmarks();
  }, [authLoading, currentUser]);

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
              <div key={bookmark._id} className="bookmark-card app-card">
                <h3>{bookmark.title}</h3>
                <p>{bookmark.description}</p>
                <div className="bookmark-stats">
                  <span>Views {bookmark.views || 0}</span>
                  <span>Likes {bookmark.likes || 0}</span>
                  <span>Comments {bookmark.comments || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

