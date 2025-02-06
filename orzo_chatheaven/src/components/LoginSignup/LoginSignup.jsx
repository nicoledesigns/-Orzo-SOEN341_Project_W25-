import React, { use, useState } from 'react'
import './LoginSignup.css'
import user_icon from '../Assets/person.png'
import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'
import axios from "axios"


const LoginSignup = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [action, setAction] = useState('SignUp');

    const handleSignUp = (event) => {
        event.preventDefault(); // Prevent page refresh
        axios.post("http://localhost:8081/signup", { name, email, password })
          .then(res => console.log("Signup Response:", res.data))
          .catch(err => console.error("Signup Error:", err));
          console.log("pipicaca")
      };
    function handleLogin(event){
        event.preventDefault(); 
        axios.post('http://localhost:8081/login', {email, password})
        .then (res => console.log(res))
        .catch(err => console.log(err)); 
        console.log("shit")
    }
  return (
    <div className='container'>
        <div className="bubbles">
      <span style={{ "--i":11}}></span>
      <span style={{ "--i":12 }}></span>
      <span style={{ "--i":24 }}></span>
      <span style={{ "--i":10 }}></span>
      <span style={{ "--i":14 }}></span>
      <span style={{ "--i":23 }}></span>
      <span style={{ "--i":18 }}></span>
      <span style={{ "--i":16 }}></span>
      <span style={{ "--i":19 }}></span>
      <span style={{ "--i":20 }}></span>
      <span style={{ "--i":22 }}></span>
      <span style={{ "--i":25 }}></span>
      <span style={{ "--i":18 }}></span>
      <span style={{ "--i":21 }}></span>
      <span style={{ "--i":15 }}></span>
      <span style={{ "--i":13 }}></span>
      <span style={{ "--i":26 }}></span>
      <span style={{ "--i":17 }}></span>
      <span style={{ "--i":13 }}></span>
      <span style={{ "--i":28 }}></span>
      <span style={{ "--i":11}}></span>
      <span style={{ "--i":12 }}></span>
      <span style={{ "--i":24 }}></span>
      <span style={{ "--i":10 }}></span>
      <span style={{ "--i":14 }}></span>
      <span style={{ "--i":23 }}></span>
      <span style={{ "--i":18 }}></span>
      <span style={{ "--i":16 }}></span>
      <span style={{ "--i":19 }}></span>
      <span style={{ "--i":20 }}></span>
      <span style={{ "--i":22 }}></span>
      <span style={{ "--i":25 }}></span>
      <span style={{ "--i":18 }}></span>
      <span style={{ "--i":21 }}></span>
      <span style={{ "--i":15 }}></span>
      <span style={{ "--i":13 }}></span>
      <span style={{ "--i":26 }}></span>
      <span style={{ "--i":17 }}></span>
      <span style={{ "--i":13 }}></span>
      <span style={{ "--i":28 }}></span>
    </div>
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
        <div className='inputs'>
            {action==="Login"?<div></div>:
            <div className='input'>
            <img src={user_icon} alt=""/>
            <input type='text'placeholder='Name'onChange={e => setName(e.target.value)}/>
            </div>
            }
            <div className='input'>
                <img src={email_icon} alt=""/>
                <input type='email'placeholder='E-mail' onChange={e => setEmail(e.target.value)}/>
            </div>
            <div className='input'>
                <img src={password_icon} alt=""/>
                <input type='password' placeholder='Password' onChange={e => setPassword(e.target.value)}/>
            </div>

            {action==="Sign Up"?<div></div>:
            <div className="forgot-password">Lost Password? <span>Click Here!</span></div>
            }

            <div className='submit-container'>
                <div className={action==="Login"?"submit gray":"submit"} onClick={()=>{setAction("Sign Up")}}>Sign Up</div>
                <div className={action==="Sign Up"?"submit gray":"submit"} onClick={()=>{setAction("Login")}}>Login</div>
                
                <button className="submit"
                    onClick={action === "Sign Up" ? handleSignUp : handleLogin}>
                        submit
                    
                </button>

            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;