import { getDoc, doc, getDocs, collection } from "firebase/firestore";
import React from "react";
import { db } from "../firebase";

// פונקציה לערבוב מערך
const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

export const loadUser = async (id, setUserData) => {
  try {
    const userDoc = await getDoc(doc(db, "Users", id));
    if (userDoc.exists()) {
      const userData = { id: userDoc.id, ...userDoc.data() };
      setUserData(userData);
      return userData;
    } else {
      setUserData(null);
      return null;
    }
  } catch (error) {
    console.error(error);
    setUserData(null);
  }
};

// loading the the all data from the currentUser
export const loadData = async (
  uid,
  setUserData,
  setUserNotFound,
  loadFollowers,
  setLoading,
  setFollowers
) => {
  try {
    const user = await loadUser(uid, setUserData);
    if (user) {
      setUserNotFound(false);
      if (user.followers) {
        loadFollowers(user.followers, setFollowers);
      }
    } else {
      setUserNotFound(true);
    }
  } catch (error) {
    console.error("Error getting user: ", error);
  }
  setLoading(false);
};

//Loading all the friends' data
export const loadFollowers = async (followersId, setFollowers) => {
  try {
    const followerPromises = followersId.map((followerId) =>
      getDoc(doc(db, "Users", followerId))
    );
    const followerDoc = await Promise.all(followerPromises);

    const loadedFollowers = followerDoc.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setFollowers(loadedFollowers); // שמירת החברים בסטייט
  } catch (error) {
    console.error("Error loading friends:", error);
  }
};

export const loadUsers = async (currentUser, setSuggestedFriends) => {
  try {
    // שליפת החברים של המשתמש הנוכחי
    const currentUserData = await loadUser(currentUser.uid, () => {});
    const followersId = currentUserData?.followers || [];

    // שליפת כל המשתמשים
    const userDocs = await getDocs(collection(db, "Users"));

    // סינון החברים והמשתמש הנוכחי וערבוב הרשימה
    const allUsers = userDocs.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(
        (user) => user.id !== currentUser.uid && !followersId.includes(user.id)
      ); // הסרת החברים והמשתמש הנוכחי

    const randomUsers = shuffleArray(allUsers).slice(0, 6); // ערבוב וחיתוך ל-5–6 משתמשים רנדומליים
    setSuggestedFriends(randomUsers);
  } catch (error) {
    console.error("Error loading users:", error);
  }
};

export const checkVerification = async (currentUser, setIsVerified) => {
  if (currentUser) {
    const userDoc = await getDoc(doc(db, "Users", currentUser.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setIsVerified(userData.isVerified);
    }
  }
};
