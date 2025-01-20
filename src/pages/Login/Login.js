import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
        if (userData.isRejected) {
          setError("הרשמתך לא אושרה. לפרטים נוספים, אנא פנה אלינו באמצעות המייל.");
          return;
        }
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

<>
<div class="flex items-center min-h-screen p-4 bg-gray-100 lg:justify-center">
      <div
        class="flex flex-col overflow-hidden  bg-white rounded-md shadow-lg  md:flex-row md:flex-1 lg:max-w-screen-md"
      >
        <div
          class="p-4 py-6 text-white bg-[#4F80E2] md:w-80 md:flex-shrink-0 md:flex md:flex-col md:items-center md:justify-evenly"
        >
          <div class="my-3 text-4xl font-bold tracking-wider text-center">
            <a href="#">Motivato</a>
          </div>
          <p class="mt-6 font-normal text-center text-white md:mt-0">
          עם הפלטפורמה החדשנית שלנו, תוכלו להתמקד בהצגת הכישורים והיכולות שלכם, בזמן שאנחנו נדאג לחבר אתכם להזדמנויות המתאימות ביותר בעולם האקדמי והתעשייתי!
          </p>
          <p class="flex flex-col items-center justify-center mt-10 text-center">
            <span>עדיין אין לך משתמש?</span>
            <Link to={'/register'} className="underline">הירשם עכשיו</Link>
          </p>
          
        </div>
        <div class="p-5 bg-white md:flex-1">
          <h3 class="my-4 text-2xl font-semibold text-gray-700">התחברות</h3>
          <form action="#"  onSubmit={handleLogin} class="flex flex-col space-y-5">
            <div class="flex flex-col space-y-1">
              <label for="email" class="text-sm font-semibold text-gray-500">דואר אלקטרוני</label>
              <input
                type="email"
                id="email"
                autofocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                class="px-4 py-2 transition duration-300 border border-gray-300 rounded focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200"
              />
      

            </div>
            <div class="flex flex-col space-y-1">
              <div class="flex items-center justify-between">
                <label for="password" class="text-sm font-semibold text-gray-500">סיסמא</label>
                <Link class="text-sm text-blue-600 hover:underline focus:text-blue-800" to={'/reset'}>שכחת סיסמא?</Link>
              </div>
          
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                class="px-4 py-2 transition duration-300 border border-gray-300 rounded focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200"
              />
            </div>
            <div class="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                class="w-4 h-4 transition duration-300 rounded focus:ring-2 focus:ring-offset-0 focus:outline-none focus:ring-blue-200"
              />
              <label for="remember" class="text-sm font-semibold text-gray-500">זכור אותי</label>
            </div>
            <div>
              <button
                type="submit"
                class="w-full px-4 py-2 text-lg font-semibold text-white transition-colors duration-300 bg-[#4F80E2] rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-blue-200 focus:ring-4"
              >
                התחברות
              </button>
              {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
          </form>
        </div>
      </div>
    </div>


    </>
  );
};

export default Login;
