import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import {
  fetchMessagesAndParticipants,
  markMessagesAsRead,
} from "../../hooks/useLoadChat";

const ConversationView = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [participantsData, setParticipantsData] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    fetchMessagesAndParticipants(
      conversationId,
      setMessages,
      setParticipantsData,
      markMessagesAsRead,
      currentUser
    );
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const loadMoreMessages = async () => {
    if (loading) return;
    setLoading(true);

    const firstMessage = messages[0];
    const q = query(
      collection(db, `Conversations/${conversationId}/messages`),
      orderBy("timestamp", "desc"),
      limit(10),
      firstMessage ? startAfter(firstMessage.timestamp) : undefined
    );

    const querySnapshot = await getDocs(q);
    const newMessages = querySnapshot.docs.map((doc) => doc.data());
    setMessages((prevMessages) => [...newMessages.reverse(), ...prevMessages]);

    setLoading(false);
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      const messageRef = collection(
        db,
        `Conversations/${conversationId}/messages`
      );
      await addDoc(messageRef, {
        author: currentUser.uid,
        content: newMessage,
        timestamp: new Date(),
        type: "text",
        isRead: false,
      });

      await updateDoc(doc(db, "Conversations", conversationId), {
        lastMessage: newMessage,
        lastMessageTimestamp: new Date(),
      });
    } catch (error) {
      console.error("Error sending message: ", error);
    }
    setNewMessage("");
  };

  return (
<div className="flex flex-col h-full bg-base-100 p-4 rounded-lg shadow-md max-w-full mx-auto">
  {/* כותרת הצ'אט */}
  <h2 className="font-bold text-2xl text-[#3E54D3] mb-4">הודעות</h2>

  {/* אזור ההודעות */}
  <div
    ref={messagesContainerRef}
    className="overflow-y-auto h-[calc(100vh-200px)] mb-2 p-4 bg-gray-100 rounded-lg shadow-inner space-y-4"
    onScroll={(e) => {
      if (e.target.scrollTop === 0) {
        loadMoreMessages();
      }
    }}
  >
    {/* הודעות */}
    {messages.length === 0 ? (
      <p className="text-center text-gray-500">
        No messages in this conversation
      </p>
    ) : (
      messages.map((message) => {
        const authorData = participantsData[message.author];
        const isCurrentUser = message.author === currentUser.uid;

        return (
          <div
            key={message.id}
            className={`chat ${isCurrentUser ? "chat-end" : "chat-start"}`}
          >
            {/* תמונת פרופיל */}
            {authorData &&
              authorData.profilePicture &&
              !isCurrentUser && (
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    <img
                      src={authorData.profilePicture}
                      alt={authorData.userName}
                    />
                  </div>
                </div>
              )}

            {/* בועת ההודעה */}
            <div
              className={`chat-bubble ${
                isCurrentUser
                  ? "bg-[#3E54D3] text-white"
                  : "bg-gray-300 text-gray-800"
              }`}
            >
              {message.content}
            </div>
          </div>
        );
      })
    )}
  </div>

  {/* אזור שליחת הודעות */}
  <div className="flex items-center space-x-2 mt-2">
    <textarea
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      rows="1"
      className="textarea textarea-bordered w-full h-12 resize-none"
      placeholder="כתיבה הודעה..."
    />
    <button
      className="btn btn-primary bg-[#3E54D3] hover:bg-[#2a3c9c]"
      onClick={sendMessage}
    >
      שלח הודעה
    </button>
  </div>
</div>

  );
};

export default ConversationView;
