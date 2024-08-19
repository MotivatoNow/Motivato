// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth,sendPasswordResetEmail} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {getStorage} from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC3imHJ_Nb9PNYhxP9QruPvCbXVTmerFIo",
    authDomain: "motivato-e99c2.firebaseapp.com",
    projectId: "motivato-e99c2",
    storageBucket: "motivato-e99c2.appspot.com",
    messagingSenderId: "33841919076",
    appId: "1:33841919076:web:647744eefe5e9717e99b71",
    measurementId: "G-9YM0Q0BG98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const fire=initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth=getAuth(app);
export const db=getFirestore(app)
export const storage=getStorage(app)
export const passwordReset=async(email)=>await sendPasswordResetEmail(auth,email)