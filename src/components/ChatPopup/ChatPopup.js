import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase'; // Firebase config import
import { FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext'; // Authentication context to get current user

const ChatPopup = ({ conversationId, closePopup }) => {
    const [messages, setMessages] = useState([]);  // State to store messages
    const [newMessage, setNewMessage] = useState('');  // State to handle the input value
    const { currentUser } = useAuth();  // Get current user from authentication context

    // Fetch messages in real-time
    useEffect(() => {
        if (!conversationId) return;  // If no conversationId is passed, do nothing

        // Reference to the messages subcollection for the current conversation
        const messagesRef = collection(db, `Conversations/${conversationId}/messages`);
        const q = query(messagesRef, orderBy('timestamp', 'asc')); // Order messages by timestamp

        // Set up real-time listener using onSnapshot
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => doc.data());
            setMessages(fetchedMessages); // Update local state with new messages
        });

        // Cleanup listener when component unmounts
        return () => unsubscribe();
    }, [conversationId]);  // This effect runs when conversationId changes

    // Function to send a new message
    const sendMessage = async () => {
        if (newMessage.trim() === '') return;  // Don't send empty messages

        try {
            // Add a new message document to the messages subcollection
            const messageRef = collection(db, `Conversations/${conversationId}/messages`);
            await addDoc(messageRef, {
                author: currentUser.uid,
                content: newMessage,
                timestamp: new Date(),
                type: 'text'
            });

            // Update the conversation with the latest message and timestamp
            await updateDoc(doc(db, "Conversations", conversationId), {
                lastMessage: newMessage,
                lastMessageTimestamp: new Date(),
            });

            // Clear the input after sending the message
        } catch (error) {
            console.error("Error sending message: ", error);
        }
        setNewMessage('');
    };

    return (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 w-80">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-lg">Chat</h2>
                <button onClick={closePopup}>
                    <FaTimes />
                </button>
            </div>
            
            {/* Display chat messages */}
            <div className="h-60 overflow-y-scroll mb-2">
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`p-2 ${msg.author === currentUser.uid ? 'text-right' : 'text-left'}`}
                        >
                            <p className={`bg-${msg.author === currentUser.uid ? 'blue' : 'gray'}-200 rounded-lg px-4 py-2 inline-block`}>
                                {msg.content}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>No messages yet</p>
                )}
            </div>

            {/* Input field and send button */}
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
