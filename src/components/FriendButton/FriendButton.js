import React from "react";
import { useAuth } from "../../context/AuthContext";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";
const FriendButton = ({ user }) => {
  const { currentUser } = useAuth();
  const addFriend = async () => {
    try {
      await addDoc(collection(db, "friendRequests"), {
        senderId: currentUser,
        receiverId: user,
        status: "pending",
      });
      console.log("Friend request sent!");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <button onClick={addFriend}> Add Friends</button>
    </>
  );
};

export default FriendButton;
