import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const navigate = useNavigate();

  // Fetch user channels on load
  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    fetch(`http://localhost:8081/getUserChannels/${userId}`)
      .then((response) => response.json())
      .then((data) => setChannels(data.channels))
      .catch((err) => console.error("Error fetching user channels:", err));
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const currentChannel = channels.find((channel) => channel.id === selectedChannel?.id) || {};

  return (
    <div className="user-dashboard">
      <div className="sidebar">
        <h1 className="chathaven-title">ChatHaven</h1>
        <h3>Channels</h3>
        <ul>
          {channels.map((channel) => (
            <li
              key={channel.id}
              className={selectedChannel?.id === channel.id ? "active" : ""}
              onClick={() => setSelectedChannel(channel)}
            >
              #{channel.name}
            </li>
          ))}
        </ul>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="chat-section">
        <div className="chat-header">
          <h3>#{currentChannel.name}</h3>
          <p>{currentChannel.members?.length || 0} Members</p>
        </div>
        <div className="chat-messages">
          <div className="message">
            <strong>Houda:</strong> Hi everyone! Welcome to the {currentChannel.name} channel.
          </div>
          <div className="message">
            <strong>Eesha:</strong> Looking forward to discussing!
          </div>
        </div>
        <div className="chat-input">
          <input type="text" placeholder="Type a message..." />
          <button>Send</button>
        </div>
      </div>

      <div className="profile-section">
        <h3>{currentChannel.name}</h3>
        <p>Description: This is your space to collaborate and discuss all things {currentChannel.name}-related.</p>
        <h4>Members</h4>
        <ul>
          {currentChannel.members?.map((member) => (
            <li key={member.id}>{member.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserDashboard;
