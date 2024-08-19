// src/pages/Login/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // בדוק את מצב האימות של המשתמש
      const userDoc = await getDoc(doc(db, 'Users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (!userData.isVerified) {
          setError('יש להמתין לאישור המערכת לפני התחברות.');
          await auth.signOut(); // התנתקות מהמשתמש הלא מאושר
          return;
        }
      }

      setError('');
      navigate(`/feed`)
      //navigate(`/profile/${user.uid}`);
    } catch (error) {
      setError('Failed to login: ' + error.message);
    }
  };

  return (
      <div className="login-page">
        <section className="container">
          <div className="login-container">
            <div className="form-container">
              <h1 className="opacity">LOGIN</h1>
              <form onSubmit={handleLogin}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button className="opacity" type="submit">SUBMIT</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
              </form>
              <div className="register-forget opacity">
                <a href="/register">REGISTER</a>
                <a href="/reset">FORGOT PASSWORD</a>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
};

export default Login;
