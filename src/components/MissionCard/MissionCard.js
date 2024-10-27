import React, {useEffect, useState} from "react";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    
} from "firebase/firestore";
import {db} from "../../config/firebase";
import {useAuth} from "../../context/AuthContext";
import ChatPopup from "../ChatPopup/ChatPopup";

const MissionCard = ({missions,user}) => {
    const {currentUser} = useAuth ();
    const [userData, setUserData] = useState (null);
    const [loading, setLoading] = useState (true);
    const [activeChatUser, setActiveChatUser] = useState(null);

    const createConversation = async (participants) => {
        const conversationRef = await addDoc(collection(db, "Conversations"), {
          participants: participants,
          lastMessage: "",
          lastMessageTimestamp: new Date(),
          isGroup: false,
        });
    
        return conversationRef.id;
      };
    
      const getExistingConversation = async (participants) => {
        let user1=participants[0];
        
        if(user1!==currentUser.uid){
          user1=participants[1] 
        }
      const q = query(
        collection(db, "Conversations"),
        where("participants", "array-contains", user1)
      );
    
        const querySnapshot = await getDocs(q);
        console.log(querySnapshot);
        if (!querySnapshot.empty) {
          return querySnapshot.docs[0].id;
        }
    
        return null;
      };
    const handleChatButtonClick = async () => {
        const participants = [currentUser.uid, user.uid];
        
        const existingConversationId = await getExistingConversation(participants);
        
        if (existingConversationId) {
          setActiveChatUser(existingConversationId);
        } else {
          const conversationId = await createConversation(participants);
          setActiveChatUser(conversationId);
        }
      };
    useEffect (() => {
        if (missions && missions.user.uid) {
            const fetchUserData = async () => {
                try {
                    const userDoc = await getDoc (doc (db, "Users", missions.user.uid));
                    if (userDoc.exists ()) {
                        setUserData (userDoc.data ());
                    } else {
                        console.log ("No such user!");
                    }
                } catch (error) {
                    console.error ("Error fetching user data:", error);
                } finally {
                    setLoading (false);
                }
            };
            fetchUserData ();
        }
    }, [missions.user.uid]);



    if (loading) {
        return <div>Loading...</div>;
    }

    if (!userData) {
        return <div>User data not found</div>;
    }

    return (<>
        <div className="post-card">
            <div className="post-header">
                <div className="user-info">
                    <img
                        src={userData.profilePicture || "defaultProfilePictureURL"} // Image de profil
                        alt="Profile"
                        className="user-profile-image"
                    />
                    <div className="user-details">
                        <h3 className="user-name">
                            {userData.firstName ? userData.firstName : "Unknown User"}{" "}
                            {userData.lastName ? userData.lastName : "Unknown User"}
                        </h3>
                        <p className="post-timestamp">{missions.timeStamp}</p>
                    </div>
                </div>
            </div>

            <div className="post-content">
                <h2>{missions.title}</h2>
                <p className="status">{missions.post}</p> {/* Texte de la publication */}
                
            </div>

            <hr/>
            <button onClick={()=>handleChatButtonClick(user.uid)}>Send a message</button>
            <button>Apply</button>
          
        </div>
        {activeChatUser && (
              <>
                <ChatPopup
                  conversationId={activeChatUser}
                  closePopup={() => setActiveChatUser(null)}
                />
              </>
            )}
          
        </>
        
    );
};

export default MissionCard;
