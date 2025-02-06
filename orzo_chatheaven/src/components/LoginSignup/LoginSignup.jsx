import React, { useState } from 'react';
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
    const [emailError, setEmailError] = useState(''); // Fixed emailError state

    const handleSignUp = (event) => {
        event.preventDefault(); // Prevent page refresh
        axios.post("http://localhost:8081/signup", { name, email, password })
            .then(res => console.log("Signup Response:", res.data))
            .catch(err => console.error("Signup Error:", err));
    };

    const handleLogin = (event) => {
        event.preventDefault(); 
        axios.post('http://localhost:8081/login', { email, password })
            .then(res => console.log("Login Response:", res.data))
            .catch(err => console.log("Login Error:", err));
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
                    {/* Display Email Error */}
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
