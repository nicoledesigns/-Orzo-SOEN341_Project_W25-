import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import Messages from "../Messaging/Public_Chat";

const AdminDashboard = () => {
  const adminName = sessionStorage.getItem("userName") || "Admin";
  const [channels, setChannels] = useState([]);
  const [newChannel, setNewChannel] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8081/getChannels")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched channels:", data);
        setChannels(Array.isArray(data.channels) ? data.channels : []);
      })
      .catch((err) => console.error("Error fetching channels:", err));

    fetch("http://localhost:8081/getUsers")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched users:", data);
        setUsers(Array.isArray(data.users) ? data.users : []);
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const handleUserSelection = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleAddUsersToChannel = () => {
    if (!selectedChannel) {
      alert("Please select a channel first!");
      return;
    }

    fetch("http://localhost:8081/addUserToChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: selectedChannel.id,
        userIds: selectedUsers,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert("Users added successfully!");
          fetch("http://localhost:8081/getChannels")
            .then((response) => response.json())
            .then((data) =>
              setChannels(Array.isArray(data.channels) ? data.channels : [])
            );
        } else {
          alert("Failed to add users: " + data.error);
        }
      })
      .catch((err) => console.error("Error adding users:", err));

    setSelectedUsers([]);
  };

  const handleAddChannel = () => {
    if (newChannel.trim() === "") {
      alert("Channel name cannot be empty!");
      return;
    }

    fetch("http://localhost:8081/addChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newChannel }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.error || "Failed to add channel");
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Add channel response:", data);
        if (data.message) {
          alert("Channel added successfully!");
          setChannels([
            ...channels,
            { id: data.channelId, name: newChannel, members: [] },
          ]);
          setNewChannel("");
        }
      })
      .catch((err) => {
        console.error("Error adding channel:", err);
        alert(err.message || "Something went wrong.");
      });
  };
//Nicole: Delete message option for Admins
const handleDeleteMessage = (channelId, userId, message, time) => {
  console.log("Logged in user ID: ", userId); // Log the user ID

  // Prepare the request body
  const requestBody = {
    userId,    // Pass the userId as part of the body
    channelId, // Pass the channelId as part of the body
    message,   // Pass the message to delete as part of the body
    time       // Pass the time of the message to delete as part of the body
  };

  fetch("http://localhost:8081/deleteMessage", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)  // Send the data as JSON in the body
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        alert("Message deleted successfully!");
      } else {
        alert("Failed to delete message: " + (data.error || "Unknown error"));
      }
    })
    .catch((err) => {
      console.error("Error deleting message:", err);
      alert("Something went wrong");
    });
};



  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const currentChannel =
    channels.find((channel) => channel.id === selectedChannel?.id) || {
      name: "",
      members: [],
    };

  return (
    <div className="admin-dashboard">
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
        <div className="add-channel">
          <input
            type="text"
            placeholder="Add new channel"
            value={newChannel}
            onChange={(e) => setNewChannel(e.target.value)}
          />
          <button onClick={handleAddChannel}>Add</button>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="chat-section">
        {selectedChannel ? (
          <Messages selectedChannel={selectedChannel} handleDeleteMessage={handleDeleteMessage} />
        ) : (
          <p>Please select a channel to view messages.</p>
        )}
      </div>

      <div className="profile-section">
        <h3>{currentChannel.name}</h3>
        <p>
          Description: This is your space to collaborate and discuss all things{" "}
          {currentChannel.name}-related.
        </p>
        <h4>Members</h4>
        <ul>
          {currentChannel.members?.map((member, index) => (
            <li key={index}>
              {member} {member === adminName && <span>(Admin)</span>}
            </li>
          ))}
        </ul>
        <h4>Add Users to Channel</h4>
        <div className="user-selection">
          {users.map((user) => (
            <div key={user.id} className="user-checkbox">
              <input
                type="checkbox"
                id={`user-${user.id}`}
                checked={selectedUsers.includes(user.id)}
                onChange={() => handleUserSelection(user.id)}
              />
              <label htmlFor={`user-${user.id}`}>{user.name}</label>
            </div>
          ))}
        </div>
        <button onClick={handleAddUsersToChannel}>Add Selected Users</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
