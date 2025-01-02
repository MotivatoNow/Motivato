import {
  addDoc,
  collection,
  doc,
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

export const loadNotifications = async (
  currentUser,
  setNotifications,
  setUnreadCount
) => {
  const q = query(
    notificationCollect,
    where("postUser", "==", currentUser.uid)
  );
  const unsubscribe = onSnapshot(q, (docSnapshot) => {
    const allNotifications = docSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setNotifications(allNotifications);

    // עדכון מספר ההתראות שלא נקראו (לדוגמה: אם כל התראות חדשות)
    const unread = allNotifications.filter(
      (notification) => !notification.read
    ).length;

    setUnreadCount(unread);
  });
  return unsubscribe;
};
export const clearNotifications = async (currentUser,setNotifications) => {
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
export const handleNotificationClick = (notifications,setUnreadCount,toggleDropdown2,unreadCount) => {
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