import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

const notificationCollect = collection(db, "Notifications");
export const createNotification = async (notification) => {
  try {
    const notificationRef = await addDoc(notificationCollect, notification);
    return notificationRef;
  } catch (error) {
    console.error("Error adding notification:", error);
    throw error;
  }
};

export const loadNotifications = (
  currentUser,
  setNotifications,
  setUnreadCount
) => {
  const q = query(
    notificationCollect,
    where("postUser", "==", currentUser.uid)
  );

  return onSnapshot(q, async (snapshot) => {
    const notifications = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const userDoc = await getDoc(doc(db, "Users", data.user || data.commentId || data.likeId || data.newFollowerId));
        
        return {
          id: docSnap.id,
          ...data,
          userName: userDoc.exists() ? userDoc.data().userName : "Unknown User",
          userProfilePicture: userDoc.exists() ? userDoc.data().profilePicture : "defaultProfilePictureURL",
        };
      })
    );

    setNotifications(notifications);
    setUnreadCount(notifications.filter((notif) => !notif.read).length);
  });
};

export const clearNotifications = async (currentUser, setNotifications) => {
  try {
    const q = query(
      notificationCollect,
      where("postUser", "==", currentUser.uid)
    );

    setNotifications([]); //Clear the notification in the local state
  } catch (error) {
    console.error("Error clearing notifications:", error);
  }
};
export const handleNotificationClick = (
  notifications,
  setUnreadCount,
  toggleDropdown2,
  unreadCount
) => {
  toggleDropdown2(); // close or open the dropdown

  if (unreadCount > 0) {
    //update from unread to reade
    notifications.forEach(async (notification) => {
      if (!notification.read) {
        const notificationRef = doc(db, "Notifications", notification.id);
        await updateDoc(notificationRef, { read: true });
      }
    });

    // reset the count for 0
    setUnreadCount(0);
  }
};
