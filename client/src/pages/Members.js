import React, { useEffect, useState } from "react";
import { fetchMembers } from "../services/userService";
import UserCard from "../components/UserCard";
import UserDetailsModal from "../components/UserDetailsModal";
import io from "socket.io-client";
import "../styles/appPageTheme.css";
import "../styles/Members.css";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      try {
        const data = await fetchMembers();
        setMembers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading members:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMembers();
  }, []);

  useEffect(() => {
    const socketUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(
      /\/api\/?$/,
      ""
    );
    const socket = io(socketUrl, { transports: ["websocket"] });
    socket.on("membersUpdated", async () => {
      const data = await fetchMembers();
      setMembers(Array.isArray(data) ? data : []);
    });
    return () => socket.disconnect();
  }, []);

  const collaborators = members.filter((member) => member.isCollaborator);
  const others = members.filter((member) => !member.isCollaborator);

  return (
    <div className="app-page members-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h1 className="app-title">Members</h1>
            <p className="app-subtitle">View and connect with other members.</p>
          </div>
        </div>
        {loading ? (
          <div className="app-card members-card">
            <p className="members-empty">Loading members...</p>
          </div>
        ) : (
          <>
            <div className="members-section">
              <h3>Already collaborated</h3>
              {collaborators.length === 0 ? (
                <div className="app-card members-card">
                  <p className="members-empty">No collaborators yet.</p>
                </div>
              ) : (
                <div className="members-list">
                  {collaborators.map((member) => (
                    <UserCard
                      key={member._id}
                      user={member}
                      onClick={() => setSelectedUser(member)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="members-section">
              <h3>All members</h3>
              {others.length === 0 ? (
                <div className="app-card members-card">
                  <p className="members-empty">No other members found.</p>
                </div>
              ) : (
                <div className="members-list">
                  {others.map((member) => (
                    <UserCard
                      key={member._id}
                      user={member}
                      onClick={() => setSelectedUser(member)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}

