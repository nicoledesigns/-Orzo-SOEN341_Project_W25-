import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import Messages from "../Messaging/Public_Chat";
import UserList from "../DirectMessaging/UserList";
import DirectMessaging from "../DirectMessaging/DirectMessaging";

const AdminDashboard = () => {
  const adminName = sessionStorage.getItem("userName") || "Admin";
  const [channels, setChannels] = useState([]);
  const [newChannel, setNewChannel] = useState("");
  const [defaultChannels, setDefaultChannels] = useState([]);
  const [privateChannels, setPrivateChannels] = useState([]); // Add state for private channels

  const [newPrivateChannel, setNewPrivateChannel] = useState(""); // Add state for new private channel


  const [selectedPrivateChannel, setSelectedPrivateChannel] = useState(null); // Add state for selected private channel



  const [selectedChannel, setSelectedChannel] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [requestedChannelIds, setRequestedChannelIds] = useState([]);
  const [adminPrivateChannels, setAdminPrivateChannels] = useState([]);


  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch public channels
    fetch("http://localhost:8081/getChannels")
      .then((response) => response.json())
      .then((data) => {
        const allChannels = Array.isArray(data.channels) ? data.channels : []
        
        setChannels(allChannels); // Store all channels
 // Filter default channels (General, Kitten Room, Gaming Room)
 const defaultChannelNames = ["General", "Kitten Room", "Gaming Room"];
 const filteredDefaultChannels = allChannels.filter((channel) =>
   defaultChannelNames.includes(channel.name)
 );
 setDefaultChannels(filteredDefaultChannels); // Store filtered default channels
       
 // Remove default channels from general channels list
        const remainingChannels = data.channels.filter(
          (channel) => !defaultChannelNames.includes(channel.name)
        );
        setChannels(remainingChannels); // Store only non-default channels in the main list
        const filteredPrivateChannels = allChannels.filter(
        (channel) => channel.is_private === 1
      );
      setPrivateChannels(filteredPrivateChannels);

      })
      .catch((err) => console.error("Error fetching channels:", err));
  
    // Fetch default channels
    fetch("http://localhost:8081/getDefaultChannels")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched default channels:", data);
        setDefaultChannels(Array.isArray(data.channels) ? data.channels : []);
      })
      .catch((err) => console.error("Error fetching default channels:", err));
      
    // Fetch users
    fetch("http://localhost:8081/getUsers")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched users:", data);
        setUsers(Array.isArray(data.users) ? data.users : []);
      })
      .catch((err) => console.error("Error fetching users:", err));
  
    // Fetch private channels
    const loggedInUserId = sessionStorage.getItem("userId");
    if (loggedInUserId) {
      // Fetch requested channels (already exists)
      fetch(`http://localhost:8081/getUserChannelRequests/${loggedInUserId}`)
        .then((res) => res.json())
        .then((data) => {
          const ids = (data.requests || []).map((r) => r.channel_id);
          setRequestedChannelIds(ids);
        });
    

      fetch(`http://localhost:8081/userChannels/${loggedInUserId}`)
        .then((res) => res.json())
        .then((data) => {
          const privateOnes = (data.channels || []).filter((ch) => ch.is_private === 1);
          setAdminPrivateChannels(privateOnes);
        });

        
    }
    

    
  }, []);  

  const handleUserSelection = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleAddUsersToChannel = () => {
    const userId = sessionStorage.getItem("userId");
  
    if (!selectedChannel && !selectedPrivateChannel) {
      alert("Please select a channel first!");
      return;
    }
  
    if (!userId) {
      alert("User not identified. Please log in again.");
      return;
    }
  
    const targetChannel = selectedChannel || selectedPrivateChannel;
    const isPrivate = selectedPrivateChannel !== null;
  
    const url = isPrivate
      ? "http://localhost:8081/addUserToPrivateChannel"
      : "http://localhost:8081/addUserToChannel";
  
    const payload = isPrivate
      ? {
          channelId: targetChannel.id,
          userIds: selectedUsers,
          requestedID: userId,
        }
      : {
          channelId: targetChannel.id,
          userIds: selectedUsers,
        };
  
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert("Users added successfully!");
          refreshAllChannelsAndUpdateSelection(); 
        } else {
          alert("Failed to add users: " + data.error);
        }
      })
      .catch((err) => {
        console.error("Error adding users:", err);
        alert("Something went wrong");
      });
  
    setSelectedUsers([]);
  };
  

  const handleRequestToJoin = (channelId) => {
    const userId = sessionStorage.getItem("userId");
  
    fetch("http://localhost:8081/requestToJoinChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, channelId }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || "Request sent!");
        setRequestedChannelIds((prev) => [...prev, channelId]); 
      })
      .catch((err) => {
        console.error("Join request failed:", err);
        alert("Couldn't send join request");
      });
  };
  
  const refreshAllChannelsAndUpdateSelection = () => {
    fetch("http://localhost:8081/getChannels")
      .then((response) => response.json())
      .then((data) => {
        const allChannels = Array.isArray(data.channels) ? data.channels : [];
        setChannels(allChannels);
  
        const filteredPrivateChannels = allChannels.filter(
          (channel) => channel.is_private === 1
        );
        setPrivateChannels(filteredPrivateChannels);
  
        // 👇 Refresh selectedChannel / selectedPrivateChannel with updated member list
        if (selectedChannel) {
          const updated = allChannels.find((ch) => ch.id === selectedChannel.id);
          if (updated) setSelectedChannel(updated);
        } else if (selectedPrivateChannel) {
          const updated = allChannels.find((ch) => ch.id === selectedPrivateChannel.id);
          if (updated) setSelectedPrivateChannel(updated);
        }
      })
      .catch((err) => console.error("Error refreshing channels:", err));
  };
  
  

  const handleLeaveChannel = () => {
    const userId = sessionStorage.getItem("userId");
    const channel = selectedChannel || selectedPrivateChannel;
  
    if (!userId || !channel) {
      alert("Something went wrong. Try again.");
      return;
    }
  
    fetch("http://localhost:8081/leaveChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, channelId: channel.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || "Left the channel.");
        setSelectedChannel(null);
        setSelectedPrivateChannel(null);
  
        // Refresh memberships
        fetch(`http://localhost:8081/userChannels/${userId}`)
          .then((res) => res.json())
          .then((data) => {
            const privateOnes = (data.channels || []).filter(ch => ch.is_private === 1);
            setAdminPrivateChannels(privateOnes);
          });
  
        // Refresh request list
        fetch(`http://localhost:8081/getUserChannelRequests/${userId}`)
          .then((res) => res.json())
          .then((data) => {
            const ids = (data.requests || []).map((r) => r.channel_id);
            setRequestedChannelIds(ids);
          });
      })
      .catch((err) => {
        console.error("Error leaving channel:", err);
        alert("Failed to leave channel.");
      });
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
  const handleCreateDefaultChannels = async () => {
    try {
      // Make a POST request to the backend to create the default channels
      const response = await fetch("http://localhost:8081/createDefaultChannels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to create default channels");
      }
  
      const data = await response.json();
      console.log("Default channels created:", data);
      alert("Default channels created successfully!");
      
      // Optionally, you could fetch the default channels to update the UI
      fetchDefaultChannels();
    } catch (err) {
      console.error("Error creating default channels:", err);
      alert("Error creating default channels: " + err.message);
    }
  };
  
  // Optional: Fetch the default channels to update the UI after creation
  const fetchDefaultChannels = async () => {
    try {
      const response = await fetch("http://localhost:8081/getDefaultChannels");
      const data = await response.json();
      console.log("Fetched default channels:", data);
      setDefaultChannels(data.channels); // Update state with the fetched channels
    } catch (err) {
      console.error("Error fetching default channels:", err);
    }
  };
  const handleAddUsersToPrivateChannel = () => {
    if (!selectedPrivateChannel) {
      alert("Please select a private channel first!");
      return;
    }
  
    const userId = sessionStorage.getItem("userId");
  
    if (!userId) {
      alert("User not identified. Please log in again.");
      return;
    }
  
    fetch("http://localhost:8081/addUserToPrivateChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: selectedPrivateChannel.id,
        userIds: selectedUsers,
        requestedID: userId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert("Users added to private channel successfully!");
          refreshAllChannelsAndUpdateSelection(); // ✅ REFRESH UI
        } else {
          alert("Failed to add users: " + data.error);
        }
      })
      .catch((err) => console.error("Error adding users to private channel:", err));
  
    setSelectedUsers([]);
  };
  

