import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DirectMessaging.css";

const DirectMessaging = ({ currentUserId, receiverId, receiverName, onClose }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sendStatus, setSendStatus] = useState("");

  // Load messages between the current user and the selected receiver
  const loadMessages = () => {
    if (!receiverId) return;
    axios
      .get(`http://localhost:8081/loadDirectMessages/${currentUserId}/${receiverId}`)
      .then((response) => {
        setMessages(response.data.enrichedMessages || []);
      })
      .catch((error) => {
        console.error("Error loading messages:", error);
      });
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUserId, receiverId]);

  // Send a direct message
  const sendMessage = () => {
    if (!message.trim() || !receiverId) return;
    const tempMessage = {
      userId: currentUserId,
      userName: "Me",
      message,
      time: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    setMessage("");
    setSendStatus("");

    axios
      .post("http://localhost:8081/sendDirectMessage", {
        senderId: currentUserId,
        receiverId,
        message,
      })
      .then(() => {
        setSendStatus("Message sent!");
        loadMessages();
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        setSendStatus("Error sending message. Please try again.");
      });
  };

  return (
    <div className="direct-messaging-container">
      <div className="dm-header">
        <h2>Direct Messaging with {receiverName || "User"}</h2>
        <button className="close-button" onClick={onClose}>X</button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => {
          const alignmentClass =
            msg.userId === String(currentUserId) ? "my-message" : "other-message";
          return (
            <div key={index} className={`message ${alignmentClass}`}>
              <strong>{msg.userName}:</strong> {msg.message}
              <div className="timestamp">{msg.time}</div>
            </div>
          );
        })}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      {sendStatus && <div className="send-feedback">{sendStatus}</div>}
    </div>
  );
};

export default DirectMessaging;
