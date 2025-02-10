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
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import {
  CiEdit,
  CiMail,
  CiSettings,
} from "react-icons/ci";
import { loadFollowers, loadUser } from "../../../hooks/useLoadUsers";
import { Link } from "react-router-dom";
import ModalEditWebsites from "../../Modal/ModalEditProfile/ModalEditWebsites/ModalEditWebsites";
import { FaEarthEurope } from "react-icons/fa6";
import ModalEditBio from "../../Modal/ModalEditProfile/ModalEditBio/ModalEditBio";
import { IoIosContact } from "react-icons/io";
import { loadPostByID } from "../../../hooks/useLoadPosts";
import { FaLinkedinIn } from "react-icons/fa";
const CompanyProfile = ({user, currentUser}) => {
  const [userData, setUserData] = useState(user);
  const [modalOpenEditProfile, setModalOpenEditProfile] = useState(false);
  const [modalOpenEditWebsites, setModalEditWebsites] = useState(false);

  const [modalOpenEditBio, setModalOpenEditBio] = useState(false);
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

// useEffect
   useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await loadUser(user.uid, setUserData);
        if (userData?.followers) {
          await loadFollowers(userData.followers, setFollowers);
        }
        const unsubscribe = loadPostByID(user.uid, (posts) => {
          setAllPosts(posts);
          setPhotos(posts.filter((post) => post.postImage));
        });
        return unsubscribe;
      } catch (error) {
        console.error(error);
      }
    };
    let unsubscribe;
    fetchData().then((cleanup) => (unsubscribe = cleanup));
    return () => {
      unsubscribe?.();
    };
  }, [user.uid]);

  return (
    <>
    <div className="w-full min-h-[10vh] grid md:grid-rows-[1fr_2fr]">
 {/* ROW 1 */}
 <div className="bg-[#FDFDFF] px-5 py-4 grid grid-cols-[3fr_3fr]">
   {/* Col 1 */}
   <div className="flex space-x-4">
     {/* Profile Image */}
     <img
       className="rounded-[5px] cursor-pointer h-48 w-48 shadow-md object-fit p-3"
       src={userData.profilePicture}
       alt={`${userData.userName} profile image`}
       onClick={() => setLightboxOpen(true)}
     />
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
        <h2 className="text-2xl font-semibold">{userData.companyName}</h2>
        <h4 className=" text-gray-400">{userData.userName}</h4>

       

       {/* Student Education
       {userData.studentEducation && userData.studentCollege ? (
         <p className="text-gray-500">
           {userData.studentEducation}, {userData.studentCollege}
         </p>
       ) : (
         currentUser.uid === userData.uid && (
           <p className="text-gray-500">לא הוספת פרטי לימודים עדיין</p>
         )
       )} */}

       {/* Contact */}
       {userData.userName && userData.lastName ? (
         <div className="mt-2 flex items-center">
           <IoIosContact className="ml-2" color="#3E54D3" />
            {userData.firstName} {userData.lastName}
         </div>
       ) : (
         currentUser.uid === userData.uid && (
           <p className="text-gray-500">לא עידכנת  איש קשר</p>
         )
       )}

       {/* Email */}
       {userData.email && (
         <p className="flex items-center">
           <CiMail className="ml-2" color="#3E54D3" />
           {userData.email}
         </p>
       )}
     </div>
   </div>

   {/* Col 2 */}
   <div
     className={`flex flex-col ${
       currentUser.uid === userData.uid
         ? "justify-start items-end"
         : "justify-around items-end"
     }`}
   >
     {currentUser.uid !== userData.uid && (
       <>
         <FriendButton user={user} />
         <ChatButton onClick={() => handleChatButtonClick(userData.uid)} />
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
 </div>

 {/* ROW 2 */}
 <div className="bg-[#C7DAFF15] flex flex-col px-5 py-8">
   <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_1fr]">
     {/* Links */}
     <div className="flex flex-col">
       <h3 className="font-semibold text-gray-800 flex items-center">
         קישורים ברשת
         {currentUser.uid === userData.uid && (
           <button onClick={() => setModalEditWebsites(true)} className="ml-2">
             <CiEdit size={20} />
           </button>
         )}
       </h3>
       {userData.userLinkedin  || userData.userWebsite ? (
         <ul className="mt-2">
           {userData.userLinkedin && (
             <li className="flex items-center mb-2 text-gray-800">
               <FaLinkedinIn className="ml-2 text-[#4F80E270] hover:text-[#4F80E2]" size={20} />
               <a 
      href={userData.userLinkedin.startsWith('http') ? userData.userLinkedin : `http://${userData.userLinkedin}`} 
      target="_blank" 
      rel="companyLinkedin"
    >
      {userData.nameUserLinkedin}
    </a>
             </li>
           )}
           {userData.userWebsite && (
  <li className="flex items-center mb-2 text-gray-800">
    <FaEarthEurope className="ml-2 text-[#4F80E270] hover:text-[#4F80E2]" size={20} />
    <a 
      href={userData.userWebsite.startsWith('http') ? userData.userWebsite : `http://${userData.userWebsite}`} 
      target="_blank" 
      rel="companyWebsite"
    >
      {userData.nameUserWebsite}
    </a>
  </li>
)}

         </ul>
       ) : currentUser.uid === userData.uid ? (
         <p className="text-gray-500">לא הוספת קישורים עדיין</p>
       ) : (
         <p className="text-gray-500">המשתמש לא הוסיף קישורים עדיין</p>
       )}
     </div>

     {/* About */}
     <div className="break-words max-w-full text-gray-800">
  <h3 className="font-semibold flex items-center">
    אודות
    {currentUser.uid === userData.uid && (
      <button onClick={() => setModalOpenEditBio(true)} className="ml-2">
        <CiEdit size={24} />
      </button>
    )}
  </h3>
  {userData.bio ? (
    <p dangerouslySetInnerHTML={{ __html: userData.bio.replace(/\n/g, '<br>') }} />
  ) : currentUser.uid === userData.uid ? (
    <p className="text-gray-500">לא עדכנת את האודות עדיין</p>
  ) : (
    <p className="text-gray-500">המשתמש לא עדכן את האודות עדיין</p>
  )}
</div>

   </div>
 </div>
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
        <ModalEditBio         
         modalOpenEditBio={modalOpenEditBio}
         setModalOpenEditBio={setModalOpenEditBio}
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
  )
}

export default CompanyProfile;  