import React, { useState, useEffect } from 'react';
import { fetchSuggestedCollaborators } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import '../styles/SuggestedCollaborators.css';

export default function SuggestedCollaborators() {
  const { currentUser, loading: authLoading } = useAuth();
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !currentUser) return;

    const loadCollaborators = async () => {
      setLoading(true);
      try {
        const data = await fetchSuggestedCollaborators();
        setCollaborators(data);
      } catch (error) {
        console.error('Error loading suggested collaborators:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCollaborators();
  }, [authLoading, currentUser]);

  if (loading) {
    return <div className="collaborators-loading">Loading suggested collaborators...</div>;
  }

  return (
    <div className="collaborators-page">
      <h1>💡 Suggested Collaborators</h1>
      {collaborators.length === 0 ? (
        <p className="no-collaborators">No suggested collaborators at the moment.</p>
      ) : (
        <div className="collaborators-list">
          {collaborators.map((user) => (
            <div key={user._id} className="collaborator-card">
              <div className="collaborator-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="collaborator-info">
                <h3>{user.name}</h3>
                <p>Expertise: {user.expertise}</p>
                <p>Workplace: {user.workplace}</p>
              </div>
              <button className="connect-btn">Connect</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
