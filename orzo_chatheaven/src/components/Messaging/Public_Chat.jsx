import React, { useState } from "react";

const Messages = ({ selectedChannel }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    //change depending on the users in db
    { user: "Karan", text: "Hi everyone! Welcome to the channel." },
    { user: "Yassine", text: "Looking forward to chat with everyone yipppppeeee" },
  ]);

  const handleMessageSend = () => {
    if (message.trim() === "") {
      return; // Don't send empty messages
    }

    // Add the new message to the messages array
    setMessages([...messages, { user: "Admin", text: message }]);

    // Clear the message input
    setMessage("");
  };
  //small example of the front end side of the chat. Modify as needed :)
  return (
    <div className="chat-section">
      <div className="chat-header">
        <h3>#{selectedChannel.name}</h3>
        <p>{selectedChannel.members?.length || 0}  Chat Members</p>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleMessageSend}>Send</button>
      </div>
    </div>
  );
};

export default Messages;

