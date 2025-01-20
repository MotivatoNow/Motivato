import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  deleteDoc,
  updateDoc,
  arrayRemove,
  query,
  collection,
  where,
  getDocs,
  doc,
  addDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { FaUserPlus, FaUserTimes, FaCheck, FaTimes } from "react-icons/fa";

const FriendButton = ({ user }) => {
  const { currentUser } = useAuth();
  const [request, setRequest] = useState([]);
  const [status, setStatus] = useState(null);
  const [isReceiver, setIsReceiver] = useState(false);
  const [isSender, setIsSender] = useState(false);

  // Accept friend request
  const handleAccept = async () => {
    try {
      const requestQuery = query(
        collection(db, "followerRequests"),
        where("senderId", "==", user.uid), //who send the request
        where("receiverId", "==", currentUser.uid) //who received the request
      );

      const requestSnapshot = await getDocs(requestQuery);

      if (!requestSnapshot.empty) {
        const requestDoc = requestSnapshot.docs[0].ref;

        await updateDoc(requestDoc, { status: "accepted" });

        await updateDoc(doc(db, "Users", currentUser.uid), {
          followers: arrayUnion(user.uid),
        });
        await updateDoc(doc(db, "Users", user.uid), {
          followers: arrayUnion(currentUser.uid),
        });

        await newFollowerNotification(user.uid, currentUser);
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };
  const newFollowerNotification = async (newFollowerId, acceptedUser) => {
    const notification = {
      postUser: newFollowerId, //Who send the request
      newFollowerId: acceptedUser.uid, //who accept the request
      newFollowerName: `${acceptedUser.userName}`, //the name of user accept
      type: "new follower",
    };

    try {
      await addDoc(collection(db, "Notifications"), notification);
      console.log("Notification sent successfully");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Reject friend request
  const handleReject = async (request) => {
    try {
      const requestQuery = query(
        collection(db, "followerRequests"),
        where("senderId", "==", user.uid),
        where("receiverId", "==", currentUser.uid)
      );

      const requestSnapshot = await getDocs(requestQuery);

      if (!requestSnapshot.empty) {
        const requestDoc = requestSnapshot.docs[0].ref;
        await updateDoc(requestDoc, { status: "rejected" });
      }
    } catch (error) {
      console.error("Error rejecting follower request:", error);
    }
  };

  const addFriend = async () => {
    try {
      console.log(1);
      await addDoc(collection(db, "followerRequests"), {
        senderId: currentUser.uid, // The id of the sender
        senderUserName: currentUser.userName, // The username  of the sender
        senderPicture: currentUser.profilePicture, // The profile picture of the sender
        receiverId: user.uid, // The unique identifier of the receiver
        status: "pending", // Initial status of the request (pending, accepted, declined)
        timestamp: new Date().toISOString(), // The timestamp of the request was created
      });
      setStatus("pending");
      console.log("Follower request sent!");
    } catch (error) {
      console.log("Error sending follower request:", error);
    }
  };

  const removeFriend = async () => {
    try {
      const q = query(
        collection(db, "followerRequests"),
        where("senderId", "in", [currentUser.uid, user.uid]),
        where("receiverId", "in", [currentUser.uid, user.uid])
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // מוחקים את המסמך של בקשת החברות
        const requestDoc = querySnapshot.docs[0].ref;
        await deleteDoc(requestDoc);

        // מסירים את החבר ממערך friends של המשתמש הנוכחי
        const currentUserDocRef = doc(db, "Users", currentUser.uid);
        await updateDoc(currentUserDocRef, {
          followers: arrayRemove(user.uid),
        });

        // מסירים את המשתמש הנוכחי ממערך friends של החבר
        const followerUserDocRef = doc(db, "Users", user.uid);
        await updateDoc(followerUserDocRef, {
          followers: arrayRemove(currentUser.uid),
        });

        setStatus(null); // מחזירים את הסטטוס ל-null
        console.log("follower removed successfully!");
      }
    } catch (error) {
      console.log("Error removing follower:", error);
    }
  };

  useEffect(() => {
    let unsubscribe;
  
    const listenToFriendRequest = async () => {
      try {
        const q = query(
          collection(db, "followerRequests"),
          where("senderId", "in", [currentUser.uid, user.uid]),
          where("receiverId", "in", [currentUser.uid, user.uid])
        );
  
        unsubscribe = onSnapshot(q, (querySnapshot) => {
          if (!querySnapshot.empty) {
            const request = querySnapshot.docs[0].data();
            setStatus(request.status);
  
            if (request.receiverId === currentUser.uid) {
              setIsReceiver(true);
              setIsSender(false);
            } else {
              setIsSender(true);
              setIsReceiver(false);
            }
          } else {
            setStatus(null);
            setIsReceiver(false);
            setIsSender(false);
          }
        });
      } catch (error) {
        console.error("Error listening to friend request:", error);
      }
    };
  
    if (user && currentUser) {
      listenToFriendRequest();
    }
  
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [user, currentUser]);
  

  return (
<>
  {/* הצגת הכפתור בהתאם לסטטוס */}
  {!status && status !== "accepted" && status !== "pending" ? (
    <button
      onClick={addFriend}
      className="btn bg-[#3E54D3] text-white hover:bg-[#3e54d2] flex items-center gap-2"
    >
      <FaUserPlus />
      הוספת חבר
    </button>
  ) : (
    <>
      {status === "pending" && isReceiver && !isSender && (
        <div className="flex justify-end gap-2 mt-2">
          <button
            className="btn btn-success flex items-center gap-2"
            onClick={handleAccept}
          >
            <FaCheck />
            אישור
          </button>
          <button
            className="btn btn-error flex items-center gap-2"
            onClick={() => handleReject(request)}
          >
            <FaTimes />
            דחייה
          </button>
        </div>
      )}
      {status === "pending" && !isReceiver && (
        <button
          disabled
          className="btn bg-[#3E54D3] hover:bg-[#3e54d2] flex items-center gap-2"
        >
          בקשתכם נשלחה
        </button>
      )}
     {status === "accepted" && (
  <button
    onClick={removeFriend}
    className="btn bg-[#3E54D3] text-white hover:bg-[#3e54d2] flex items-center gap-2"
  >
    <FaUserTimes />
    הסרת חבר
  </button>
)}

    </>
  )}
</>
  );
};

export default FriendButton;
