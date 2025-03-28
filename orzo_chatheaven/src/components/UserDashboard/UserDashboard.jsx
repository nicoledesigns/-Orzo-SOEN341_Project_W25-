import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";
import Messages from "../Messaging/Public_Chat";
import UserList from "../DirectMessaging/UserList";
import DirectMessaging from "../DirectMessaging/DirectMessaging";

const UserDashboard = () => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const navigate = useNavigate();
  const [showUserList, setShowUserList] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [directMessageConversations, setDirectMessageConversations] = useState([]);
  const [defaultChannels, setDefaultChannels] = useState([]);
  const [privateChannels, setPrivateChannels] = useState([]); // Add state for private channels
  const [newPrivateChannel, setNewPrivateChannel] = useState(""); // Add state for new private channel
  const [selectedPrivateChannel, setSelectedPrivateChannel] = useState(null); // Add state for selected private channel

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      alert("User not logged in!");
      navigate("/");
      return;
    }
    //before (channel are visible)
/**     fetch(http://localhost:8081/getUserChannels/${userId})
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

    fetchDirectMessageConversations(userId);
  }, [navigate]);
   */

  /** Fetch user channels, including private ones */
fetch(`http://localhost:8081/getUserChannels/${userId}`)
.then((response) => response.json())
.then((data) => {
  if (data.channels) {
    console.log("Fetched user channels:", data.channels);
    
    // Store all channels
    setChannels(data.channels);

    // Separate public and private channels
    setPrivateChannels(data.channels.filter((channel) => channel.type === "private"));

    // Select the first available channel by default
    if (data.channels.length > 0) {
      setSelectedChannel(data.channels[0]);
    }
  } else {
    console.error("Error fetching user channels:", data.error);
  }
})
.catch((err) => console.error("Error fetching user channels:", err));

// Fetch direct messages separately
fetchDirectMessageConversations(userId);
  }, [navigate]);

  const fetchDirectMessageConversations = (userId) => {
    fetch("http://localhost:8081/getUsers")
      .then((response) => response.json())
      .then((data) => {
        const filteredUsers = data.users.filter(
          (user) => user.id !== parseInt(userId, 10)
        );
        setDirectMessageConversations(filteredUsers);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  };

  const handleLogout = async () => {
    const userId = sessionStorage.getItem("userId");
  
    if (!userId) {
      sessionStorage.clear();
      navigate("/");
      return;
    }
  
    try {
      await fetch("http://localhost:8081/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
  
      sessionStorage.clear();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const handleCreatePrivateChannel = () => {
    const userId = sessionStorage.getItem("userId");
    if (!newPrivateChannel.trim()) return;
  
    fetch("http://localhost:8081/createPrivateChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newPrivateChannel,
        creatorId: userId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setPrivateChannels([...privateChannels, data.channel]);
          setNewPrivateChannel("");
        } else {
          console.error("Error creating private channel:", data.error);
        }
      })
      .catch((error) => console.error("Error creating private channel:", error));
  };
  
  const handleUserSelect = (userId, userName) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setShowUserList(false);
  }; 

  const currentChannel =
    selectedChannel || { name: "No channels available", members: [] };

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
        <h3>Private Channels</h3>
<ul>
  {privateChannels.map((channel) => (
    <li
      key={channel.id}
      className={selectedPrivateChannel?.id === channel.id ? "active" : ""}
      onClick={() => setSelectedPrivateChannel(channel)}
    >
      🔒 {channel.name}
    </li>
  ))}
</ul>
<input
          type="text"
          placeholder="New Private Channel"
          value={newPrivateChannel}
          onChange={(e) => setNewPrivateChannel(e.target.value)}
        />
        <button onClick={handleCreatePrivateChannel}>Create Private Channel</button>
<h3>Default Channels</h3>
<ul>
  {defaultChannels.map((channel) => (
    <li
      key={channel.id}
      className={selectedChannel?.id === channel.id ? "active" : ""}
      onClick={() => setSelectedChannel(channel)}
    >
      #{channel.name}
    </li>
  ))}
</ul>
        <h3>Direct Messages</h3>
        <ul>
  {directMessageConversations.map((user) => (
    <li
      key={user.id}
      className={selectedUserId === user.id ? "active" : ""}
      onClick={() => handleUserSelect(user.id, user.name)}
    >
      <div className="user-info">
        <span className="user-name">{user.name}</span>
        <span className={`status-indicator ${user.status}`}>
          {user.status === "online" ? "🟢 Online" :
          user.status === "away" ? "🟡 Away" :
          "⚪ Offline"}
        </span>
        {user.status === "offline" && (
          <span className="last-seen">
          {user.status === "offline" && user.last_seen
            ? `Last seen: ${new Date(user.last_seen).toLocaleString()}`
            : "Last seen: Unknown"}
        </span>
        
        )}
      </div>
    </li>
  ))}
</ul>

        <button onClick={() => setShowUserList(!showUserList)}>
          {showUserList ? "Hide User List" : "Start a Direct Message"}
        </button>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="chat-section">
        {selectedChannel ? (
          <div className="channel-chat-container">
            <div className="channel-chat-header">
              <h2>#{selectedChannel.name}</h2>
              <button
                className="close-button"
                onClick={() => setSelectedChannel(null)}
              >
                X
              </button>
            </div>
            <Messages selectedChannel={selectedChannel} />
          </div>
        ) : (
          <p>Please select a channel to view messages.</p>
        )}

        {showUserList && (
          <UserList
            currentUserId={sessionStorage.getItem("userId")}
            onUserSelect={handleUserSelect}
          />
        )}

        {selectedUserId && (
          <DirectMessaging
            currentUserId={sessionStorage.getItem("userId")}
            receiverId={selectedUserId}
            receiverName={selectedUserName}
            onClose={() => {
              setSelectedUserId(null);
              setSelectedUserName("");
            }}
          />
        )}
      </div>

      <div className="profile-section">
        {channels.length > 0 ? (
          <>
            <h3>{currentChannel.name}</h3>
            <p>
              Description: This is your space to collaborate and discuss all
              things {currentChannel.name}-related.
            </p>
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
