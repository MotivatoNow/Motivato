import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ChatPopup from "../ChatPopup/ChatPopup";
import { MdDeleteOutline } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { deleteMissions, editMission } from "../../hooks/useContentActions";
import ModalEditMission from "../Modal/ModalEditMission/ModalEditMission";
import { loadUser } from "../../hooks/useLoadUsers";
import { handleChatButtonClick } from "../../hooks/useLoadChat";
import {
  getApplications,
  handleApply,
  handleFileChange,
} from "../../hooks/useApply";
import { Link } from "react-router-dom";

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

  // Fetch user data
  useEffect(() => {
    if (missions && missions.user.uid) {
      const fetchUserData = async () => {
        try {
          const user = await loadUser(missions.user.uid, setUserData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    }
  }, [missions.user.uid]);

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
 <div className="card shadow-md rounded-lg p-6 mb-6 max-w-3xl mx-auto transition  bg-base-100">
  <div className="flex items-center justify-between">
    {/* פרטי המשתמש */}
    <div className="flex items-center gap-4">
      <Link to={`/profile/${userData.uid}`}>
        <div className="avatar">
          <div className="w-16 h-16 mask mask-squircle ">
            <img
              src={userData.profilePicture || "defaultProfilePictureURL"}
              alt="Profile"
            />
          </div>
        </div>
      </Link>
      <div>
        <Link to={`/profile/${userData.uid}`}>
          <h3 className="text-lg font-bold text-gray-800">
            {userData.userName || "Unknown User"}
          </h3>
        </Link>
        <p className="text-sm text-gray-500">{missions.timeStamp}</p>
      </div>
    </div>

    {/* אייקונים של עריכה ומחיקה */}
    <div className="flex items-center gap-3 text-gray-600">
      {currentUser.uid === userData.uid && (
        <>
          <MdDeleteOutline
            onClick={() => deleteMissions(missions.id)}
            size={24}
            className="cursor-pointer hover:text-error"
          />
          <CiEdit
            onClick={() => editMission(setIsEditing)}
            size={24}
            className="cursor-pointer hover:text-primary"
          />
          {isEditing && (
            <ModalEditMission
              isOpen={isEditing}
              onClose={() => setIsEditing(false)}
              missions={missions}
              user={currentUser}
            />
          )}
        </>
      )}
      {currentUser.userType === "Admin" && (
        <MdDeleteOutline
          onClick={() => deleteMissions(missions.id)}
          size={24}
          className="cursor-pointer hover:text-error"
        />
      )}
    </div>
  </div>

  {/* תוכן המשימה */}
  <div className="mt-6">
    <h2 className="text-xl font-bold text-gray-800">{missions.title}</h2>
    {missions.education && (
      <p className="mt-3 text-sm text-gray-500 italic">{missions.education}</p>
    )}
    <p className="text-gray-700 mt-3 leading-relaxed">{missions.post}</p>
  </div>

  <div className="divider my-6"></div>

  {/* כפתורים לשליחת הודעה או בקשה */}
  <div className="flex gap-4">
    {currentUser.uid !== missions.user.uid && (
      <>
        <button
          onClick={() =>
            handleChatButtonClick(
              currentUser,
              missions.user,
              setActiveChatUser
            )
          }
          className="p-2 rounded-[5px] bg-[#3E54D3] text-white"
        >
          שליחת הודעה
        </button>
        <button
          onClick={() => setApply(true)}
          className="p-2 bg-[#15CDCA] text-white rounded-[5px]"
        >
          שליחה
        </button>
      </>
    )}
  </div>

  {/* חלון בקשה */}
  {apply && (
    <div className="mt-6">
      <label
        htmlFor="file-upload"
        className="block text-gray-700 font-medium mb-2"
      >
        העלאת קובץ (PDF בלבד):
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".pdf"
        onChange={(e) => handleFileChange(e, setSelectedFile)}
        className="file-input file-input-bordered w-full"
      />
      {selectFile && (
        <p className="mt-2 text-gray-600">קובץ שנבחר: {selectFile.name}</p>
      )}
      <div className="flex gap-4 mt-4">
        <button
          onClick={() =>
            handleApply(selectFile, missions, currentUser, setApply, setSelectedFile)
          }
          className="p-2 rounded-[5px] bg-[#3E54D3] text-white"
        >
          שלח בקשה
        </button>
        <button
          onClick={() => setApply(false)}
          className="p-2 rounded-[5px] bg-[#15CDCA] text-white"
        >
          ביטול
        </button>
      </div>
    </div>
  )}

  {/* בקשות */}
  {currentUser.uid === userData.uid && applications.length > 0 && (
    <div className="mt-8">
      <button
        onClick={() => setShowApplications((prev) => !prev)}
        className="btn btn-outline btn-info w-full"
      >
        בקשות ({applications.length})
      </button>
      {showApplications && (
        <div className="mt-4 bg-base-100 border border-gray-300 rounded-lg shadow p-4 max-h-96 overflow-y-auto">
          {applications.map((application) => (
            <div
              key={application.id}
              className="border border-gray-200 rounded-lg p-4 mb-4"
            >
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-12 h-12 mask mask-squircle">
                    <img src={application.userProfilePicture} alt="User" />
                  </div>
                </div>
                <span className="font-medium text-gray-800">
                  {application.userName}
                </span>
              </div>
              <iframe
                className="w-full h-64 mt-4 border border-gray-300 rounded-md"
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

  {/* פופאפ צ'אט */}
  {activeChatUser && (
    <ChatPopup
      conversationId={activeChatUser}
      closePopup={() => setActiveChatUser(null)}
    />
  )}
</div>

    </>
  );
};

export default MissionCard;
