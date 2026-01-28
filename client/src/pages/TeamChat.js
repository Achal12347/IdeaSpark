import { useState, useEffect } from "react";
import apiRequest from "../services/api";

export default function TeamChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

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
  }, []);

  const handleSendMessage = async () => {
    try {
      await apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ content: newMessage }),
      });
      setNewMessage("");
      // Reload messages
      const messagesData = await apiRequest('/api/messages');
      setMessages(messagesData);
    } catch (error) {
      console.error("Error sending message:", error);
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
