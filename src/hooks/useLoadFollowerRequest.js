import { createNotification } from "./useLoadNotifications";
import {
  doc,
  getDoc,
  query,
  collection,
  where,
  onSnapshot,
  updateDoc,
  arrayUnion,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";
// Accept friend request
export const handleAccept = async (request, currentUser) => {
  try {
    const requestQuery = query(
      collection(db, "followerRequests"),
      where("senderId", "==", request.senderId),
      where("receiverId", "==", currentUser.uid)
    );
    const requestSnapshot = await getDocs(requestQuery);

    // Update the status in Firebase to "accepted"
    if (!requestSnapshot.empty) {
      const requestDocRef = requestSnapshot.docs[0].ref;
      await updateDoc(requestDocRef, { status: "accepted" });

      // Update the friends list for both users
      await updateDoc(doc(db, "Users", currentUser.uid), {
        followers: arrayUnion(request.senderId),
      });
      await updateDoc(doc(db, "Users", request.senderId), {
        followers: arrayUnion(currentUser.uid),
      });

      // Send a notification to the user who sent the friend request
      const receiverUserDocRef = doc(db, "Users", request.senderId);
      try {
        const docSnap = await getDoc(receiverUserDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log(data);
          await newFriendNotification(data.uid, currentUser);
        }
      } catch (e) {
        console.log(e);
      }
    }
  } catch (error) {
    console.error("Error accepting follower request:", error);
  }
};

// Reject friend request
export const handleReject = async (request) => {
  try {
    const requestDocRef = doc(db, "followerRequests", request.id);
    await updateDoc(requestDocRef, { status: "rejected" });
  } catch (error) {
    console.error("Error rejecting follower request:", error);
  }
};
// notification for new friend and adding it to firebase
export const newFriendNotification = async (newFriendId, acceptedUser) => {
  const notification = {
    postUser: newFriendId,
    newFollowerId: acceptedUser.uid,
    newFollowerName: acceptedUser.userName,
    type: "new follower",
    newFollowerProfilePicture: acceptedUser.profilePicture,
  };
  await createNotification(notification);
};

export const loadFollowerRequest = async (currentUser, setFollowerRequests) => {
  const q = query(
    collection(db, "followerRequests"),
    where("receiverId", "==", currentUser.uid),
    where("status", "==", "pending")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setFollowerRequests(requests);
  });

  return () => unsubscribe();
};
