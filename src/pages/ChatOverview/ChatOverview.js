import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import ConversationView from '../../components/ConversationView/ConversationView';
import { useAuth } from "../../context/AuthContext";

const ChatOverview = () => {
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchConversations = async () => {
            if (!currentUser) return;

            const q = query(
                collection(db, 'Conversations'),
                where('participants', 'array-contains', currentUser.uid)
            );

            const querySnapshot = await getDocs(q);
            const convos = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            const enrichedConvos = await Promise.all(convos.map(async (convo) => {
                const otherUserId = convo.participants.find(id => id !== currentUser.uid);
                const otherUser = await getUserData(otherUserId);
                return {
                    ...convo,
                    otherUserName: `${otherUser.firstName} ${otherUser.lastName}`,
                };
            }));

            setConversations(enrichedConvos);
        };

        fetchConversations();
    }, [currentUser]);

    const getUserData = async (userId) => {
        const userRef = doc(db, 'Users', userId);
        const userSnapshot = await getDoc(userRef);
        return userSnapshot.exists() ? userSnapshot.data() : null;
    };

    const openChat = (conversationId) => {
        setActiveConversationId(conversationId);
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
                            onClick={() => openChat(convo.id)}
                        >
                            <p className="font-semibold">
                                {convo.isGroup ? convo.groupName : `Chat with ${convo.otherUserName}`}
                            </p>
                            <p className="text-sm text-gray-600">{convo.lastMessage}</p>
                        </div>
                    ))
                )}
            </div>
            <div className="w-2/3">
                {activeConversationId ? (
                    <ConversationView conversationId={activeConversationId}/>
                ) : (
                    <p className="text-center mt-8">Select a conversation to start chatting</p>
                )}
            </div>
        </div>
    );
};

export default ChatOverview;
