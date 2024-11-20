import { getDoc, doc } from "firebase/firestore";
import React from "react";
import { db } from "../firebase";

// loading the the all data from the currentUser
export const loadData = async (
  id,
  setUserData,
  setUserNotFound,
  loadFollowers,
  setLoading,
  setFollowers
) => {
  try {
    const userDoc = await getDoc(doc(db, "Users", id));
    if (userDoc.exists()) {
      setUserData({ id: userDoc.id, ...userDoc.data() });
      setUserNotFound(false);
      if (userDoc.data().followers) {
        loadFollowers(userDoc.data().followers,setFollowers);
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
