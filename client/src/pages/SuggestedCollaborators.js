import React, { useState, useEffect } from 'react';
import { fetchSuggestedCollaborators } from '../services/userService';

export default function SuggestedCollaborators() {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollaborators = async () => {
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
  }, []);

  if (loading) {
    return <div>Loading suggested collaborators...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Suggested Collaborators</h1>
      {collaborators.length === 0 ? (
        <p>No suggested collaborators at the moment.</p>
      ) : (
        <div>
          {collaborators.map((user) => (
            <div key={user._id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3>{user.name}</h3>
                <p>Expertise: {user.expertise}</p>
                <p>Workplace: {user.workplace}</p>
              </div>
              <button style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Connect
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
