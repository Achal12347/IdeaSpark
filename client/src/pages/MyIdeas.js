import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { fetchMyIdeas, fetchCollaboratorIdeas } from "../services/ideaService";
import apiRequest from "../services/api";
import IdeaCard from "../components/IdeaCard";
import { useAuth } from "../context/AuthContext";
import "../styles/appPageTheme.css";
import "../styles/MyIdeas.css";

const socketUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(
  /\/api\/?$/,
  ""
);

const buildChatIdeas = (ownedIdeas, collaboratorIdeas) => {
  const combined = [
    ...ownedIdeas.map((idea) => ({ ...idea, chatRole: "Owner" })),
    ...collaboratorIdeas.map((idea) => ({ ...idea, chatRole: "Collaborator" })),
  ];
  const unique = new Map();
  combined.forEach((idea) => {
    if (!unique.has(idea._id)) {
      unique.set(idea._id, idea);
    }
  });
  return Array.from(unique.values());
};

export default function MyIdeas() {
  const [ideas, setIdeas] = useState([]);
  const [collaboratorIdeas, setCollaboratorIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collabLoading, setCollabLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageError, setMessageError] = useState("");
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const newSocket = io(socketUrl, {
      transports: ["websocket"],
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const loadIdeas = async () => {
      setLoading(true);
      try {
        const ideasData = await fetchMyIdeas();
        setIdeas(ideasData);
      } catch (error) {
        console.error("Error loading my ideas:", error);
      } finally {
        setLoading(false);
      }
    };
    loadIdeas();
  }, []);

  useEffect(() => {
    const loadCollaborations = async () => {
      setCollabLoading(true);
      try {
        const collabData = await fetchCollaboratorIdeas();
        setCollaboratorIdeas(collabData || []);
      } catch (error) {
        console.error("Error loading collaborator ideas:", error);
      } finally {
        setCollabLoading(false);
      }
    };
    loadCollaborations();
  }, []);

  useEffect(() => {
    if (!socket || !selectedIdea?._id) return;
    socket.emit("joinIdea", selectedIdea._id);
  }, [socket, selectedIdea]);

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (message) => {
      if (message.idea?.toString?.() && message.idea.toString() !== selectedIdea?._id) {
        return;
      }
      setMessages((prev) => [...prev, message]);
    };
    socket.on("newIdeaMessage", handleNewMessage);

    return () => {
      socket.off("newIdeaMessage", handleNewMessage);
    };
  }, [socket, selectedIdea]);

  const loadMessages = async (ideaId) => {
    setMessagesLoading(true);
    setMessageError("");
    try {
      const data = await apiRequest(`/api/ideas/${ideaId}/messages`);
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessageError("Unable to load messages.");
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSelectIdea = (idea) => {
    setSelectedIdea(idea);
    loadMessages(idea._id);
  };

  const handleSendMessage = async () => {
    if (!selectedIdea || !messageText.trim()) return;
    setMessageError("");
    try {
      await apiRequest(`/api/ideas/${selectedIdea._id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: messageText }),
      });
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
      setMessageError("Unable to send message.");
    }
  };

  const chatIdeas = buildChatIdeas(ideas, collaboratorIdeas);
  const isOwnMessage = (message) =>
    Boolean(message?.sender?.email && currentUser?.email)
    && message.sender.email === currentUser.email;

  return (
    <div className="app-page ideas-page">
      <div className="app-container">
        <div className="app-header ideas-header">
          <div>
            <h2 className="app-title">My Ideas</h2>
            <p className="app-subtitle">Track the ideas you have shared so far.</p>
          </div>
          <button className="app-button" onClick={() => navigate("/add-idea")}>
            Create Post
          </button>
        </div>

        {loading ? (
          <div className="ideas-loading">Loading ideas...</div>
        ) : ideas.length === 0 ? (
          <div className="ideas-empty app-card">
            <h3>No ideas yet</h3>
            <p>Start by creating your first idea.</p>
            <button className="app-button" onClick={() => navigate("/add-idea")}>
              Create Post
            </button>
          </div>
        ) : (
          <div className="ideas-grid app-grid">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea._id}
                idea={idea}
                variant="user"
                className="app-card"
                onClick={() => navigate(`/idea/${idea._id}`)}
              />
            ))}
          </div>
        )}

        <section className="collaboration-section">
          <div className="app-header">
            <div>
              <h2 className="app-title">Collaboration Chat</h2>
              <p className="app-subtitle">Message collaborators on your ideas.</p>
            </div>
          </div>

          {collabLoading ? (
            <div className="ideas-loading">Loading collaborations...</div>
          ) : chatIdeas.length === 0 ? (
            <div className="ideas-empty app-card">
              <p>No collaborations yet.</p>
            </div>
          ) : (
            <div className="collaboration-grid">
              <div className="collaboration-list">
                {chatIdeas.map((idea) => (
                  <div key={idea._id} className="chat-idea">
                    <IdeaCard
                      idea={idea}
                      variant="user"
                      className={`app-card ${selectedIdea?._id === idea._id ? "is-selected" : ""}`}
                      onClick={() => handleSelectIdea(idea)}
                    />
                    <span className={`chat-badge ${idea.chatRole.toLowerCase()}`}>
                      {idea.chatRole}
                    </span>
                  </div>
                ))}
              </div>

              <div className="collaboration-panel app-card">
                {selectedIdea ? (
                  <>
                    <div className="panel-header">
                      <div>
                        <h3>{selectedIdea.title}</h3>
                        <p>Chat with collaborators</p>
                      </div>
                    </div>
                    {messagesLoading ? (
                      <div className="messages-state">Loading messages...</div>
                    ) : (
                      <div className="message-list">
                        {messages.length === 0 ? (
                          <p className="messages-state">No messages yet.</p>
                        ) : (
                          messages.map((message) => (
                            <div
                              key={message._id}
                              className={`message-item ${isOwnMessage(message) ? "own" : ""}`}
                            >
                              <div>
                                <strong>{message.sender?.name || "User"}</strong>
                                <p>{message.content}</p>
                              </div>
                              <span>
                                {new Date(message.createdAt).toLocaleString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    {messageError ? <p className="messages-error">{messageError}</p> : null}
                    <div className="message-input">
                      <textarea
                        className="app-textarea"
                        placeholder="Write a message..."
                        value={messageText}
                        onChange={(event) => setMessageText(event.target.value)}
                      />
                      <button className="app-button" onClick={handleSendMessage}>
                        Send Message
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="panel-placeholder">
                    <h3>Select an idea</h3>
                    <p>Choose a collaboration to open the message thread.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
