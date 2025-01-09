import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

const conversationColl = collection(db, "Conversations");
export const createConversation = async (participants) => {
  const conversationRef = await addDoc(conversationColl, {
    participants: [participants[0], participants[1]],
    lastMessage: "",
    lastMessageTimestamp: new Date(),
    isGroup: false,
  });

  return conversationRef.id;
};

export const getExistingConversation = async (participants, currentUser) => {
  const q = query(
    collection(db, "Conversations"),
    where("participants", "array-contains", currentUser.uid)
  );
  const querySnapshot = await getDocs(q);
  const conversation = querySnapshot.docs.find((doc) => {
    const conversationParticipants = doc.data().participants;
    return (
      conversationParticipants.includes(participants[0]) &&
      conversationParticipants.includes(participants[1])
    );
  });
  return conversation ? conversation.id : null;
};

export const handleChatButtonClick = async (
  currentUser,
  user,
  setActiveChatUser
) => {
  const participants = [currentUser.uid, user.uid];

  const existingConversationId = await getExistingConversation(
    participants,
    currentUser
  );
  console.log(existingConversationId);
  if (existingConversationId) {
    setActiveChatUser(existingConversationId);
  } else {
    const conversationId = await createConversation(participants);
    setActiveChatUser(conversationId);
  }
};

export const loadConversations = async (
  conversationId,
  setMessages,
  markMessagesAsRead,
  currentUser,
  setParticipants
) => {
  if (!conversationId) return;

  const conversationRef = doc(db, "Conversations", conversationId);

  const messagesRef = collection(
    db,
    `Conversations/${conversationId}/messages`
  );
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedMessages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setMessages(fetchedMessages);
    markMessagesAsRead(fetchedMessages,conversationId,currentUser);
  });

  return () => unsubscribe();
};

export  const markMessagesAsRead=async(fetchedMessages,conversationId,currentUser)=>{

        const unreadMessages=fetchedMessages.filter((message)=>message.author!==currentUser.uid &&!message.isRead)
        for(const message of unreadMessages){
            const messageRef=doc(db,`Conversations/${conversationId}/messages`,message.id)
            updateDoc(messageRef,{isRead:true})
        }
    }

export const sendMessage = async (conversationId,newMessage,currentUser,setNewMessage) => {
        if (newMessage.trim() === '') return;

        try {

            const messageRef = collection(db, `Conversations/${conversationId}/messages`);
            await addDoc(messageRef, {
                author: currentUser.uid,
                content: newMessage,
                timestamp: new Date(),
                type: 'text',
                isRead:false
            });

            await updateDoc(doc(db, "Conversations", conversationId), {
                lastMessage: newMessage,
                lastMessageTimestamp: new Date(),
            });

        } catch (error) {
            console.error("Error sending message: ", error);
        }
        setNewMessage('');
    };

export const fetchConversationData = async (
  conversationId,
  unsubscribe,
  setMessages,
  currentUser,
  setParticipants
) => {
  if (!conversationId) return;

  try {
    unsubscribe = await loadConversations(
      conversationId,
      setMessages,
      markMessagesAsRead,
      currentUser
    );

    const conversationDoc = await getDoc(doc(db, "Conversations", conversationId));
    if (!conversationDoc.exists()) {
      console.error("Conversation not found.");
      setParticipants([]); 
      return;
    }

    const participants = conversationDoc.data().participants;

    const usersData = [];
    for (const participantId of participants) {
      const userRef = doc(db, "Users", participantId);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        usersData.push({ id: participantId, ...userSnapshot.data() });
      }
    }

    setParticipants(usersData);
  } catch (error) {
    console.error("Error fetching conversation data: ", error);
    setParticipants([]);
  }
};
