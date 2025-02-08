import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const adminName = sessionStorage.getItem("userName") || "Admin";
  const [channels, setChannels] = useState([
    { name: "General", members: [adminName, "Bob", "Alice", "Eesha"] },
    { name: "Developer Team", members: [adminName, "Bob", "Alice"] },
    { name: "Tester Team", members: [adminName, "Eesha"] },
    { name: "Design Team", members: [adminName, "Alice"] },
  ]);
  const [newChannel, setNewChannel] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("General");
  const [users, setUsers] = useState(["Bob", "Alice", "Eesha", "Nicole", "Karan"]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const currentChannel = channels.find((channel) => channel.name === selectedChannel);

  const navigate = useNavigate(); 

  const handleUserSelection = (user) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(selectedUsers.filter((u) => u !== user));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleAddUsersToChannel = () => {
    const updatedChannels = channels.map((channel) => {
      if (channel.name === selectedChannel) {
        return {
          ...channel,
          members: [...new Set([...channel.members, ...selectedUsers])],
        };
      }
      return channel;
    });
    setChannels(updatedChannels);
    setSelectedUsers([]);
  };

  const handleAddChannel = () => {
    if (newChannel.trim() !== "") {
      setChannels([...channels, { name: newChannel.trim(), members: [adminName] }]);
      setNewChannel("");
    } else {
      alert("Channel name cannot be empty!");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear(); 
    navigate("/"); 
  };

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <h1 className="chathaven-title">ChatHaven</h1>
        <h3>Channels</h3>
        <ul>
          {channels.map((channel, index) => (
            <li
              key={index}
              className={selectedChannel === channel.name ? "active" : ""}
              onClick={() => setSelectedChannel(channel.name)}
            >
              #{channel.name}
            </li>
          ))}
        </ul>
        <div className="add-channel">
          <input
            type="text"
            placeholder="Add new channel"
            value={newChannel}
            onChange={(e) => setNewChannel(e.target.value)}
          />
          <button onClick={handleAddChannel}>Add</button>
        </div>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>


      <div className="chat-section">
        <div className="chat-header">
          <h3>#{selectedChannel}</h3>
          <p>{currentChannel.members.length} Members</p>
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
        {currentChannel.members.map((member, index) => (
        <li key={index}>
        {member} {member === adminName && <span>(Admin)</span>}
        </li>
        ))}
        </ul>
        <h4>Add Users to Channel</h4>
        <div className="user-selection">
          {users.map((user, index) => (
            <div key={index} className="user-checkbox">
              <input
                type="checkbox"
                id={user}
                checked={selectedUsers.includes(user)}
                onChange={() => handleUserSelection(user)}
              />
              <label htmlFor={user}>{user}</label>
            </div>
          ))}
        </div>
        <button onClick={handleAddUsersToChannel}>Add Selected Users</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
