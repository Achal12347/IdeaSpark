import { useState, useEffect } from "react";
import io from "socket.io-client";
import apiRequest from "../services/api";

export default function TeamChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const messagesData = await apiRequest('/api/messages');
        setMessages(messagesData);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };
    loadMessages();

    // Initialize socket
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join team
    const teamId = "team1"; // TODO: Get actual team ID
    newSocket.emit('joinTeam', teamId);

    // Listen for new messages
    newSocket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (socket && newMessage.trim()) {
      // Assume senderId is 1 for now, in real app get from auth context
      const senderId = "user1"; // TODO: Get actual user ID
      const teamId = "team1"; // TODO: Get actual team ID
      socket.emit('sendMessage', { teamId, content: newMessage, senderId });
      setNewMessage("");
    }
  };

  return (
    <div className="team-chat-page">
      <h2>Team Chat</h2>
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message._id} className="message">
            <strong>{message.sender?.name}:</strong> {message.content}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}
