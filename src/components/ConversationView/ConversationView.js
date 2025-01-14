import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  orderBy,
  onSnapshot,
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
    <div className="flex flex-col h-full bg-white p-4 rounded-lg shadow-md max-w-full mx-auto">
      <h2 className="font-semibold text-2xl text-gray-800 mb-4">Messages</h2>
      <div
        ref={messagesContainerRef}
        className="overflow-y-auto h-[calc(100vh-200px)] mb-2 p-4 bg-gray-100 rounded-lg shadow-inner space-y-4"
        onScroll={(e) => {
          if (e.target.scrollTop === 0) {
            loadMoreMessages();
          }
        }}
      >
        {" "}
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">
            No messages in this conversation
          </p>
        ) : (
          messages.map((message, index) => {
            const authorData = participantsData[message.author];
            return (
              <div
                key={message.id}
                className={`flex items-start ${
                  message.author === currentUser.uid
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {authorData &&
                  authorData.profilePicture &&
                  authorData.uid !== currentUser.uid && (
                    <img
                      src={authorData.profilePicture}
                      alt={authorData.userName}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                  )}
                <div className="max-w-xs">
                  <p
                    className={`p-3 rounded-lg ${
                      message.author === currentUser.uid
                        ? "bg-blue-500 text-white ml-auto"
                        : "bg-gray-300 text-gray-800"
                    }`}
                  >
                    {message.content}
                  </p>
                </div>
                <div ref={messagesEndRef} />
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center space-x-2 mt-2">
        
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          rows="1"
          className="w-full h-12 border p-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize"
          placeholder="Type a message..."
        />
        <button
          className="h-12 bg-blue-500 text-white px-6 rounded-lg hover:bg-blue-600 transition duration-300"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ConversationView;
