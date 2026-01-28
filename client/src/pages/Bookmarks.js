import React, { useState, useEffect } from 'react';
import { fetchBookmarks } from '../services/bookmarkService';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookmarks = async () => {
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
  }, []);

  if (loading) {
    return <div>Loading bookmarks...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bookmarks</h1>
      {bookmarks.length === 0 ? (
        <p>You haven't bookmarked any ideas yet.</p>
      ) : (
        <div>
          {bookmarks.map((bookmark) => (
            <div key={bookmark._id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              backgroundColor: '#fff'
            }}>
              <h3>{bookmark.title}</h3>
              <p>{bookmark.description}</p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
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
