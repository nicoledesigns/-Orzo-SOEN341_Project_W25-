import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserList.css";
import PropTypes from 'prop-types';  // Add this at the top of the file


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

// PropTypes should be defined outside the component for better practice
UserList.propTypes = {
  currentUserId: PropTypes.string.isRequired,
  onUserSelect: PropTypes.func.isRequired,
};

export default UserList;
