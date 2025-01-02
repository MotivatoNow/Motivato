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
} from "firebase/firestore";
import { db } from "../config/firebase";
// Accept friend request
  export const handleAccept = async (request,currentUser) => {
    try {
      const requestDocRef = doc(db, "followerRequests", request.id);

      // Update the status in Firebase to "accepted"
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
          // const receiverName = `${data.userName}`;
          console.log(data); //natan    currentUser=elianor
          await newFriendNotification(data.uid, currentUser);
        }
      } catch (e) {
        console.log(e);
      }
    } catch (error) {
      console.error("Error accepting follower request:", error);
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
      await createNotification(notification)
    };

    export const loadFollowerRequest = async (currentUser, setFollowerRequests) =>{
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
    }
  