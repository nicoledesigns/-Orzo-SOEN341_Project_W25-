import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
  
    if (!userId) {
      alert("User not logged in!");
      navigate("/");
      return;
    }
  
    fetch(`http://localhost:8081/getUserChannels/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.channels) {
          setChannels(data.channels);
          if (data.channels.length > 0) {
            setSelectedChannel(data.channels[0]); 
          }
        } else {
          console.error("Error fetching user channels:", data.error);
        }
      })
      .catch((err) => console.error("Error fetching user channels:", err));
  }, [navigate]);
  

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const currentChannel = selectedChannel || { name: "No channels available", members: [] };

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
        {channels.length === 0 && <p>No channels available</p>}
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="chat-section">
        {channels.length > 0 ? (
          <>
            <div className="chat-header">
              <h3>#{currentChannel.name}</h3>
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
          </>
        ) : (
          <div className="no-channels">
            <p>No channels available to display. Please contact the admin.</p>
          </div>
        )}
      </div>

      <div className="profile-section">
        {channels.length > 0 ? (
          <>
            <h3>{currentChannel.name}</h3>
            <p>Description: This is your space to collaborate and discuss all things {currentChannel.name}-related.</p>
          </>
        ) : (
          <div className="no-channels">
            <p>No profile information available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
