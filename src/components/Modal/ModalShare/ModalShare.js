import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../context/AuthContext";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { loadFollowers, loadUser } from "../../../hooks/useLoadUsers";

const ModalShare = ({ modalOpen, setModalOpen, postsId }) => {
  const { currentUser } = useAuth();
  const shareLink = `${window.location.origin}/post/${postsId}`;
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user friends
  useEffect(() => {
    const loadData = async () => {
      try {
        const user= await loadUser(currentUser.uid,()=>{});
        if (user&&user.followers) {
          await loadFollowers(user.followers,setFollowers)
        }
      } catch (error) {
        console.error("Error loading friends:", error);
      }
      setLoading(false);
    };
    loadData();
  }, [currentUser.uid]);

  // Send post link to a specific follower
  const handleFollowerClick = async (follower) => {
    const participants = [currentUser.uid, follower.uid];

    try {
      // Get or create a conversation with the follower
      let conversationId = await getExistingConversation(participants);
      if (conversationId == null)
        conversationId = await createConversation(participants);
      // Add the post link to the conversation as a message
      await addDoc(collection(db, `Conversations/${conversationId}/messages`), {
        author: currentUser.uid,
        content: shareLink,
        timestamp: new Date(),
        type: "link",
      });

      await updateDoc(doc(db, "Conversations", conversationId), {
        lastMessage: shareLink,
        lastMessageTimestamp: new Date(),
      });

      toast.success(`Link sent to ${follower.userName}`);
    } catch (error) {
      console.error("Error sending link to friend:", error);
      toast.error("Failed to send link");
    }
  };

  // Check if a conversation already exists between participants
  const getExistingConversation = async (participants) => {
    const q = query(
      collection(db, "Conversations"),
      where("participants", "array-contains", currentUser.uid) // Look for conversations involving the current user
    );

    const querySnapshot = await getDocs(q);

    // Check if any conversation contains exactly the participants
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      if (
        data.participants.includes(participants[1]) &&
        data.participants.length === 2
      ) {
        return doc.id; // Return the existing conversation ID
      }
    }

    return null; // No conversation found
  };

  // Create a new conversation if none exists
  const createConversation = async (participants) => {
    const conversationRef = await addDoc(collection(db, "Conversations"), {
      participants: participants,
      lastMessage: "",
      lastMessageTimestamp: new Date(),
      isGroup: false,
    });
    return conversationRef.id;
  };

  return (
    <Modal
      title="Share Post"
      centered
      open={modalOpen}
      onOk={() => setModalOpen(false)}
      onCancel={() => setModalOpen(false)}
      footer={null}
    >
      {followers.length > 0 ? (
        <div className="flex flex-col">
          {followers.map((follower) => (
            <div key={follower.id} className="flex items-center space-x-3">
              <img
                src={follower.profilePicture || "/default-profile.png"}
                alt={follower.firstName}
                className="rounded-full w-[3em] h-[3em]"
                onClick={() => handleFollowerClick(follower)} // Send the link when clicking on a follower
              />
              <span>
                {follower.userType === "Student" && <>{follower.userName}</>}
                {follower.userType === "Company" && <>{follower.companyName}</>}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p>No followers to share with.</p>
      )}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
        theme="colored"
      />
    </Modal>
  );
};

export default ModalShare;
