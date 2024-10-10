import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import ChatPopup from '../../components/ChatPopup/ChatPopup';
import { useAuth } from "../../context/AuthContext";

const ChatOverview = () => {
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null); // מזהה השיחה שנבחרה
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchConversations = async () => {
            if (!currentUser) return;

            const q = query(
                collection(db, 'Conversations'),
                where('participants', 'array-contains', currentUser.uid) // מחפש שיחות שהמשתמש הנוכחי משתתף בהן
            );

            const querySnapshot = await getDocs(q);
            setConversations(querySnapshot.docs.map(doc => ({
                id: doc.id, // מזהה השיחה
                ...doc.data()
            })));
        };

        fetchConversations();
    }, [currentUser]);

    const openChat = (conversationId) => {
        setActiveConversationId(conversationId); // פתיחת השיחה שנבחרה
    };

    return (
        <div className="flex">
            <div className="w-1/3 bg-gray-100 p-4">
                <h2 className="font-semibold text-lg mb-4">Conversations</h2>
                {conversations.length === 0 ? (
                    <p>No conversations found</p>
                ) : (
                    conversations.map((convo, index) => (
                        <div
                            key={index}
                            className="p-2 border-b hover:bg-gray-200 cursor-pointer"
                            onClick={() => openChat(convo.id)} // העברת מזהה השיחה שנבחרה
                        >
                            <p className="font-semibold">
                                {convo.isGroup ? convo.groupName : `Chat with ${convo.otherUserId}`}
                            </p>
                            <p className="text-sm text-gray-600">{convo.lastMessage}</p>
                        </div>
                    ))
                )}
            </div>
            <div className="w-2/3">
                {activeConversationId ? (
                    <ChatPopup
                        conversationId={activeConversationId} // העברת מזהה השיחה ל-Popup
                        closePopup={() => setActiveConversationId(null)}
                    />
                ) : (
                    <p className="text-center mt-8">Select a conversation to start chatting</p>
                )}
            </div>
        </div>
    );
};

export default ChatOverview;
