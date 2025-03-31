// UserDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";
import Messages from "../Messaging/Public_Chat";
import UserList from "../DirectMessaging/UserList";
import DirectMessaging from "../DirectMessaging/DirectMessaging";

const UserDashboard = () => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [privateChannels, setPrivateChannels] = useState([]);
  const [userPrivateChannels, setUserPrivateChannels] = useState([]);
  const [requestedChannelIds, setRequestedChannelIds] = useState([]);
  const [newPrivateChannel, setNewPrivateChannel] = useState("");
  const [selectedPrivateChannel, setSelectedPrivateChannel] = useState(null);
  const [defaultChannels, setDefaultChannels] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [directMessageConversations, setDirectMessageConversations] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      alert("User not logged in!");
      navigate("/");
      return;
    }

    fetch("http://localhost:8081/getChannels")
      .then((res) => res.json())
      .then((data) => {
        const all = data.channels || [];
        setChannels(all.filter((c) => c.is_private === 0));
        // Filter default channels
const defaultChannelNames = ["General", "Kitten Room", "Gaming Room"];
const filteredDefaultChannels = data.channels.filter((channel) =>
  defaultChannelNames.includes(channel.name)
);
setDefaultChannels(filteredDefaultChannels); // Store filtered default channels

    // Remove default channels from general channels list
    const remainingChannels = data.channels.filter(
      (channel) => !defaultChannelNames.includes(channel.name)
    );
    setChannels(remainingChannels); // Store only non-default channels in the main list

        setPrivateChannels(all.filter((c) => c.is_private === 1));
      });

    fetch(`http://localhost:8081/userChannels/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const privateOnes = (data.channels || []).filter((ch) => ch.is_private === 1);
        setUserPrivateChannels(privateOnes);
      });

    fetch(`http://localhost:8081/getUserChannelRequests/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const ids = (data.requests || []).map((r) => r.channel_id);
        setRequestedChannelIds(ids);
      });

    fetch("http://localhost:8081/getUsers")
      .then((res) => res.json())
      .then((data) => {
        const filtered = (data.users || []).filter((u) => u.id !== parseInt(userId));
        setUsers(data.users || []);
        setDirectMessageConversations(filtered);
      });
  }, [navigate, userId]);

  const setAwayStatus = (userId) => {
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, status: "away" } : u
    );
    setUsers(updatedUsers);

    fetch("/set-away", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then((res) => res.json())
      .then((data) => console.log(data.message))
      .catch((err) => console.error("Error setting away:", err));
  };

  const handleLeaveChannel = (channelId) => {
    fetch("http://localhost:8081/leaveChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, channelId }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || "You left the channel.");
        setUserPrivateChannels(prev => prev.filter(c => c.id !== channelId));
        setSelectedPrivateChannel(null);
      })
      .catch((err) => {
        console.error("Error leaving channel:", err);
        alert("Failed to leave channel.");
      });
  };
  

  const handleCreatePrivateChannel = () => {
    if (!newPrivateChannel.trim()) return;

    fetch("http://localhost:8081/createPrivateChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPrivateChannel, userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        setNewPrivateChannel("");
        setUserPrivateChannels((prev) => [...prev, { id: data.channelId, name: newPrivateChannel }]);
      });
  };

  const handleRequestToJoin = (channelId) => {
    fetch("http://localhost:8081/requestToJoinChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, channelId }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || "Request sent!");
        setRequestedChannelIds((prev) => [...prev, channelId]);
      });
  };

  const handleUserSelect = (id, name) => {
    setSelectedUserId(id);
    setSelectedUserName(name);
    setShowUserList(false);
  };

  const handleAddUsersToChannel = () => {
    if (!selectedPrivateChannel || selectedUsers.length === 0) return;

    fetch("http://localhost:8081/addUserToPrivateChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: selectedPrivateChannel.id,
        userIds: selectedUsers,
        requestedID: userId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || data.error);
        setSelectedUsers([]);
      });
  };

  const handleLogout = async () => {
    await fetch("http://localhost:8081/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    sessionStorage.clear();
    navigate("/");
  };

  const currentChannel = selectedChannel || selectedPrivateChannel || { name: "No channels", members: [] };

  return (
    <div className="user-dashboard">
      <div className="sidebar">
        <h1 className="chathaven-title">ChatHaven</h1>
        <h3>Public Channels</h3>
        <ul>
          {channels.map((channel) => (
            <li key={channel.id} onClick={() => {
              setSelectedChannel(channel);
              setSelectedPrivateChannel(null);
            }}>
              #{channel.name}
            </li>
          ))}
        </ul>
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
        <h3>Private Channels</h3>
<ul>
  {privateChannels.map((channel) => {
    const isMember = userPrivateChannels.find((c) => c.id === channel.id);
    const hasRequested = requestedChannelIds.includes(channel.id);

    return (
      <li
        key={channel.id}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px"
        }}
      >
        <span style={{ display: "flex", alignItems: "center" }}>
          🔒 <span style={{ marginLeft: "6px", fontWeight: "500" }}>#{channel.name}</span>
          {!isMember && hasRequested && (
            <span
              style={{
                color: "green",
                fontStyle: "italic",
                fontSize: "0.85em", // 👈 smaller font
                marginLeft: "8px"
              }}
            >
              Request Pending
            </span>
          )}
        </span>

        {isMember ? (
          <button onClick={() => {
            setSelectedPrivateChannel(channel);
            setSelectedChannel(null);
          }}>
            Open
          </button>
        ) : !hasRequested ? (
          <button onClick={() => handleRequestToJoin(channel.id)}>
            Request to Join
          </button>
        ) : null}
      </li>
    );
  })}
