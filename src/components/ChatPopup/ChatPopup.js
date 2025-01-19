import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import {
    fetchConversationData,
  sendMessage,
} from "../../hooks/useLoadChat";

const ChatPopup = ({ conversationId, closePopup }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [participants,setParticipants]=useState([])
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);


  useEffect(() => {
    fetchConversationData(
      conversationId,
      setMessages, 
      currentUser,
      setParticipants
    );
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
  }, [conversationId,messages]);

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 w-96 border border-gray-200">
  {/* Header */}
  <div className="flex justify-between items-center mb-3 border-b pb-2">
    <h2 className="font-semibold text-lg text-gray-800">
      {participants?.map((p) => p.userName).join(" - ") || "טוען..."}
    </h2>
    <button
      onClick={closePopup}
      className="text-gray-500 hover:text-gray-700 transition"
    >
      <FaTimes />
    </button>
  </div>

  {/* Messages Section */}
  <div className="h-80 overflow-y-auto mb-3 space-y-3">
    {messages.length > 0 ? (
      messages.map((msg, index) => (
        <div
          key={index}
          className={`flex ${
            msg.author === currentUser.uid ? "justify-end" : "justify-start"
          }`}
        >
          <p
            className={`${
              msg.author === currentUser.uid
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            } rounded-lg px-4 py-2 max-w-[70%] text-sm shadow-md break-words`}
          >
            {msg.content}
          </p>
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-center">No messages yet</p>
    )}
    <div ref={messagesEndRef} />
  </div>

  {/* Input Section */}
  <div className="flex items-center gap-2">
    <textarea
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      rows="1"
      className="flex-grow h-12 border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      placeholder="הקלד הודעה..."
    />
    <button
      className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 shadow-md transition"
      onClick={() =>
        sendMessage(conversationId, newMessage, currentUser, setNewMessage)
      }
    >
      Send
    </button>
  </div>
</div>

  );
};

export default ChatPopup;
