import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import apiRequest from "../services/api";
import { fetchMembers } from "../services/userService";
import io from "socket.io-client";
import "../styles/appPageTheme.css";
import "../styles/Messages.css";

export default function Messages() {
  const { currentUser, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [thread, setThread] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [members, setMembers] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [adminMessages, setAdminMessages] = useState([]);

  const socketUrl = useMemo(
    () =>
      (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(
        /\/api\/?$/,
        ""
      ),
    []
  );

  const loadConversations = async () => {
    const data = await apiRequest("/api/direct-messages/conversations");
    setConversations(Array.isArray(data) ? data : []);
  };

  const loadAdminMessages = async () => {
    const data = await apiRequest("/api/admin-messages/inbox");
    setAdminMessages(Array.isArray(data) ? data : []);
  };

  const loadThread = async (userId) => {
    const data = await apiRequest(`/api/direct-messages/thread/${userId}`);
    setThread(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (authLoading || !currentUser) return;
    const init = async () => {
      setLoading(true);
      try {
        await loadConversations();
        await loadAdminMessages();
        const data = await fetchMembers();
        setMembers(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [authLoading, currentUser]);

  useEffect(() => {
    if (!selectedUser?._id) return;
    loadThread(selectedUser._id);
  }, [selectedUser?._id]);

  useEffect(() => {
    if (authLoading || !currentUser) return;
    const socket = io(socketUrl, { transports: ["websocket"] });
    socket.on("directMessage", async (message) => {
      const senderId = message?.sender?._id || message?.sender;
      const recipientId = message?.recipient?._id || message?.recipient;
      const currentUserId = currentUser?._id;

      if (![senderId, recipientId].includes(currentUserId)) return;

      await loadConversations();
      await loadAdminMessages();
      if (selectedUser?._id && [senderId, recipientId].includes(selectedUser._id)) {
        setThread((prev) =>
          prev.some((item) => item._id === message._id) ? prev : [...prev, message]
        );
      }
    });
    return () => socket.disconnect();
  }, [authLoading, currentUser, selectedUser?._id, socketUrl]);

  const handleSend = async () => {
    if (!selectedUser?._id || !messageText.trim()) return;
    await apiRequest("/api/direct-messages", {
      method: "POST",
      body: JSON.stringify({
        recipientId: selectedUser._id,
        content: messageText,
      }),
    });
    setMessageText("");
    await loadThread(selectedUser._id);
    await loadConversations();
  };

  const normalizedSearch = searchQuery.toLowerCase();
  const filteredConversations = conversations.filter((item) => {
    const name = item.user?.name || item.user?.email || "";
    if (filter === "unread") return false;
    return name.toLowerCase().includes(normalizedSearch);
  });

  const filteredMembers = members.filter((member) => {
    const label = member.name || member.email || "";
    return label.toLowerCase().includes(normalizedSearch);
  });

  const recentChats = filteredConversations.slice(0, 5);

  return (
    <div className="app-page messages-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h1 className="app-title">Messages</h1>
            <p className="app-subtitle">Private conversations with other users.</p>
          </div>
        </div>

        {loading ? (
          <div className="messages-loading">Loading messages...</div>
        ) : (
          <div className="messages-grid app-card">
            <aside className="messages-sidebar">
              <div className="messages-toolbar">
                <input
                  className="app-input"
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="messages-filters">
                  <button
                    className={`filter-btn ${filter === "all" ? "active" : ""}`}
                    onClick={() => setFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className={`filter-btn ${filter === "unread" ? "active" : ""}`}
                    onClick={() => setFilter("unread")}
                  >
                    Unread
                  </button>
                </div>
                <button className="app-button" onClick={() => setShowPicker(true)}>
                  New message
                </button>
              </div>

              <div className="messages-section">
                <h4>Recent chats</h4>
                {recentChats.length === 0 ? (
                  <p className="messages-empty">No recent chats.</p>
                ) : (
                  recentChats.map((item) => (
                    <button
                      key={item.user._id}
                      className={`messages-item ${
                        selectedUser?._id === item.user._id ? "active" : ""
                      }`}
                      onClick={() => setSelectedUser(item.user)}
                    >
                      <div>
                        <h4>{item.user.name || item.user.email}</h4>
                        <p>{item.lastMessage?.content}</p>
                      </div>
                      <span className="messages-time">
                        {item.lastMessage?.createdAt
                          ? new Date(item.lastMessage.createdAt).toLocaleDateString()
                          : ""}
                      </span>
                    </button>
                  ))
                )}
              </div>

              <div className="messages-section">
                <h4>Admin messages</h4>
                {adminMessages.length === 0 ? (
                  <p className="messages-empty">No admin messages.</p>
                ) : (
                  adminMessages.slice(0, 4).map((message) => (
                    <div key={message._id} className="admin-message-card">
                      <p>{message.content}</p>
                      <span>
                        {new Date(message.createdAt).toLocaleDateString()} •{" "}
                        {message.sender?.name || "Admin"}
                      </span>
                    </div>
                  ))
                )}
                <p className="messages-note">
                  Admin messages are read-only. For help, use the Contact page.
                </p>
              </div>
            </aside>

            <div className="messages-thread">
              {selectedUser ? (
                <>
                  <div className="thread-header">
                    <h3>{selectedUser.name || selectedUser.email}</h3>
                    <p>Private chat</p>
                  </div>
                  <div className="thread-body">
                    {thread.length === 0 ? (
                      <p className="messages-empty">No messages yet.</p>
                    ) : (
                      thread.map((message) => {
                        const isOwn = message.sender?._id === currentUser?._id;
                        return (
                          <div
                            key={message._id}
                            className={`thread-message ${isOwn ? "own" : ""}`}
                          >
                            <p>{message.content}</p>
                            <span>
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="thread-input">
                    <textarea
                      className="app-textarea"
                      placeholder="Write a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                    <button className="app-button" onClick={handleSend}>
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div className="thread-placeholder">
                  <h3>Select a conversation</h3>
                  <p>Choose a recent chat or start a new message.</p>
                  <button
                    className="app-button-secondary"
                    onClick={() => setShowPicker(true)}
                  >
                    Start new chat
                  </button>
                  <a className="messages-link" href="/contact">
                    Contact admin
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {showPicker ? (
        <div className="user-picker-overlay" onClick={() => setShowPicker(false)}>
          <div className="user-picker" onClick={(e) => e.stopPropagation()}>
            <h3>Start a new conversation</h3>
            <input
              className="app-input"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="user-picker-list">
              {filteredMembers.map((member) => (
                <button
                  key={member._id}
                  className="user-picker-item"
                  onClick={() => {
                    setSelectedUser(member);
                    setShowPicker(false);
                  }}
                >
                  <div>
                    <h4>{member.name || member.email}</h4>
                    <p>{member.roles?.length ? member.roles.join(", ") : "Member"}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
