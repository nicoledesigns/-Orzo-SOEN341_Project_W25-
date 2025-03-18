import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserList.css";

const UserList = ({ currentUserId, onUserSelect }) => {
  const [users, setUsers] = useState([]);

  // Fetch all users (except the current user)
  useEffect(() => {
    axios
      .get("http://localhost:8081/getUsers")
      .then((response) => {
        const filteredUsers = response.data.users.filter(
          (user) => String(user.id) !== String(currentUserId)
        );
        setUsers(filteredUsers);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, [currentUserId]);

  return (
    <div className="user-list">
      <h3>Select a user to message:</h3>
      <ul>
        {users.map((user) => (
          <li
            key={user.id}
            onClick={() => onUserSelect(user.id, user.name)}
          >
            {user.name} {user.role === "admin" ? "(Admin)" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
