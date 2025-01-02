import {
  addDoc,
  collection,
  onSnapshot,
  query,
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
