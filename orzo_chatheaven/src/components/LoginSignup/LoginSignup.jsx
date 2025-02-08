import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './LoginSignup.css';
import user_icon from '../Assets/person.png';
import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';
import axios from 'axios';

const LoginSignup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [action, setAction] = useState('SignUp');
    const [role, setRole] = useState('user'); 
    const [emailError, setEmailError] = useState('');
    
    const navigate = useNavigate(); 

    // Handle Signup
    const handleSignUp = (event) => {
        event.preventDefault();
        axios.post("http://localhost:8081/signup", { name, email, password, role })
            .then(res => {
                console.log("Signup Response:", res.data);
                alert("Signup successful! Please log in.");
                setAction("Login");
            })
            .catch(err => console.error("Signup Error:", err));
    };

    // Handle Login
    const handleLogin = (event) => {
      event.preventDefault();
      axios.post('http://localhost:8081/login', { email, password })
          .then(res => {
              console.log("Login Response:", res.data);
              
              const userRole = res.data.user.role; 
              const userName = res.data.user.name;

              sessionStorage.setItem("userName", userName);
              sessionStorage.setItem("userRole", userRole);
  
              
              if (userRole === "admin") {
                  navigate('/admin-dashboard');
              } else if (userRole === "user") {
                  navigate('/user-dashboard');
              } else {
                  alert("Unknown role. Cannot redirect.");
              }
          })
          .catch(err => {
              console.log("Login Error:", err.response?.data || err);
              alert(err.response?.data?.error || "Invalid credentials. Please try again.");
          });
  };

    return (
        <div className='container'>
            <div className="bubbles">
                {Array.from({ length: 40 }).map((_, index) => (
                    <span key={index} style={{ "--i": (10 + (index % 19)) }}></span>
                ))}
            </div>
            <div className='header'>
                <div className='text'>{action}</div>
                <div className='underline'></div>
            </div>
            <div className='inputs'>
                {action === 'Login' ? null : (
                    <div className='input'>
                        <img src={user_icon} alt='' />
                        <input
                            type='text'
                            placeholder='Name'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                )}
                <div className='input'>
                    <img src={email_icon} alt='' />
                    <input
                        type='email'
                        placeholder='E-mail'
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (!e.target.value.includes('@')) {
                                setEmailError('Invalid email format');
                            } else {
                                setEmailError('');
                            }
                        }}
                    />
                    {emailError && <div className='error-message'>{emailError}</div>}
                </div>
                <div className='input'>
                    <img src={password_icon} alt='' />
                    <input
                        type='password'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

            
                <div className='input'>
                    <label>Role:</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                {action === "Sign Up" ? null : (
                    <div className="forgot-password">Lost Password? <span>Click Here!</span></div>
                )}

                <div className='submit-container'>
                    <div className={action === "Login" ? "submit gray" : "submit"} onClick={() => setAction("Sign Up")}>Sign Up</div>
                    <div className={action === "Sign Up" ? "submit gray" : "submit"} onClick={() => setAction("Login")}>Login</div>

                    <button className="submit"
                        onClick={action === "Sign Up" ? handleSignUp : handleLogin}>
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginSignup;
