import React, { useState } from "react";
import axios from "axios";
import "./LoginSignup.css";
import user_icon from "../Assets/person.png";
import email_icon from "../Assets/email.png";
import password_icon from "../Assets/password.png";

const LoginSignup = () => {
  const [action, setAction] = useState("Sign Up");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async () => {
    const endpoint = action === "Sign Up" ? "/signup" : "/login";
    
    try {
      const response = await axios.post(`http://localhost:3001${endpoint}`, formData);
      alert(response.data.message); // Show success message

      if (action === "Login") {
        localStorage.setItem("token", response.data.token); // Store token in localStorage
      }
    } catch (error) {
      alert(error.response?.data?.message || "An error occurred.");
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        {action === "Login" ? null : (
          <div className="input">
            <img src={user_icon} alt="" />
            <input type="text" name="name" placeholder="Name" onChange={handleChange} />
          </div>
        )}
        <div className="input">
          <img src={email_icon} alt="" />
          <input type="email" name="email" placeholder="E-mail" onChange={handleChange} />
        </div>
        <div className="input">
          <img src={password_icon} alt="" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} />
        </div>

        {action === "Sign Up" ? null : (
          <div className="forgot-password">
            Lost Password? <span>Click Here!</span>
          </div>
        )}

        <div className="submit-container">
          <div className={action === "Login" ? "submit gray" : "submit"} onClick={() => setAction("Sign Up")}>
            Sign Up
          </div>
          <div className={action === "Sign Up" ? "submit gray" : "submit"} onClick={() => setAction("Login")}>
            Login
          </div>
          <div className="submit" onClick={handleSubmit}>
            Submit
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
