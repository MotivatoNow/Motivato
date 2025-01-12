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
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6 max-w-3xl mx-auto transition hover:shadow-xl">
        
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <img
              src={userData.profilePicture || "defaultProfilePictureURL"}
              alt="Profile"
              className="w-14 h-14 rounded-full border border-gray-300"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {userData.userName || "Unknown User"}
              </h3>
              <p className="text-sm text-gray-500">{missions.timeStamp}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-gray-600">
            {currentUser.uid === userData.uid && (
              <>
                <MdDeleteOutline
                  onClick={() => deleteMissions(missions.id)}
                  size={24}
                  className="cursor-pointer hover:text-red-500"
                />
                <CiEdit
                  onClick={() => editMission(setIsEditing)}
                  size={24}
                  className="cursor-pointer hover:text-gray-700"
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
                className="cursor-pointer hover:text-red-500"
              />
            )}
          </div>
        </div>

        
        <div className="mt-6">
          <h2 className="text-xl font-bold text-gray-800">{missions.title}</h2>
          <p className="text-gray-700 mt-3 leading-relaxed">{missions.post}</p>
          {missions.education && (
            <p className="mt-3 text-sm text-gray-600 italic">
              {missions.education}
            </p>
          )}
        </div>

        
        <hr className="my-6 border-gray-200" />

        
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
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg shadow-sm hover:bg-gray-200 transition"
              >
                Send a Message
              </button>
              <button
                onClick={() => setApply(true)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg shadow-sm hover:bg-gray-200 transition"
              >
                Apply
              </button>
            </>
          )}
        </div>

        
        {apply && (
          <div className="mt-6">
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
              onChange={(e) => handleFileChange(e, setSelectedFile)}
              className="mt-2 block w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-gray-200"
            />
            {selectFile && (
              <p className="mt-2 text-gray-600">
                Selected file: {selectFile.name}
              </p>
            )}
            <div className="flex gap-4 mt-4">
              <button
                onClick={() =>
                  handleApply(
                    selectFile,
                    missions,
                    currentUser,
                    setApply,
                    setSelectedFile
                  )
                }
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg shadow-sm hover:bg-gray-200 transition"
              >
                Submit Application
              </button>
              <button
                onClick={() => setApply(false)}
                className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        
        {currentUser.uid === userData.uid && applications.length > 0 && (
          <div className="mt-8">
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
                        className="w-12 h-12 rounded-full"
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
