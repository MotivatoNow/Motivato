import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { message } from "antd";

export const handleLogin = async (e,auth,email,password,setError,navigate) => {

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // בדוק את מצב האימות של המשתמש
      const userDoc = await getDoc(doc(db, 'Users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (!userData.isVerified) {
          message.error('יש להמתין לאישור המערכת לפני התחברות.');
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
