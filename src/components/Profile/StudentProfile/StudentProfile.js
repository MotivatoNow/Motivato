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

const StudentProfile = ({ user, currentUser }) => {
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

    return () => unsubscribe();
  }, [user.uid]);
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
              <h1 className="text-2xl font-semibold">{userData.userName}</h1>

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
        </div>{/*End Of row 2 */}
      </div>

      <div className="profile-page">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="bg-white p-4 flex flex-col">
            <div className="sidebar-content">
              <div className="profile-picture">
                <img src={userData.profilePicture} alt="Profile" />
              </div>
            </div>
            <div className="profile-info">
              <h2 className="profile-name">
                {userData.userName}
                {currentUser.uid !== userData.uid && (
                  <>
                    <ChatButton
                      onClick={() => handleChatButtonClick(userData.uid)}
                    />
                  </>
                )}
              </h2>
              <p className="profile-location">
                <i className="fa fa-map-marker-alt"></i>{" "}
                {userData.location || "Location"}
              </p>
              <p className="profile-gander">
                <i className="fa fa-solid fa-male"></i>{" "}
                {userData.userGender || ""}
              </p>
              <p className="profile-relationship">
                <i className="fa fa-solid fa-heart"></i>{" "}
                {userData.relationship || ""}
              </p>
              <p className="profile-github">
                <i className=""></i> {userData.userGitHub || ""}
              </p>
              <p className="profile-website">
                <i className=""></i> {userData.userWebsite || ""}
              </p>
            </div>
            <div className="profile-details">
              <div className="profile-section education-section">
                <h4>Education</h4>
                <p>
                  {userData.studentEducation || "No information"},{" "}
                  {userData.studentCollege || "No college/university"}
                </p>
              </div>
              <div className="profile-section contact-section">
                <h4>Contact</h4>
                <p>
                  <i className="fa fa-envelope"></i> {userData.email}
                </p>
              </div>
              {currentUser.uid === userData.uid ? (
                <button
                  className="settings-btn"
                  onClick={() => setModalOpen(true)}
                >
                  Settings
                </button>
              ) : (
                <FriendButton user={user} />
              )}
            </div>
          </aside>

          {/* Main Profile Section */}
          <main className="profile-main">
            <header className="profile-header">
              {currentUser.uid === userData.uid ? (
                <></>
              ) : (
                <div className="header-title">
                  <h2>
                    שלום,
                    {currentUser.userType === "Student" ? (
                      <>
                        {currentUser.firstName} {currentUser.lastName}
                      </>
                    ) : (
                      <> {currentUser.companyName} </>
                    )}
                  </h2>
                </div>
              )}
              <nav className="profile-nav">
                <ul>
                  <li
                    className={activeTab === "posts" ? "active" : ""}
                    onClick={() => setActiveTab("posts")}
                  >
                    Posts
                  </li>
                  <li
                    className={activeTab === "about" ? "active" : ""}
                    onClick={() => setActiveTab("about")}
                  >
                    About
                  </li>
                  <li
                    className={activeTab === "friends" ? "active" : ""}
                    onClick={() => setActiveTab("friends")}
                  >
                    Followers({followers.length})
                  </li>
                  <li
                    className={activeTab === "photos" ? "active" : ""}
                    onClick={() => setActiveTab("photos")}
                  >
                    Photos
                  </li>
                </ul>
              </nav>
            </header>

            {activeTab === "posts" && (
              <section className="profile-content">
                {currentUser.uid === userData.uid && (
                  <div className="my-post">
                    <MyPost />
                  </div>
                )}

                <section className="profile-posts">
                  <h3>Recent Posts</h3>
                  <div className="feed-post">
                    {allPosts.map((post) => (
                      <div key={post.id}>
                        <PostCard posts={post} user={currentUser} />
                      </div>
                    ))}
                  </div>
                </section>
              </section>
            )}

            {activeTab === "about" && (
              <section className="profile-content">
                <h3>About Me</h3>
                <p>{userData.bio}</p>
              </section>
            )}

            {activeTab === "followers" && (
              <section className="profile-content">
                <h3>Followers {followers.length}</h3>
                {followers.length > 0 ? (
                  <div className="friend-list">
                    {followers.map((follower) => (
                      <div key={follower.id} className="follower-item">
                        <img
                          src={
                            follower.profilePicture || "/default-profile.png"
                          }
                          alt={follower.firstName}
                          className="follower-avatar"
                        />
                        <span>{follower.userName}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No followers found.</p>
                )}
              </section>
            )}

            {activeTab === "photos" && (
              <section className="profile-content">
                <h3>Photos</h3>
                <div className="user-photos">
                  {photos.length > 0 ? (
                    photos.map((post) => (
                      <img
                        key={post.id}
                        src={post.postImage}
                        alt={`${userData.firstName} profile `}
                        className="user-photo"
                      />
                    ))
                  ) : (
                    <p>No photos found.</p>
                  )}
                </div>
              </section>
            )}
          </main>

          {/* Modal Component */}
          <ModalEditProfileComponent
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            setUser={setUserData}
            user={currentUser}
          />
        </div>
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
