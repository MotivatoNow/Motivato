import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import ChatPopup from "../ChatPopup/ChatPopup";
import { MdDeleteOutline } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { deleteMissions, editMission } from "../../hooks/useContentActions";
import ModalEditMission from "../Modal/ModalEditMission/ModalEditMission";

const MissionCard = ({ missions, user }) => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(user);
  const [loading, setLoading] = useState(true);
  const [activeChatUser, setActiveChatUser] = useState(null);
const [isEditing,setIsEditing]=useState(false)

  //conversation
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
    let user1 = participants[0];

    if (user1 !== currentUser.uid) {
      user1 = participants[1];
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

  //useEffect
  useEffect(() => {
    if (missions && missions.user.uid) {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "Users", missions.user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            console.log("No such user!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    }
  }, [missions.user.uid]);
  //console.log(missions)
  //console.log(user.uid)

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>User data not found</div>;
  }

  return (
    <>
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
                {userData.userName ? userData.userName : "Unknown User"}
              </h3>
              <p className="post-timestamp">{missions.timeStamp}</p>
            </div>
            {currentUser.uid === userData.uid && (
              <div className="flex gap-3">
                <MdDeleteOutline
                  onClick={() => deleteMissions(missions.id)}
                  size={20}
                />
                <CiEdit onClick={() => editMission(setIsEditing)} size={20} />
                {isEditing && (<>
                  <ModalEditMission
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    missions={missions}
                    user={currentUser}
                  /></>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="post-content">
          <h2>{missions.title}</h2>
          <p className="status">{missions.post}</p>{" "}
          {/* Texte de la publication */}
        </div>

        <hr />
        <button onClick={() => handleChatButtonClick(user.uid)}>
          Send a message
        </button>
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
