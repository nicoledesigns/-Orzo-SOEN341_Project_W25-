import React, { useState } from 'react';
import './LoginSignup.css';
import user_icon from '../Assets/person.png';
import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';

const LoginSignup = () => {
  const [action, setAction] = useState('Sign Up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = () => {
    // Validate email format
    if (!name || !email || !password) {
      alert('Please fill out all fields');
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email (e.g., example123@gmail.com)');
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
    } else if (!role) {
      alert('Please select a role');
    } else {
      setPasswordError('');
      setEmailError('');
      alert(`Form submitted as ${role}`);
    }
  };

  const isValidEmail = (email) => {
    // Regular expression for email validation
    const regex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
  };

  return (
    <div className='container'>
      <div className='header'>
        <div className='text'>{action}</div>
        <div className='underline'></div>
      </div>
      <div className='inputs'>
        {action === 'Login' ? (
          <div></div>
        ) : (
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
            onChange={(e) => setEmail(e.target.value)}
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

        {/* Role Selection */}
        {action === 'Sign Up' && (
          <div className='role-selection'>
            <label>
              <input
                type='checkbox'
                checked={role === 'Admin'}
                onChange={() => handleRoleChange('Admin')}
              />
              Admin
            </label>
            <label>
              <input
                type='checkbox'
                checked={role === 'User'}
                onChange={() => handleRoleChange('User')}
              />
              User
            </label>
          </div>
        )}

        {/* Display Password Error */}
        {passwordError && <div className='error-message'>{passwordError}</div>}

        {action === 'Sign Up' ? (
          <div></div>
        ) : (
          <div className='forgot-password'>
            Lost Password? <span>Click Here!</span>
          </div>
        )}

        {/* Submit Button */}
        <div className='submit-btn' onClick={handleSubmit}>
          Submit
        </div>

        <div className='submit-container'>
          <div
            className={action === 'Login' ? 'submit gray' : 'submit'}
            onClick={() => {
              setAction('Sign Up');
            }}
          >
            Sign Up
          </div>
          <div
            className={action === 'Sign Up' ? 'submit gray' : 'submit'}
            onClick={() => {
              setAction('Login');
            }}
          >
            Login
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;