import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { createNotification } from "./useLoadNotifications";

export const fetchLikes = async (
  posts,
  setLiked,
  setLikedCount,
  currentUser
) => {
  try {
    const docRef = doc(db, "Likes", posts.id);
    const docS = await getDoc(docRef);

    if (docS.exists()) {
      const data = docS.data();
      setLikedCount(data.likeCount || 0);
      setLiked(data.likedUsers.includes(currentUser.uid));
    }
  } catch (error) {
    console.log(error);
  }
};
export const handleLike = async (currentUser,posts,likedCount,liked,setLiked,setLikedCount) => {
    
  if (!currentUser || !currentUser.uid) {
    console.error("User not logged in or user ID is undefined");
    return;
  }

  const docRef = doc(db, "Likes", posts.id);

  try {
    const docSnap = await getDoc(docRef);
    let newLikedCount = likedCount;
    let likedUsers = [];

    if (docSnap.exists()) {
      const data = docSnap.data();
      likedUsers = data.likedUsers;

      if (liked) {
        newLikedCount -= 1;
        likedUsers = likedUsers.filter((userId) => userId !== currentUser.uid);
      } else {
        newLikedCount += 1;
        likedUsers.push(currentUser.uid);
      }
    } else {
      newLikedCount = 1;
      likedUsers = [currentUser.uid];
    }

    await setDoc(
        docRef,
        { likeCount: newLikedCount, likedUsers },
        { merge: true }
      );
      
      setLiked(!liked); 
      setLikedCount(newLikedCount); 
      
    if (!liked && posts.user.uid !== currentUser.uid) {
      const notification = {
        type: "like",
        postId: posts.id,
        likeId: currentUser.uid,
        postUser: posts.user.uid,
        likeName: currentUser.userName,
      };
      await createNotification(notification);
    }
  } catch (error) {
    console.error(error);
  }
};
