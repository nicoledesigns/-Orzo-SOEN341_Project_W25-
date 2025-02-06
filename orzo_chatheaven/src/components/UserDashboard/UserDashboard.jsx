import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./UserDashboard.css";

const UserDashboard = () => {
  const [channels] = useState(["General", "Developer Team", "Tester Team", "Design Team"]);
  const [selectedChannel, setSelectedChannel] = useState("General");

  const navigate = useNavigate(); 

  const handleLogout = () => {
    sessionStorage.clear(); 
    navigate("/"); 
  };

  return (
    <div className="user-dashboard">
      <div className="sidebar">
        <h1 className="chathaven-title">ChatHaven</h1>
        <h3>Channels</h3>
        <ul>
          {channels.map((channel, index) => (
            <li
              key={index}
              className={selectedChannel === channel ? "active" : ""}
              onClick={() => setSelectedChannel(channel)}
            >
              #{channel}
            </li>
          ))}
        </ul>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>


      <div className="chat-section">
        <div className="chat-header">
          <h3>#{selectedChannel}</h3>
          <p>15 Members</p>
        </div>
        <div className="chat-messages">
          <div className="message">
            <strong>Houda:</strong> Hi everyone! Welcome to the {selectedChannel} channel.
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
        <h3>{selectedChannel}</h3>
        <p>Description: This is your space to collaborate and discuss all things {selectedChannel}-related.</p>
        <h4>Members</h4>
        <ul>
          <li>Houda</li>
          <li>Eesha</li>
          <li>Edwin</li>
          <li>Yassine</li>
          <li>Nicole</li>
          <li>Karan</li>
        </ul>
      </div>
    </div>
  );
};

export default UserDashboard;
