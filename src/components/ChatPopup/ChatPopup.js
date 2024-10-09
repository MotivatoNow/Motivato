import React, { useState, useEffect } from 'react';
import {collection, query, where, onSnapshot, addDoc, orderBy, updateDoc, doc} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FaTimes } from 'react-icons/fa';
import { useAuth } from "../../context/AuthContext";

const ChatPopup = ({ conversationId, closePopup }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!conversationId) return;

        const messagesRef = collection(db, `conversations/${conversationId}/messages`);
        const q = query(messagesRef, orderBy('timestamp', 'asc')); // מיון לפי חותמת הזמן של ההודעות

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => doc.data()));
        });

        return () => unsubscribe();
    }, [conversationId]);

    const sendMessage = async () => {
        if (newMessage.trim() !== '') {
            try {
                const messageRef = collection(db, `conversations/${conversationId}/messages`);
                await addDoc(messageRef, {
                    author: currentUser.uid,
                    content: newMessage,
                    timestamp: new Date(),
                    type: 'text'
                });

                // עדכון השיחה הראשית עם ההודעה האחרונה
                await updateDoc(doc(db, 'conversations', conversationId), {
                    lastMessage: newMessage,
                    lastMessageTimestamp: new Date(),
                });

                setNewMessage('');
            } catch (error) {
                console.error("Error sending message: ", error);
            }
        }
    };

    return (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 w-80">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-lg">Chat</h2>
                <button onClick={closePopup}>
                    <FaTimes />
                </button>
            </div>
            <div className="h-60 overflow-y-scroll mb-2">
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div key={index} className={`p-2 ${msg.author === currentUser.uid ? 'text-right' : 'text-left'}`}>
                            <p className="bg-gray-200 rounded-lg px-4 py-2 inline-block">{msg.content}</p>
                        </div>
                    ))
                ) : (
                    <p>No messages yet</p>
                )}
            </div>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="border p-2 w-full rounded-lg mb-2"
                placeholder="Type a message..."
            />
            <button className="bg-blue-500 text-white w-full py-2 rounded-lg" onClick={sendMessage}>
                Send
            </button>
        </div>
    );
};

export default ChatPopup;
