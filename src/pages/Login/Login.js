// src/pages/Login/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import './Login.css';
import { handleLogin } from '../../hooks/useLogin';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();


  return (
      <div className="login-page">
        <section className="container">
          <div className="login-container">
            <div className="form-container">
              <h1 className="opacity">ברוכים השבים :)</h1>
              <form onSubmit={(e)=>handleLogin(auth,email,password,setError,navigate)}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="דואר אלקטרוני"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="סיסמא"
                    required
                />
                <button className="opacity" type="submit">התחבר</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
              </form>
              <div className="register-forget opacity">
                <a href="/register">לא נרשמת עדיין? מהר להירשם פה!</a>
                <a href="/reset">ממבחן למבחן קורה ששוכחים סיסמא</a>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
};

export default Login;
