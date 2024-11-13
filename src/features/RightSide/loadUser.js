import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React from 'react'
import { db } from '../../firebase';



export const loadUsers = async (currentUser,shuffleArray,setSuggestedFriends) => {
    try {
      // שליפת החברים של המשתמש הנוכחי
      const userDoc = await getDoc(doc(db, "Users", currentUser.uid));
      const friendIds = userDoc.exists() ? userDoc.data().friends || [] : [];

      // שליפת כל המשתמשים
      const usersCollection = collection(db, "Users");
      const userDocs = await getDocs(usersCollection);
      
      // סינון החברים והמשתמש הנוכחי וערבוב הרשימה
      const allUsers = userDocs.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) => user.id !== currentUser.uid && !friendIds.includes(user.id)) // הסרת החברים והמשתמש הנוכחי
        
      const randomUsers = shuffleArray(allUsers).slice(0, 6); // ערבוב וחיתוך ל-5–6 משתמשים רנדומליים

      setSuggestedFriends(randomUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };
