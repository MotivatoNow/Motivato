import React, { useEffect, useMemo, useState } from "react";
import ChatButton from "../../ChatButton/ChatButton";
import FriendButton from "../../FriendButton/FriendButton";
import MyPost from "../../MyPost/MyPost";
import PostCard from "../../PostCard/PostCard";
import ModalEditProfileComponent from "../../Modal/ModalEditProfile/ModalEditProfile";
import ChatPopup from "../../ChatPopup/ChatPopup";
import {
  addDoc,
  arrayRemove,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { AiOutlineClose } from "react-icons/ai"
import {
  CiCircleQuestion,
  CiEdit,
  CiLinkedin,
  CiLocationOn,
  CiMail,
  CiSettings,
} from "react-icons/ci";
import { loadData, loadFollowers } from "../../../hooks/useLoadUsers";
import { Link } from "react-router-dom";
import ModalEditWebsites from "../../Modal/ModalEditProfile/ModalEditWebsites/ModalEditWebsites";
import ModalEditSkills, { handleDeleteSkillFromStudent } from "../../Modal/ModalEditProfile/ModalEditSkills/ModalEditSkills";
import { message } from "antd";

const StudentProfile = ({ user, id, currentUser }) => {
  const [userData, setUserData] = useState(user);
  const [skills, setSkills] = useState([]); // מיומנויות
  const [modalOpenEditProfile, setModalOpenEditProfile] = useState(false);
  const [modalOpenEditWebsites, setModalEditWebsites] = useState(false);
  const [modalOpenEditSkills, setModalOpenEditSkills] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [isLightboxOpen, setLightboxOpen] = useState(false);

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
  const userRef = doc(db, "Users", id);
  const unsubscribe = onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      setUserData(snapshot.data());
      setSkills(snapshot.data().skills || []); // עדכון המיומנויות
      if (snapshot.data()?.followers) {
        loadFollowers(snapshot.data().followers, setFollowers); // טעינת עוקבים
      }
    } else {
      console.warn("Document does not exist!");
    }
  });

  return () => unsubscribe(); // ניקוי המאזין
}, [id]);

const handleDeleteSkillFromStudent = async (skill) => {
  try {
    const userRef = doc(db, "Users", user.uid);
    await updateDoc(userRef, {
      skills: arrayRemove(skill),
    });

    // עדכון הסטייט המקומי
    setSkills((prev) => prev.filter((s) => s !== skill));
    message.success("מיומנות נמחקה בהצלחה");
  } catch (error) {
    console.error("Error removing skill: ", error);
    message.error("שגיאה בעת מחיקת מיומנות");
  }
};

  return (
    <>
      <div className="w-full  min-h-screen grid md:grid-rows-[1fr_3fr]">
        {/* ROW 1 */}
        <div
          className="bg-[#FDFDFF] px-5 py-2 grid grid-cols-[3fr_3fr]"
          style={{}}
        >
          {/* Col 1 */}
          <div className="flex space-x-4">
            {/* Profile Image */}
            <img
              className="rounded-[5px] cursor-pointer h-48 w-48 shadow-md object-cover "
              src={userData.profilePicture}
              alt={`${userData.userName} profile image`}
              onClick={() => setLightboxOpen(true)}
            />
            {/* Lightbox */}
            {isLightboxOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                onClick={() => setLightboxOpen(false)}
              >
                <img
                  className="rounded-[5px] max-h-[90vh] max-w-[90vw] object-contain"
                  src={userData.profilePicture}
                  alt={`${userData.userName} profile image enlarged`}
                />
              </div>
            )}

            {/* Profile Info */}
            <div className="flex flex-col px-3">
              {/* Name */}
              <h1 className="text-2xl font-semibold">{userData.userName}</h1>

              {/* Student Education */}
              <p className="text-gray-500">
                {userData.studentEducation}, {userData.studentCollege}
              </p>

              {/* Location and Additional Info */}
              <div className="mt-2 flex flex-col md:flex-row md:justify-between">
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
                <div className="flex flex-col text-gray-600 mt-4 md:mt-0 md:mr-10">
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
                className="flex md:items-center md:justify-center just md:bg-[#4F80E2] md:text-white px-4 py-2 rounded-[5px]"
                onClick={() => setModalOpenEditProfile(true)}
              >
                <CiSettings className="md:right-0 right-10 md:bottom-0 bottom-2 md:left-4 relative md:text-white text-[#4F80E2] text-[2em] mr-0 sm:mr-2" />
                <span className="hidden md:inline">הגדרות</span>
              </button>
            )}
          </div>
        </div>{" "}
        {/* End of row 1 */}
        {/* ROW 2 */}
        <div className="bg-gray-50 flex  flex-col px-5 py-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr_2fr]">
            {/* Col 1 */}
            <div className="flex flex-col">
              <h3 className="font-semibold flex items-center text-gray-800 ">
                קישורים ברשת{" "}
                <span>
                  <button onClick={() => setModalEditWebsites(true)}>
                    <CiEdit size={20} />
                  </button>
                </span>
              </h3>
              <ul className="mt-2">
                <li className="flex items-center mb-2 text-gray-800">
                  <CiLinkedin className="ml-2" size={20} color="#3e54d3" />
                  <a
                    className="text-blue-700 font-semibold"
                    href={userData.userLinkedin}
                  >
                    {userData.nameUserLinkedin}
                  </a>
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

            {/* Col 2 */}
            <div className="break-words max-w-full whitespace-pre-wrap overflow-hidden text-gray-800">
              <h3 className="text-gray-800 font-semibold flex items-center">
                אודות{" "}
                <span>
                  <button>
                    <CiEdit size={20} />
                  </button>
                </span>
              </h3>
              <p className="py-2">{userData.bio}</p>
            </div>

            {/* Col 3 */}
            <div>
            <h3 className="text-gray-800 font-semibold flex items-center">
        מיומנויות וכישורים{" "}
        <span>
          <button onClick={() => setModalOpenEditSkills(true)}>
            <CiEdit size={20} />
          </button>
        </span>
      </h3>

      {/* הצגת המיומנויות */}

<ul className="flex flex-wrap justify-center gap-4 mt-4">
  {skills.length > 0 ? (
    skills.map((skill, index) => (
      <li
        key={index}
        className=" text-gray-700 font-semibold flex items-center justify-evenly  px-4 py-4 rounded-md bg-[#15CDCA13] shadow-sm"
      >
        {skill}
        {/* אייקון מחיקה */}
        <button
          onClick={() => handleDeleteSkillFromStudent(skill)}
          className=" text-red-500 hover:text-red-700"
        >
          <AiOutlineClose size={16} />
        </button>
      </li>
    ))
  ) : (
    <p className="text-gray-500">אין מיומנויות להצגה</p>
  )}
</ul>

            </div>
          </div>
        </div>
        {/*End Of row 2 */}
      </div>

      <div className="min-h-screen w-full grid gap-2 grid-rows-[auto_1fr] md:grid-cols-[1fr_2fr] p-3">
        <div className="mt-5 max-h-[50vh] overflow-hidden w-full grid gap-2 grid-rows-[auto,auto]">
          {/* Followers/Friends Section */}
          <section className="bg-white p-3 rounded-[5px] max-h-[30vh] overflow-hidden">
            <h3 className="font-semibold mb-3">עוקבים/חברים</h3>
            <div className="grid grid-cols-3 gap-1">
              {followers.slice(0, 9).map((follower) => (
                <Link to={`/profile/${follower.uid}`} key={follower.uid}>
                  <div
                    key={follower.id}
                    className="text-center flex flex-col items-center space-y-2"
                  >
                    <img
                      src={follower.profilePicture || "/default-profile.png"}
                      alt={follower.userName}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <span className="text-gray-800 text-sm font-medium">
                      {follower.userName}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {followers.length > 9 && (
              <button className="mt-4 text-blue-600 hover:underline text-sm font-medium">
                הצג עוד חברים
              </button>
            )}
          </section>
          <section className="bg-white p-3 rounded-[5px] max-h-[50vh] overflow-hidden">
            <h3 className="font-semibold mb-3">תמונות</h3>
            {photos.length > 0 ? (
              photos.map((post) => (
                <div
                  key={post.id}
                  className="text-center flex flex-col p-5 space-y-2"
                >
                  <img
                    key={post.id}
                    src={post.postImage}
                    alt={`${userData.firstName} profile `}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                </div>
              ))
            ) : (
              <p>למשתמש אין תמונות</p>
            )}
          </section>
        </div>

        {/* Posts Section */}
        <section
          className={`${
            currentUser.uid === user.uid ? "" : "mt-2"
          } flex justify-start`}
        >
          <div className="">
            {currentUser.uid === user.uid && (
              <>
                <MyPost />
              </>
            )}
            {allPosts.map((post) => (
              <div key={post.id}>
                <PostCard posts={post} user={currentUser} />
              </div>
            ))}
          </div>
        </section>
        {/* Modal Component */}
        <ModalEditProfileComponent
          modalOpenEditProfile={modalOpenEditProfile}
          setModalOpenEditProfile={setModalOpenEditProfile}
          setUser={setUserData}
          user={currentUser}
        />
        <ModalEditWebsites
          modalOpenEditWebsites={modalOpenEditWebsites}
          setModalEditWebsites={setModalEditWebsites}
          setUser={setUserData}
          user={currentUser}
        />
         <ModalEditSkills
          modalOpenEditSkills={modalOpenEditSkills}
          setModalOpenEditSkills={setModalOpenEditSkills}
          setUser={setUserData}
          user={currentUser}
        />
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
