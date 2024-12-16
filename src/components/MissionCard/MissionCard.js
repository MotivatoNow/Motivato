import React, { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
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
  const [applications, setApplications] = useState([]);
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

      await addDoc(collection(db, "Applications"), {
        missionId: missions.id,
        userId: currentUser.uid,
        fileUrl: fileUrl,
        timeStamp: getCurrentTimeStamp("LLL"),
      });

      // Reset application state
      setApply(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error during the application process:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const getApplicationsData = async (applications) => {
    return Promise.all(
      applications.docs.map(async (docA) => {
        const applicationData = docA.data();
        const userDoc = await getDoc(doc(db, "Users", applicationData.userId));
        
        return {
          id: docA.id,
          ...applicationData,
          userName: userDoc.exists() ? userDoc.data().userName : "Unknown User",
          userProfilePicture: userDoc.exists()
            ? userDoc.data().profilePicture
            : "defaultProfilePictureURL",
        };
      })
    );
  };

  const getApplications = async (missionId,setApplications) => {
    const applicationsRef = collection(db, "Applications");
    const q = query(applicationsRef, where("missionId", "==", missionId));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const applicationsData = await getApplicationsData(querySnapshot);
      setApplications(applicationsData)
     
    });
    return () => unsubscribe();
  };

  useEffect(() => {
  
    if (missions.id) {
      console.log(missions.id)
      getApplications(missions.id,setApplications);
      console.log(applications)
    }
  }, [missions.id]);
  
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
              className="absolute cursor-pointer text-gray-500 hover:text-blue-600"
            >
              upload file
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
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
        {currentUser.uid === userData.uid && applications.length>0 && (
          <>
            <div>
              <p>Applications ({applications.length})</p>
              {applications.map((application) => (
  <div key={application.id}>
    <img src={application.userProfilePicture} />
    <span>{application.userName}</span>
    <img src={application.fileName}/>
    <i>{application.timeStamp}</i>
  </div>
))}

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
