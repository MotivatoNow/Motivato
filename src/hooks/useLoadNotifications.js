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
    if (currentUser) {
      const singleQuery = query(
        collection(db, "Notifications"),
        where("postUser", "==", currentUser.uid)
      );

      const unsubscribe = onSnapshot(singleQuery, async (response) => {
        const notificationsData = [];
        for (const docN of response.docs) {
          const notificationData = docN.data();
          let userDoc;

          // Traite les différents types de notifications
          if (
            notificationData.type === "comment" &&
            notificationData.postUser === currentUser.uid
          ) {
            userDoc = await getDoc(
              doc(db, "Users", notificationData.commentId)
            );
          } else if (
            notificationData.type === "like" &&
            notificationData.postUser === currentUser.uid
          ) {
            userDoc = await getDoc(doc(db, "Users", notificationData.likeId));
          } else if (notificationData.type === "new follower") {
            userDoc = await getDoc(
              doc(db, "Users", notificationData.newFollowerId)
            );
          } else {
            userDoc = await getDoc(doc(db, "Users", notificationData.user));
          }

          const userName = userDoc.exists()
            ? `${userDoc.data().firstName} ${userDoc.data().lastName}`
            : "Unknown User";
          const userProfilePicture = userDoc.exists()
            ? userDoc.data().profilePicture
            : "defaultProfilePictureURL";

          notificationsData.push({
            id: docN.id,
            ...notificationData,
            userName,
            userProfilePicture,
          });
        }

        setNotifications(notificationsData);
        setUnreadCount(notificationsData.filter((notif) => !notif.read).length);
      });

      return () => unsubscribe();
    }
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
