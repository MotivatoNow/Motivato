import React, { useEffect, useState } from "react";
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
  const [showApplications, setShowApplications] = useState(false);

  // Conversation creation logic
  const createConversation = async (participants) => {
    const conversationRef = await addDoc(collection(db, "Conversations"), {
      participants: [participants[0],participants[1]],
      lastMessage: "",
      lastMessageTimestamp: new Date(),
      isGroup: false,
    });

    return conversationRef.id;
  };

  const getExistingConversation = async (participants) => {
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

  const handleChatButtonClick = async () => {
    const participants = [currentUser.uid, missions.user.uid];

    const existingConversationId = await getExistingConversation(participants);
    console.log(existingConversationId)
    if (existingConversationId) {
      setActiveChatUser(existingConversationId);
    } else {
      const conversationId = await createConversation(participants);
      setActiveChatUser(conversationId);
    }
  };

  // Fetch user data
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

  // Handle file application
  const handleApply = async () => {
    try {
      if (!selectFile) {
        console.error("No file selected.");
        return;
      }

      // Upload file to Firebase Storage
      const fileRef = ref(
        storage,
        `Applications/${missions.id}/${currentUser.uid}/${selectFile.name}`
      );
      await uploadBytes(fileRef, selectFile);
      const fileUrl = await getDownloadURL(fileRef);

      if (!fileUrl) {
        throw new Error("Failed to retrieve the file URL after upload.");
      }
      console.log(selectFile.name);

      await addDoc(collection(db, "Applications"), {
        missionId: missions.id,
        userId: currentUser.uid,
        fileUrl: fileUrl,
        fileName: selectFile.name,
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
    if (file && file.type !== "application/pdf") {
      console.error("Only PDF files are allowed.");
      alert("Please select a valid PDF file.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  // Fetch applications
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

  const getApplications = async (missionId, setApplications) => {
    const applicationsRef = collection(db, "Applications");
    const q = query(applicationsRef, where("missionId", "==", missionId));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const applicationsData = await getApplicationsData(querySnapshot);
      setApplications(applicationsData);
    });
    return () => unsubscribe();
  };

  useEffect(() => {
    if (missions.id) {
      getApplications(missions.id, setApplications);
    }
  }, [missions.id]);

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (!userData) {
    return <div className="text-center text-red-500">User data not found</div>;
  }

  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        {/* Post Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={userData.profilePicture || "defaultProfilePictureURL"}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-lg text-gray-800">
                {userData.userName ? userData.userName : "Unknown User"}
              </h3>
              <p className="text-sm text-gray-500">{missions.timeStamp}</p>
            </div>
          </div>
          {currentUser.uid === userData.uid && (
            <div className="flex gap-3">
              <MdDeleteOutline
                onClick={() => deleteMissions(missions.id)}
                size={20}
                className="text-500 cursor-pointer"
              />
              <CiEdit
                onClick={() => editMission(setIsEditing)}
                size={20}
                className="text-500 cursor-pointer"
              />
              {isEditing && (
                <ModalEditMission
                  isOpen={isEditing}
                  onClose={() => setIsEditing(false)}
                  missions={missions}
                  user={currentUser}
                />
              )}
            </div>
          )}
          {currentUser.userType === "Admin" && (
            <div className="flex gap-3">
              <MdDeleteOutline
                onClick={() => deleteMissions(missions.id)}
                size={20}
                className="text-500 cursor-pointer"
              />
            </div>
          )}
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-bold text-gray-800">{missions.title}</h2>
          <p className="text-gray-600 mt-2">{missions.post}</p>
        </div>

        <hr className="my-4" />

        <div className="flex gap-4">
          {currentUser.uid !== missions.user.uid && (
            <>
              <button
                onClick={() => handleChatButtonClick(missions.user.uid)}
                className="px-4 py-2 rounded"
              >
                Send a message
              </button>
              <button
                onClick={() => setApply(true)}
                className="px-4 py-2 rounded"
              >
                Apply
              </button>
            </>
          )}
        </div>

        {apply && (
          <div className="mt-4">
            <label
              htmlFor="file-upload"
              className="block text-gray-700 font-medium"
            >
              Upload File (PDF only):
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="mt-2 border border-gray-300 rounded p-2 w-full"
            />
            {selectFile && (
              <p className="mt-2 text-gray-600">
                Selected file: {selectFile.name}
              </p>
            )}
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleApply()}
                className="px-4 py-2 rounded"
              >
                Submit Application
              </button>
              <button
                onClick={() => setApply(false)}
                className="px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {currentUser.uid === userData.uid && applications.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowApplications((prev) => !prev)}
              className="font-medium text-gray-700 bg-gray-100 py-2 px-4 rounded-lg shadow-sm hover:bg-gray-200 transition"
            >
              Applications ({applications.length})
            </button>
            {showApplications && (
              <div className="mt-4 border border-gray-300 rounded-lg shadow-lg bg-white p-4 max-h-96 overflow-y-auto">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="border border-gray-200 rounded-lg p-4 mb-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={application.userProfilePicture}
                        alt="User"
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="font-medium text-gray-800">
                        {application.userName}
                      </span>
                    </div>
                    <iframe
                      className="w-full h-64 mt-4 border border-gray-300"
                      src={application.fileUrl}
                      title={application.fileName}
                    ></iframe>
                    <p className="text-sm text-gray-500 mt-2">
                      {application.timeStamp}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {activeChatUser && (
        <ChatPopup
          conversationId={activeChatUser}
          closePopup={() => setActiveChatUser(null)}
        />
      )}
    </>
  );
};

export default MissionCard;