</ul>




        <input
          type="text"
          placeholder="New Private Channel"
          value={newPrivateChannel}
          onChange={(e) => setNewPrivateChannel(e.target.value)}
        />
        <button onClick={handleCreatePrivateChannel}>Create Private Channel</button>

        <h3>Direct Messages</h3>
        <ul>
          {directMessageConversations.map((user) => (
            <li key={user.id} onClick={() => handleUserSelect(user.id, user.name)}>
              {user.name}
            </li>
          ))}
        </ul>
        <button onClick={() => setShowUserList(!showUserList)}>
          {showUserList ? "Hide User List" : "Start a Direct Message"}
        </button>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>

      <div className="chat-section">
        {selectedChannel || selectedPrivateChannel ? (
          <div className="channel-chat-container">
           <div className="channel-chat-header">
  <h2>#{currentChannel.name}</h2>

  {/* Show Leave button if it's a private channel and the user is a member */}
  {selectedPrivateChannel && userPrivateChannels.find(c => c.id === selectedPrivateChannel.id) && (
    <button
      onClick={() => handleLeaveChannel(selectedPrivateChannel.id)}
      style={{
        marginLeft: "10px",
        backgroundColor: "#f44336",
        color: "white",
        border: "none",
        padding: "6px 10px",
        borderRadius: "5px",
        cursor: "pointer"
      }}
    >
      Leave Channel
    </button>
  )}

  <button
    onClick={() => {
      setSelectedChannel(null);
      setSelectedPrivateChannel(null);
    }}
    style={{
      marginLeft: "10px",
      backgroundColor: "#999",
      color: "white",
      border: "none",
      padding: "6px 10px",
      borderRadius: "5px",
      cursor: "pointer"
    }}
  >
    X
  </button>
</div>

            <Messages selectedChannel={currentChannel} />
          </div>
        ) : (
          <p>Please select a channel to view messages.</p>
        )}

        {showUserList && (
          <UserList
            currentUserId={userId}
            onUserSelect={handleUserSelect}
          />
        )}

        {selectedUserId && (
          <DirectMessaging
            currentUserId={userId}
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
        <h3>{currentChannel.name}</h3>
        <p>This is your space to collaborate and discuss all things related to {currentChannel.name}.</p>

        {currentChannel.members?.length > 0 && (
          <>
            <h4>Members</h4>
            <ul>
              {currentChannel.members.map((member, index) => (
                <li key={index}>{member}</li>
              ))}
            </ul>
          </>
        )}

        <h4>All Users</h4>
        <ul className="user-list">
          {users.map((user) => (
            <li key={user.id} className="user-item">
              <div className="user-info">
                <strong>{user.name}</strong>
                <span className={`status-indicator ${user.status}`}>
                  {user.status === "online" && "🟢 Online"}
                  {user.status === "away" && "🟡 Away"}
                  {user.status === "offline" && "⚪ Offline"}
                  {user.id.toString() === userId && (
                    <button className="away-btn" onClick={() => setAwayStatus(user.id)}>
                      Set Away
                    </button>
                  )}
                </span>
                {user.status === "offline" && (
                  <span className="last-seen">
                    Last seen: {user.last_seen ? new Date(user.last_seen).toLocaleString() : "Unknown"}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        {selectedPrivateChannel && (
          <>
            <h4>Add Users to Channel</h4>
            <div className="user-selection" style={{ maxHeight: "200px", overflowY: "auto" }}>
              {users.map((user) => (
                <div key={user.id} className="user-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() =>
                      setSelectedUsers((prev) =>
                        prev.includes(user.id)
                          ? prev.filter((id) => id !== user.id)
                          : [...prev, user.id]
                      )
                    }
                  />
                  <label>{user.name}</label>
                </div>
              ))}
            </div>
            <button onClick={handleAddUsersToChannel}>Add Selected Users</button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
