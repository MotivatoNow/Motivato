import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
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
            const convos = []

            for (let docSnapshot of querySnapshot.docs) {
                const convoData = docSnapshot.data();
                const otherUserId = convoData.participants.find(id => id !== currentUser.uid);
                const otherUser = await getUserData(otherUserId);

                const hasUnreadMessages = await checkUnreadMessages(docSnapshot.id);

                convos.push({
                    id: docSnapshot.id,
                    ...convoData,
                    otherUserName: `${otherUser.userName}`,
                    hasUnreadMessages: hasUnreadMessages
                });
            }

            setConversations(convos);
        };

        fetchConversations();
    }, [currentUser]);

    const getUserData = async (userId) => {
        const userRef = doc(db, 'Users', userId);
        const userSnapshot = await getDoc(userRef);
        return userSnapshot.exists() ? userSnapshot.data() : null;
    };

    const checkUnreadMessages = async (conversationId) => {
        const messageRef = collection(db, `Conversations/${conversationId}/messages`);
        const q = query(messageRef, where('isRead', '==', false));

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
            const messagesRef = collection(db, `Conversations/${conversationId}/messages`);
            const q = query(messagesRef, where('isRead', '==', false));

            const querySnapshot = await getDocs(q);

            querySnapshot.forEach(async (docSnapshot) => {
                const messageRef = doc(db, `Conversations/${conversationId}/messages`, docSnapshot.id);
                await updateDoc(messageRef, { isRead: true });
            });

            console.log("Messages marked as read");
        } catch (error) {
            console.error("Error marking messages as read: ", error);
        }
    };

    const openChat = (conversationId) => {
        setActiveConversationId(conversationId);
        markMessagesAsRead(conversationId);  
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
                            <div>
                                <p className="font-semibold">
                                    {convo.isGroup ? convo.groupName : `Chat with ${convo.otherUserName}`}
                                </p>
                                <p className="text-sm text-gray-600">{convo.lastMessage}</p>
                            </div>
                            {convo.hasUnreadMessages && (
                                <span className="bg-blue-500 h-3 w-3 rounded-full">...</span>  
                            )}
                        </div>
                    ))
                )}
            </div>
            <div className="w-2/3">
                {activeConversationId ? (
                    <ConversationView conversationId={activeConversationId} />
                ) : (
                    <p className="text-center mt-8">Select a conversation to start chatting</p>
                )}
            </div>
        </div>
    );
};

export default ChatOverview;
