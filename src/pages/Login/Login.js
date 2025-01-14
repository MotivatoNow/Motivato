import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";
import { auth, db } from "../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // בדוק את מצב האימות של המשתמש
      const userDoc = await getDoc(doc(db, "Users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (!userData.isVerified) {
          setError("יש להמתין לאישור המערכת לפני התחברות.");
          await auth.signOut(); // התנתקות מהמשתמש הלא מאושר
          return;
        }
      }

      setError("");
      navigate(`/feed`);
    } catch (error) {
      setError("Failed to login: " + error.message);
    }
  };

  return (
    <div className="login-page">
      <section className="container">
        <div className="login-container">
          <div className="form-container">
            <h1 className="opacity">ברוכים השבים :)</h1>
            <form onSubmit={handleLogin}>
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
              <button className="opacity" type="submit">
                התחבר
              </button>
              {error && <p style={{ color: "red" }}>{error}</p>}
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