const handleCreatePrivateChannel = () => {
  if (!newPrivateChannel.trim()) {
    alert("Channel name cannot be empty!");
    return;
  }

  const loggedInUserId = sessionStorage.getItem("userId");

  if (!loggedInUserId) {
    alert("You must be logged in to create a channel!");
    return;
  }

  fetch("http://localhost:8081/createPrivateChannel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newPrivateChannel, userId: loggedInUserId }),


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
      alert("Private Channel added successfully!");
      setNewPrivateChannel("");

      
      fetch(`http://localhost:8081/userChannels/${loggedInUserId}`)
        .then((response) => response.json())
        .then((data) => {
          setPrivateChannels(Array.isArray(data.channels) ? data.channels : []);
        });
    })
    .catch((err) => {
      console.error("Error adding channel:", err);
      alert(err.message || "Something went wrong.");
    });
};


  const handleDeleteMessage = (channelId, userId, message, time) => {
    const requestBody = {
      userId,
      channelId,
      message,
      time,
    };

    fetch("http://localhost:8081/deleteMessage", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
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
    
  //away button
  const setAwayStatus = (userId) => {
    // Optimistically update the frontend first (set the user's status to away)
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, status: "away" } : user
    );
    setUsers(updatedUsers); // Assuming you have a state for users in your component
  
    // Now update the status in the backend
    fetch('/set-away', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.message); // This will log: "User set to away"
      // You can also update any other state or UI elements here if needed
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  // Called when a user is selected from the DM user list
  const handleUserSelect = (userId, userName) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setShowUserList(false);
  };

  const currentChannel = selectedChannel
  ? channels.find((channel) => channel.id === selectedChannel?.id)
  : selectedPrivateChannel
  ? privateChannels.find((channel) => channel.id === selectedPrivateChannel?.id)
  : { name: "", members: [] };

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <h1 className="chathaven-title">ChatHaven</h1>
  
        <h3>Channels</h3>
