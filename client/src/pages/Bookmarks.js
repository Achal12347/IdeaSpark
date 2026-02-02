import React, { useState, useEffect } from 'react';
import { fetchBookmarks } from '../services/bookmarkService';
import { useAuth } from '../context/AuthContext';
import '../styles/Bookmarks.css';

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
        console.error('Error loading bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBookmarks();
  }, [authLoading, currentUser]);

  if (loading) {
    return <div className="bookmarks-loading">Loading bookmarks...</div>;
  }

  return (
    <div className="bookmarks-page">
      <h1>Bookmarks</h1>
      {bookmarks.length === 0 ? (
        <p className="no-bookmarks">You haven't bookmarked any ideas yet.</p>
      ) : (
        <div className="bookmarks-list">
          {bookmarks.map((bookmark) => (
            <div key={bookmark._id} className="bookmark-card">
              <h3>{bookmark.title}</h3>
              <p>{bookmark.description}</p>
              <div className="bookmark-stats">
                <span>👀 {bookmark.views || 0}</span>
                <span>⭐ {bookmark.likes || 0}</span>
                <span>💬 {bookmark.comments || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
