import React, { useEffect, useState } from "react";
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
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";

const ConversationView = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [participantsData, setParticipantsData] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const { currentUser } = useAuth();

  // Fonction pour marquer les messages comme lus
  const markMessagesAsRead = async () => {
    const messageRef = collection(db, "Conversations", conversationId, "messages");
    const q = query(messageRef, where("isRead", "==", false));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docSnapshot) => {
      const messageRef = doc(db, "Conversations", conversationId, "messages", docSnapshot.id);
      await updateDoc(messageRef, { isRead: true });
    });
  };

  useEffect(() => {
    const fetchMessagesAndParticipants = async () => {
      // Écouter les messages en temps réel
      const messagesQuery = query(
        collection(db, "Conversations", conversationId, "messages"),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);
      });

      const conversationDoc = await getDoc(
        doc(db, "Conversations", conversationId)
      );
      const participants = conversationDoc.data().participants;

      const usersData = {};
      for (const participantId of participants) {
        const userRef = doc(db, "Users", participantId);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          usersData[participantId] = userSnapshot.data();
        }
      }
      setParticipantsData(usersData);

      // Marquer les messages comme lus
      markMessagesAsRead();

      // Nettoyage lors de la destruction du composant
      return () => unsubscribe();
    };

    fetchMessagesAndParticipants();
  }, [conversationId]);

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
        isRead: false,  // Nouveau message est non lu
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
    <div className="p-4">
      <h2 className="font-semibold text-lg mb-4">Messages</h2>
      {messages.length === 0 ? (
        <p>No messages in this conversation</p>
      ) : (
        messages.map((message, index) => {
          const authorData = participantsData[message.author];
          return (
            <div key={message.id} className="mb-2 flex items-center">
              {authorData && authorData.profilePicture && (
                <img
                  src={authorData.profilePicture}
                  alt={authorData.firstName}
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}
              <div
                key={index}
                className={`p-2 ${message.author === currentUser.uid ? "text-right" : "text-left"}`}
              >
                <p
                  className={`bg-${message.author === currentUser.uid ? "blue" : "gray"}-200 rounded-lg px-4 py-2 inline-block`}
                >
                  {message.content}
                </p>
              </div>
            </div>
          );
        })
      )}
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        className="border p-2 w-full rounded-lg mb-2"
        placeholder="Type a message..."
      />
      <button
        className="bg-blue-500 text-white w-full py-2 rounded-lg"
        onClick={sendMessage}
      >
        Send
      </button>
    </div>
  );
};

export default ConversationView;
