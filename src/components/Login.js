import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import "../assets/styles/sign.css"
//import SignUpPage from "./SignUpPage";

const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // התחברות עם Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // אם ההתחברות הצליחה, נציג הודעה למשתמש

      setSuccess(`Welcome, ${user.email}`);
      setError('');
    } catch (error) {
      setError('Failed to login: ' + error.message);
      setSuccess('');
    }
  };

  return (
    <div className="login-page">
      <section className="container">
        <div className="login-container">
          <div className="form-container">
            <h1 className="opacity">LOGIN</h1>
            <form>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
                     required/>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                     placeholder="Password" required/>
              <button className="opacity" onClick={handleLogin}>SUBMIT</button>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {success && <p style={{ color: 'green' }}>{success}</p>}
            </form>
            <div className="register-forget opacity">
              <a href="#">REGISTER</a>
              <a href="#">FORGOT PASSWORD</a>
            </div>
            {/*<div className="signinGoogle">*/}
            {/*  <button className="opacity">Login with Google</button>*/}
            {/*</div>*/}

          </div>
        </div>

      </section>
    </div>
  );
};

export default Login;
