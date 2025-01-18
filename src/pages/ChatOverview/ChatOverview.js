import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import ConversationView from "../../components/ConversationView/ConversationView";
import { useAuth } from "../../context/AuthContext";
import { loadUser } from "../../hooks/useLoadUsers";

const ChatOverview = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) return;

      const q = query(
        collection(db, "Conversations"),
        where("participants", "array-contains", currentUser.uid)
      );

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const convos = [];
        for (let docSnapshot of querySnapshot.docs) {
          const convoData = docSnapshot.data();
          const otherUserId = convoData.participants.find(
            (id) => id !== currentUser.uid
          );
          if (!otherUserId) {
            console.error(
              `No other user ID found in conversation: ${docSnapshot.id}`
            );
            continue;
          }
          const otherUser = await loadUser(otherUserId, () => {});

          if (!otherUser) {
            console.error(`User not found for ID: ${otherUserId}`);
            convos.push({
              id: docSnapshot.id,
              ...convoData,
              otherUserName: "Unknown User",
              hasUnreadMessages: false,
            });
            continue;
          }

          const hasUnreadMessages = await checkUnreadMessages(docSnapshot.id);

          convos.push({
            id: docSnapshot.id,
            ...convoData,
            otherUserName: `${otherUser.userName}`,
            hasUnreadMessages: hasUnreadMessages,
          });
        }
        setConversations(convos);
      });

      // Cleanup the listener when the component is unmounted
      return () => unsubscribe();
    };

    fetchConversations();
  }, [currentUser]);

  const getUserData = async (userId) => {
    const userData = await loadUser(userId, () => {});
    return userData;
  };

  const checkUnreadMessages = async (conversationId) => {
    const messageRef = collection(
      db,
      `Conversations/${conversationId}/messages`
    );
    const q = query(messageRef, where("isRead", "==", false));

    const querySnapshot = await getDocs(q);

    for (const docSnapshot of querySnapshot.docs) {
      const messageData = docSnapshot.data();
      if (messageData.author !== currentUser.uid && !messageData.isRead) {
        return true;
      }
    }
    return false;
  };

  const markMessagesAsRead = async (conversationId) => {
    try {
      const messagesRef = collection(
        db,
        `Conversations/${conversationId}/messages`
      );
      const q = query(messagesRef, where("isRead", "==", false));

      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (docSnapshot) => {
        const messageRef = doc(
          db,
          `Conversations/${conversationId}/messages`,
          docSnapshot.id
        );
        await updateDoc(messageRef, { isRead: true });
      });

    } catch (error) {
      console.error("Error marking messages as read: ", error);
    }
  };

  const openChat = (conversationId) => {
    setActiveConversationId(conversationId);
    markMessagesAsRead(conversationId);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-base-200">
    {/* רשימת שיחות */}
    <div className="lg:w-1/3 bg-base-100 shadow-md p-6 overflow-y-auto rounded-lg">
      <h2 className="font-bold text-lg text-gray-700 mb-6">צ'אטים</h2>
      {conversations.length === 0 ? (
        <p className="text-center text-gray-500">לא נמצאו שיחות</p>
      ) : (
        conversations.map((convo, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 mb-4 bg-base-100 border border-gray-300 rounded-lg hover:shadow transition cursor-pointer"
            onClick={() => openChat(convo.id)}
          >
            {/* תמונת פרופיל */}
            <img
              src={convo.profilePicture || "https://via.placeholder.com/50"}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
            {/* פרטי השיחה */}
            <div className="flex-grow">
              <p className="font-semibold text-gray-800">
                {convo.isGroup ? convo.groupName : convo.otherUserName}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {convo.lastMessage || "אין הודעות"}
              </p>
            </div>
            {/* הודעה שלא נקראה */}
            {convo.hasUnreadMessages && (
              <span className="badge badge-error text-xs font-bold">חדש</span>
            )}
          </div>
        ))
      )}
    </div>
  
    {/* חלון השיחה הפעילה */}
    <div className="lg:w-2/3 flex-grow bg-base-100 shadow-lg rounded-lg p-6 overflow-y-auto">
      {activeConversationId ? (
        <ConversationView conversationId={activeConversationId} />
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <img
            src="https://via.placeholder.com/100"
            alt="No Conversation"
            className="w-24 h-24 mb-4"
          />
          <p className="text-gray-500">בחר שיחה כדי להמשיך בצ'אט</p>
        </div>
      )}
    </div>
  </div>
  
  );
};

export default ChatOverview;
