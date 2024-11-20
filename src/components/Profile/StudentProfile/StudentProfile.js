import React, { useEffect, useMemo, useState } from "react";
import ChatButton from "../../ChatButton/ChatButton";
import FriendButton from "../../FriendButton/FriendButton";
import MyPost from "../../MyPost/MyPost";
import PostCard from "../../PostCard/PostCard";
import ModalEditProfileComponent from "../../Modal/ModalEditProfile/ModalEditProfile";
import ChatPopup from "../../ChatPopup/ChatPopup";
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
import { db } from "../../../firebase";

import {
  CiCircleQuestion,
  CiLinkedin,
  CiLocationOn,
  CiMail,
  CiSettings,
} from "react-icons/ci";
import { loadData, loadFollowers } from "../../../hooks/useLoadUsers";

const StudentProfile = ({ user, id,currentUser }) => {
  const [userData, setUserData] = useState(user);
  const [modalOpen, setModalOpen] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [followers, setFollowers] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);

  // Chat

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

  // Posts

  const fetchUserPosts = async () => {
    const q = query(collection(db, "Posts"), where("user.uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const postsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAllPosts(postsData);
    const photos = postsData.filter((post) => post.postImage);
    setPhotos(photos);
  };

  useMemo(() => {
    fetchUserPosts();
  }, [user.uid]);

  // useEffect
  useEffect(() => {
    fetchUserPosts();
  }, user.uid);

  useEffect(() => {
    const userRef = doc(db, "Users", userData.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      setUserData(snapshot.data());
    });
    if (userData && userData.followers) {
      loadFollowers(userData.followers, setFollowers);
    }
    return () => unsubscribe();
  }, [user.uid,userData]);
  // followers

  return (
    <>
  
      <div className="w-full min-h-screen grid grid-rows-[1fr_2fr]">
        {/* ROW 1 */}
        <div className="bg-[#FDFDFF] px-5 py-2 grid grid-cols-[3fr_3fr]">
          {/* Col 1 */}
          <div className="flex space-x-4">
            {/* Profile Image */}
            <img
              className="rounded-[5px] h-48 w-48 shadow-md object-cover "
              src={userData.profilePicture}
              alt={`${userData.userName} profile image`}
            />
            {/* Profile Info */}
            <div className="flex flex-col px-3">
              {/* Name */}
              <h1 className="text-2xl font-semibold">{userData.userName}
              

              </h1>

              {/* Student Education */}
              <p className="text-gray-500">
                {userData.studentEducation}, {userData.studentCollege}
              </p>

              {/* Location and Additional Info */}
              <div className="mt-2 flex justify-between">
                {/* Location and Email */}
                <div className="flex flex-col">
                  {/* Location */}
                  <p className="flex items-center">
                    <CiLocationOn className="ml-2" color="#3E54D3" />{" "}
                    {userData.location}
                  </p>
                  {/* Email */}
                  <p className="flex items-center">
                    <CiMail className="ml-2" color="#3E54D3" /> {userData.email}
                  </p>
                </div>

                {/* Additional Info */}
                <div className="flex flex-col text-gray-600 mr-10">
                  {/* Line 1 */}
                  <p className="flex items-center">
                    <CiCircleQuestion className="ml-2" color="#3E54D3" /> לחשוב
                    מה לשים פה
                  </p>
                  {/* Line 2 */}
                  <p className="flex items-center">
                    <CiCircleQuestion className="ml-2" color="#3E54D3" /> לחשוב
                    מה לשים פה
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Col 2 */}
          <div
            className={`flex flex-col  ${
              currentUser.uid === userData.uid
                ? "justify-start items-end"
                : "justify-around items-end"
            }`}
          >
            {currentUser.uid !== userData.uid && (
              <>
                <FriendButton user={user} />
                <ChatButton
                  onClick={() => handleChatButtonClick(userData.uid)}
                />
              </>
            )}

            {currentUser.uid === userData.uid && (
              <button
                className="flex items-center justify-between bg-[#4F80E2] text-white px-4 py-2 rounded-[5px]"
                onClick={() => setModalOpen(true)}
              >
                <CiSettings className="mr-2" /> הגדרות
              </button>
            )}
          </div>
        </div>{" "}
        {/* End of row 1 */}
        {/* ROW 2 */}
        <div className="bg-gray-50 flex flex-col px-5 py-8 space-x-4">
          <div className="grid grid-cols-[3fr_3fr_3fr] gap-4">
            {/* עמודה 1 */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-gray-800">קישורים ברשת</h3>
              <ul className="mt-2">
                <li className="flex items-center mb-2 text-gray-800">
                  <CiLinkedin className="ml-2" size={20} color="#3e54d3" />
                  {userData.userLinkedin}
                </li>
                <li className="flex items-center mb-2 text-gray-800">
                  <CiLinkedin className="ml-2" size={20} color="#3e54d3" />
                  {userData.userGitHub}
                </li>
                <li className="flex items-center mb-2 text-gray-800">
                  <CiLinkedin className="ml-2" size={20} color="#3e54d3" />
                  {userData.userWebsite}
                </li>
              </ul>
            </div>

            {/* עמודה 2 */}
            <div className="break-words max-w-full whitespace-pre-wrap overflow-hidden text-gray-800">
              <h3 className="text-gray-800 font-semibold">אודות</h3>
              <p className="py-2">{userData.bio}</p>
            </div>

            {/* עמודה 3 */}
            <div>
              <p>3</p>
            </div>
          </div>
        </div>
        {/*End Of row 2 */}
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

export default StudentProfile;
