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
import { storage } from "../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";

const MissionCard = ({ missions, user }) => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(user);
  const [loading, setLoading] = useState(true);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [apply, setApply] = useState(false);
  const [selectFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleApply = async () => {
    try {
      if (!selectFile) {
        console.error("No file selected.");
        return;
      }
  
      console.log("Starting file upload...");
      // Upload the file to Firebase Storage
      const fileRef = ref(
        storage,
        `Applications/${missions.id}/${currentUser.uid}/${selectFile.name}`
      );
      await uploadBytes(fileRef, selectFile);
      const fileUrl = await getDownloadURL(fileRef);
  
      if (!fileUrl) {
        throw new Error("Failed to retrieve the file URL after upload.");
      }
  
      console.log("File uploaded successfully. URL:", fileUrl);
  
      // Save the application in Firestore
      console.log("Saving application...");
      await addDoc(collection(db, "Applications"), {
        missionId: missions.id,
        userId: currentUser.uid,
        fileUrl: fileUrl,
        timeStamp: getCurrentTimeStamp("LLL"),
      });
      console.log("Application saved successfully.");
  
      // Check for an existing conversation or create a new one
      const participants = [currentUser.uid, missions.user.uid];
      console.log("Checking for an existing conversation...");
      let conversationId = await getExistingConversation(participants);
  
      if (!conversationId) {
        console.log("No existing conversation found. Creating a new one...");
        conversationId = await createConversation(participants);
        console.log("New conversation created with ID:", conversationId);
      } else {
        console.log("Existing conversation found with ID:", conversationId);
      }
  
      // Send the automatic message
      const messageContent = `Hello, you have a new application for the mission "${missions.title}". 
      Here is the link to the mission: https://localhost:3000/mission/${missions.id}. 
      The application file is available here: ${fileUrl}.
      Automatic message`;
  
      console.log("Sending automatic message...");
      await addDoc(collection(db, `Conversations/${conversationId}/messages`), {
        senderId: currentUser.uid,
        content: messageContent,
        type: "document", // Ensure this is a valid string
        timeStamp: getCurrentTimeStamp("LLL"),
      });
  
      console.log("Message sent successfully.");
  
      // Reset application state
      setApply(false);
      setSelectedFile(null);
      console.log("Application process completed successfully.");
    } catch (error) {
      console.error("Error during the application process:", error);
    }
  };
   
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

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
              src={userData.profilePicture || "defaultProfilePictureURL"}
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
                {isEditing && (
                  <>
                    <ModalEditMission
                      isOpen={isEditing}
                      onClose={() => setIsEditing(false)}
                      missions={missions}
                      user={currentUser}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="post-content">
          <h2>{missions.title}</h2>
          <p className="status">{missions.post}</p>{" "}
        </div>

        <hr />
        <button onClick={() => handleChatButtonClick(user.uid)}>
          Send a message
        </button>
        <button onClick={() => setApply(true)}>Apply</button>
        {apply && (
          <>
            <label
              htmlFor="file-upload"
              className="absolute top-2 left-2 cursor-pointer text-gray-500 hover:text-blue-600"
            >
              upload file
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            {selectFile && <p>{selectFile.name}</p>}
            <div className="flex gap-2">
              <button onClick={() => handleApply()} className="apply-button">
                Submit Application
              </button>
              <button onClick={() => setApply(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          </>
        )}
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
