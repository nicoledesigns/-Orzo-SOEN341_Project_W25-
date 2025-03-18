import React, { useState, useEffect } from "react";

const allowedColors = [
  "#e6194B", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
  "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
  "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000",
  "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080",
  "#ffe4e1", "#ff7f50", "#6495ed", "#ff1493", "#00fa9a",
  "#ff8c00", "#9400d3", "#00ced1", "#ffd700", "#dc143c"
];

const Messages = ({ selectedChannel, handleDeleteMessage }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userColors, setUserColors] = useState({});

  // Assume that userId and userName are stored in sessionStorage after login.
  const userId = sessionStorage.getItem("userId");
  const userName = sessionStorage.getItem("userName");
  // Check if the current user is an admin for deleting a message
  //const isAdmin = userName === "Admin";


  // Fetch messages when the selected channel changes or after sending a new message.
  useEffect(() => {
    if (selectedChannel) {
      fetch(`http://localhost:8081/loadMessages/${selectedChannel.id}`)
        .then(response => response.json())
        .then(data => {
          if (data.enrichedMessages) {
            setMessages(data.enrichedMessages);
          }
        })
        .catch(err => console.error("Error loading messages:", err));
    }
  }, [selectedChannel]);

  // Build a mapping from non-admin usernames to unique colors.
  useEffect(() => {
    const newMapping = { ...userColors };
    messages.forEach(msg => {
      if (msg.username !== "Admin" && !newMapping[msg.username]) {
        const usedColors = Object.values(newMapping);
        const availableColors = allowedColors.filter(color => !usedColors.includes(color));
        if (availableColors.length > 0) {
          newMapping[msg.username] = availableColors[0];
        } else {
          newMapping[msg.username] = allowedColors[Math.floor(Math.random() * allowedColors.length)];
        }
      }
    });
    setUserColors(newMapping);
  }, [messages]);


  // Nicole: State for sending status (success or error)
  const [sendStatus, setSendStatus] = useState(""); 

  const handleMessageSend = () => {
    if (!selectedChannel || message.trim() === "") return;
    
    // Nicole: Reset status before sending a new message
    setSendStatus("Error sending message. Please try again."); 

    fetch("http://localhost:8081/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        channelId: selectedChannel.id,
        message
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to send message");
        }
        return response.json();
      })
      .then(() => fetch(`http://localhost:8081/loadMessages/${selectedChannel.id}`))
      .then(response => response.json())
      .then(data => {
        if (data.enrichedMessages) {
          setMessages(data.enrichedMessages);
        }
        setMessage("");
        //Nicole: Success feedback
        setSendStatus("Message sent successfully!"); 

      })
      .catch(err => console.error("Error sending message:", err));
      //Nicole: Error feedback
      setSendStatus("Error sending message. Please try again."); 

  };

  const refreshMessages = () => { //Added refreshMessages function
    if (selectedChannel) {
      fetch(`http://localhost:8081/loadMessages/${selectedChannel.id}`)
        .then(response => response.json())
        .then(data => {
          if (data.enrichedMessages) {
            setMessages(data.enrichedMessages);
          }
        })
        .catch(err => console.error("Error loading messages:", err));
    }
  };

  return (
    <>
      <style>{`
        .chat-messages {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #fff;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        
        /* Base style for messages */
        .message {
          padding: 8px 12px;
          margin-bottom: 10px;
          border-radius: 5px;
          max-width: 80%;
        }
        
        /* Align messages from the current user to the right */
        .my-message {
          align-self: flex-end;
        }
        
        /* Align messages from others to the left */
        .other-message {
          align-self: flex-start;
        }
        
        /* Remove background for admin messages */
        .message.admin {
          background-color: transparent;
        }
        
        /* Remove background for user messages */
        .message.user {
          background-color: transparent;
        }
        
        /* Timestamp styling */
        .timestamp {
          font-size: 0.8em;
          color: gray;
          text-align: right;
        }

      `}</style>

      <div className="chat-section">
        <div className="chat-header">
          <h3>#{selectedChannel.name}</h3>
          <p>{selectedChannel.members?.length || 0} Chat Members</p>
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => {
            const isAdmin = userId === "7"; // check if userID correspond to an ADMIN
            const alignmentClass = (String(msg.userId) === String(userId)) ? "my-message" : "other-message";
            return (
              <div
                key={index}
                className={`message ${msg.username === "Admin" ? "admin" : "user"} ${alignmentClass}`}
              >
                <strong>
                  <span
                    style={{
                      color: msg.username === "Admin"
                        ? "#5371ff"
                        : userColors[msg.username] || "#000"
                    }}
                  >
                    {msg.username}
                  </span>
                  :
                </strong>{" "}
                {msg.message}
                <div className="timestamp">{msg.time}</div>
                  {/* Show delete button only if the message is from Admin */}
                  {isAdmin && (
                    <button
  className="delete-button"
  onClick={async () => {
    try {
      // Optimistically remove the message from UI first
      setMessages(prevMessages =>
        prevMessages.filter(m => !(m.message === msg.message && m.time === msg.time))
      );

      // Wait for delete request to complete
      await handleDeleteMessage(selectedChannel.id, userId, msg.message, msg.time);
      
      // Fetch updated messages to ensure backend consistency
      setTimeout(refreshMessages, 500); // Small delay to allow backend to update

    } catch (err) {
      console.error("Error deleting message:", err);
    }
  }}
>
  Delete
</button>

)}
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
          <button onClick={handleMessageSend}>Send</button>
        </div>
                {/* Nicole: Display send status (success or error) */}
                {sendStatus && <div className="send-feedback">{sendStatus}</div>}
      </div>
    </>
  );
};

export default Messages;
