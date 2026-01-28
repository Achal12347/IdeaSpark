import React, { useState, useEffect } from 'react';
import { fetchUserActivity } from '../services/activityService';

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const data = await fetchUserActivity();
        setActivities(data);
      } catch (error) {
        console.error('Error loading activity:', error);
      } finally {
        setLoading(false);
      }
    };
    loadActivity();
  }, []);

  if (loading) {
    return <div>Loading activity...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Activity</h1>
      {activities.length === 0 ? (
        <p>No recent activity.</p>
      ) : (
        <div>
          {activities.map((activity, index) => (
            <div key={index} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              backgroundColor: '#fff'
            }}>
              <p>{activity.description}</p>
              <small style={{ color: '#666' }}>{new Date(activity.timestamp).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