<ul>
  {channels
    .filter((channel) => channel.is_private === 0)
    .map((channel) => (
      <li
        key={channel.id}
        className={selectedChannel?.id === channel.id ? "active" : ""}
        onClick={() => {
          setSelectedChannel(channel);
          setSelectedPrivateChannel(null);
        }}
      >
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
  {channels
    .filter((channel) => channel.is_private === 1)
    .map((channel) => {
      const isMember = adminPrivateChannels.find((c) => c.id === channel.id);
      const hasRequested = requestedChannelIds.includes(channel.id);

      return (
        <li
          key={channel.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <span>#{channel.name}</span>
          {isMember ? (
            <button onClick={() => setSelectedPrivateChannel(channel)}>Open</button>
          ) : hasRequested ? (
            <span
              style={{
                color: "green",
                fontStyle: "italic",
                fontSize: "0.9em",
                marginLeft: "8px"
              }}
            >
              🔒 Request Pending
            </span>
          ) : (
            <button onClick={() => handleRequestToJoin(channel.id)}>Request to Join</button>
          )}
        </li>
      );
    })}
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
  
        <div className="add-private-channel">
          <input
            type="text"
            placeholder="Add new private channel"
            value={newPrivateChannel}
            onChange={(e) => setNewPrivateChannel(e.target.value)}
          />
          <button onClick={handleCreatePrivateChannel}>Add Private</button>
        </div>
  
        <button onClick={() => setShowUserList(!showUserList)}>
          {showUserList ? "Hide User List" : "Start a Direct Message"}
        </button>
  
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
  
      <div className="chat-section">
        {selectedChannel || selectedPrivateChannel ? (
          <div className="channel-chat-container">
            <div className="channel-chat-header">
  <h2>#{(selectedChannel || selectedPrivateChannel)?.name}</h2>

  {/* Leave button only if the admin is a member of the selected private channel */}
  {selectedPrivateChannel && adminPrivateChannels.find(c => c.id === selectedPrivateChannel.id) && (
    <button
      onClick={handleLeaveChannel}
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
    className="close-button"
    onClick={() => {
      setSelectedChannel(null);
      setSelectedPrivateChannel(null);
    }}
  >
    X
  </button>
</div>

            <Messages
              selectedChannel={selectedChannel || selectedPrivateChannel}
              handleDeleteMessage={handleDeleteMessage}
            />
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
        <h3>{currentChannel.name}</h3>
        <p>
          Description: This is your space to collaborate and discuss all things {currentChannel.name}-related.
        </p>
  
        <h4>Members</h4>
        <ul>
          {currentChannel.members?.map((member, index) => (
            <li key={index}>
              {member} {member === adminName && <span>(Admin)</span>}
            </li>
          ))}
        </ul>
  
        <h4>All Users</h4>
        <ul className="user-list">
          {users.length > 0 ? (
            users.map((user) => (
              <li key={user.id} className="user-item">
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className={`status-indicator ${user.status}`}>
                    {user.status === "online" && "🟢 Online"}
                    {user.status === "away" && "🟡 Away (Inactive)"}
                    {user.status === "offline" && "⚪ Offline"}
                    {user.id.toString() === sessionStorage.getItem("userId") && (
                      <button className="away-btn" onClick={() => setAwayStatus(user.id)}>
                        Set Away
                      </button>
                    )}
                  </span>
                  {user.status === "offline" && (
                    <span className="last-seen">
                      {user.last_seen
                        ? `Last seen: ${new Date(user.last_seen).toLocaleString()}`
                        : "Last seen: Unknown"}
                    </span>
                  )}
                </div>
              </li>
            ))
          ) : (
            <p>No users found</p>
          )}
        </ul>
  
        <h4>Add Users to Channel</h4>
        <div className="user-selection" style={{ maxHeight: "200px", overflowY: "auto" }}>
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