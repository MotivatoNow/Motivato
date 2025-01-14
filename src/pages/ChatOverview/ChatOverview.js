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
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      <div className="lg:w-1/3 bg-white shadow-md p-4 overflow-y-auto">
        <h2 className="font-semibold text-xl mb-6 text-gray-700">צ'אטים</h2>
        {conversations.length === 0 ? (
          <p className="text-gray-500">לא נמצאו שיחות</p>
        ) : (
          conversations.map((convo, index) => (
            <div
              key={index}
              className="p-4 mb-4 bg-gray-100 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => openChat(convo.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 flex items-center">
                    {convo.hasUnreadMessages && (
                      <span className="bg-blue-500 text-blue-500 text-xs font-bold px-2 py-1 rounded-full mr-2">
                        *
                      </span>
                    )}
                    {convo.isGroup ? convo.groupName : `${convo.otherUserName}`}
                  </p>

                  <p className="text-sm text-gray-600 truncate">
                    {convo.lastMessage || "No messages yet"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="lg:w-2/3 flex-grow bg-white shadow-lg rounded-lg p-6 overflow-y-auto">
        {activeConversationId ? (
          <ConversationView conversationId={activeConversationId} />
        ) : (
          <p className="text-center text-gray-500 mt-16">
            בחר שיחה כדי להמשיך בצ'אט
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatOverview;
