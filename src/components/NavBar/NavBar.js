import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db, auth } from "../../config/firebase";
import {
  doc,
  query,
  collection,
  where,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { FaBarsStaggered } from "react-icons/fa6";
import { FaBars, FaTimes } from "react-icons/fa";
import { BsBell, BsChatDots } from "react-icons/bs";
import { LiaUserFriendsSolid } from "react-icons/lia";
import { GrHomeRounded } from "react-icons/gr";
import logo from "../../assets/images/Icon.png";
import mobileLogo from "../../assets/images/Logo_PNG.png";
import Search from "../Search/Search";
import "../../App.css";
import { clearNotifications, loadNotifications } from "../../hooks/useLoadNotifications";
import { handleAccept, handleReject, loadFollowerRequest } from "../../hooks/useLoadFollowerRequest";
import { checkVerification } from "../../hooks/useLoadUsers";


const NavBar = () => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [followerRequests, setFollowerRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false); // Managing the dropdown state
  const [dropdownOpen2, setDropdownOpen2] = useState(false); // Managing the dropdown state
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
    const [toggle, setToggle] = useState(false);
    const handleClick = () => setToggle(!toggle);

  const [isDropdownOpenProfile, setDropdownOpenProfile] = useState(false);

  const toggleDropdownProfile = () => {
    setDropdownOpenProfile(!isDropdownOpenProfile);
  };

  //function that toggle the hamburger menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  //logout function for quit from user.
  const handleLogout = async () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
        console.log("Signed out successfully");
      })
      .catch((error) => console.log("Error Sign Out"));
  };


  
  // Toggle dropdown
  const toggleDropdown = () => {
    if (toggleDropdown) clearNotifications(currentUser,setNotifications);
    setDropdownOpen(!dropdownOpen);
    if (dropdownOpen2) setDropdownOpen2(!dropdownOpen2);
  };
  // Toggle dropdown
  const toggleDropdown2 = () => {
    setDropdownOpen2(!dropdownOpen2);
    if (dropdownOpen) setDropdownOpen(!dropdownOpen);
  };

  const handleNotificationClick = () => {
    toggleDropdown2(); // close or open the dropdown

    if (unreadCount > 0) {
      //update from unread to reade
      notifications.forEach(async (notification) => {
        if (!notification.read) {
          const notificationRef = doc(db, "Notifications", notification.id);
          await updateDoc(notificationRef, { read: true });
        }
      });

      // reset the count for 0
      setUnreadCount(0);
    }
  };

  //useEffect
  //**useEffect 1 for check verification if the user have an access and got verified.
  useEffect(() => {
    checkVerification(currentUser,setIsVerified);
    loadNotifications(currentUser,setNotifications,setUnreadCount)
    if (currentUser) loadFollowerRequest(currentUser,setFollowerRequests)
  }, [currentUser]);

  //useEffect 4 for conversations
  useEffect(() => {
    if (!currentUser) return;
    const fetchUnreadMessage = () => {
      const converationRef = collection(db, "Conversations");
      const q = query(
        converationRef,
        where("participants", "array-contains", currentUser.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        let totalUnread = 0;

        snapshot.docs.forEach((docSnapshot) => {
          const messagesRef = collection(
            db,
            `Conversations/${docSnapshot.id}/messages`
          );
          const messagesQuery = query(
            messagesRef,
            where("isRead", "==", false)
          );

          onSnapshot(messagesQuery, (messageSnapshot) => {
            const unreadMessages = messageSnapshot.docs.filter((msg) => {
              const data = msg.data();
              return data.author !== currentUser.uid && !data.isRead;
            });
            totalUnread += unreadMessages.length;
            setUnreadMessages(totalUnread);
          });
        });
      });

      return () => unsubscribe();
    };

    fetchUnreadMessage();
  }, [currentUser]);


  //End of useEffect

  return (
    <>


<header className="w-full h-[80px] bg-white border-b">
      <nav className="md:max-w-[1480px] max-w-[600px] m-auto w-full h-full flex justify-between items-center md:px-0 px-4">
        {/* Logo and search bar */}
       <div className="flex gap-5">
       <Link to={"/feed"}>
          <img src={logo} className="h-[36px]" />
        </Link>
        <Search/>
       </div>
        {/* List */}
        <div className="hidden md:flex items-center ">
          
          <ul className="flex gap-4">
          <li className="bg-gray-100 py-2 px-8 rounded-[10px] hover:border-b-2 hover:border-[#15CDCA] transition">
                  <Link to="/feed">
                    <GrHomeRounded color="#3E54D3" size={24} />
                  </Link>
                </li>
                <li className="relative py-2 px-4 cursor-pointer hover:border-b-2 hover:border-[#15CDCA] transition">
                  <Link to="/chats">
                    <div className="relative">
                      <BsChatDots size={24} />
                      {unreadMessages > 0 && (
                        <span className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadMessages}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
                {/* Notification icon (the bell) */}
                <li
                  onClick={() => setDropdownOpen2(!dropdownOpen2)}
                  className="relative py-2 px-4 cursor-pointer hover:border-b-2 hover:border-[#15CDCA] transition"
                >
                  <BsBell size={24} onClick={handleNotificationClick} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full text-xs px-1.5">
                      {unreadCount}
                    </span>
                  )}
                  {dropdownOpen2 && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 top-12 w-64 bg-white border rounded-lg shadow-lg z-10">
                      {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            {/*notification type*/}
                            {/* comment */}
                            {notification.type === "comment" && (
                              <>
                                <Link
                                  className="flex mb-2 items-center gap-2"
                                  to={`/post/${notification.postId}`}
                                >
                                  <img
                                    className="w-10 h-10 rounded-full"
                                    src={
                                      notification.userProfilePicture ||
                                      "defaultProfilePictureURL"
                                    } // הצגת תמונת המשתמש הנכונה מהתגובה
                                    alt={`${users.userName}`}
                                  />
                                  {`${notification.commentName} הוסיף תגובה לפוסט שלך`}
                                </Link>
                                <hr />
                              </>
                            )}
                            {/* Like */}
                            {notification.type === "like" && (
                              <>
                                <Link
                                  className="flex mb-2 items-center gap-2"
                                  to={`/post/${notification.postId}`}
                                >
                                  <img
                                    className="w-10 h-10 rounded-full"
                                    src={
                                      notification.userProfilePicture ||
                                      "defaultProfilePictureURL"
                                    } // הצגת תמונת המשתמש הנכונה מהתגובה
                                    alt={`${users.userName}`}
                                  />
                                  {`${notification.likeName} אהב את הפוסט שלך`}
                                </Link>
                                <hr />
                              </>
                            )}
                            {/* friend */}
                            {notification.type === "new follower" && (
                              <>
                                <Link
                                  className="flex mb-2 items-center gap-2"
                                  to={`/profile/${notification.newFollowerId}`}
                                >
                                  <img
                                    className="w-10 h-10 rounded-full"
                                    src={
                                      notification.newFollowerProfilePicture ||
                                      "defaultProfilePictureURL"
                                    } // הצגת תמונת המשתמש הנכונה מהתגובה
                                    alt={`${notifications.newFollowerName}`}
                                  />
                                  {notification.newFollowerName} אישר/ה את בקשת
                                  החברות שלך
                                </Link>
                                <hr />
                              </>
                            )}
                            {/* mission */}
                            {notification.type === "Application" && (
                              <>
                                <Link
                                  className="flex mb-2 items-center gap-2"
                                  to={`/mission/${notification.missionId}`}
                                >
                                  <img
                                    className="w-10 h-10 rounded-full"
                                    src={
                                      notification.userProfilePicture ||
                                      "defaultProfilePictureURL"
                                    } // הצגת תמונת המשתמש הנכונה מהתגובה
                                    alt={`${users.userName}`}
                                  />
                                  {notification.postUserName} הוסף משימה:
                                  {notification.missionTitle}
                                </Link>
                                <hr />
                              </>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-700 text-center">
                          אין התראות חדשות
                        </div>
                      )}
                    </div>
                  )}
                </li>{" "}
                {/*End of the notification icon  */}
                {/* friend request icon */}
                <li
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="relative py-2 px-4 cursor-pointer hover:border-b-2 hover:border-[#15CDCA] transition"
                >
                  <LiaUserFriendsSolid size={24} onClick={toggleDropdown} />
                  {followerRequests.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full text-xs px-1.5">
                      {followerRequests.length}
                    </span>
                  )}
                  {dropdownOpen && (
                    <div className="absolute right-2 top-[40%] mt-2 w-80 bg-white border rounded-lg shadow-lg z-10">
                      {followerRequests.length > 0 ? (
                        followerRequests.map((request) => (
                          <div
                            key={request.id}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            <p className="flex items-center gap-2">
                              <img
                                className="w-8 h-8 rounded-full"
                                src={request.senderPicture}
                                alt={request.senderFirstName}
                              />
                              {request.senderUserName} שלח לך בקשת חברות
                            </p>
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                onClick={() => handleAccept(request,currentUser)}
                              >
                                אישור
                              </button>
                              <button
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                onClick={() => handleReject(request)}
                              >
                                דחייה
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-700">
                          אין בקשות חדשות
                        </div>
                      )}
                    </div>
                  )}
                </li>
          </ul>
        </div>

        <div className="hidden md:flex">
          {/* Profile and Logout */}
        <div className="flex items-center cursor-pointer justify-end gap-4 col-span-1 md:flex md:items-center md:justify-end ">
            <div
              onClick={toggleDropdownProfile}
              className="md:flex relative md:justify-between md:items-center md:gap-2 md:bg-gray-100 md:py-2 md:px-5 md:rounded-[15px]"
            >
              <img
                src={currentUser.profilePicture || "defaultProfilePictureURL"}
                alt="Profile"
                className="w-8 h-8 rounded-full border-[#3E54D3] border"
              />
              <span className="md:block hidden">{currentUser.userName}</span>
              {isDropdownOpenProfile && (
                <div className="absolute flex flex-col items-center justify-center left-0 top-10 mt-2 bg-white shadow-lg rounded-md py-2 w-48">
                  <Link
                    to={`/profile/${currentUser.uid}`}
                    className=" px-4 py-2 text-sm text-[#3E54D3] font-medium"
                  >
                    כניסה לפרופיל
                  </Link>
                  <hr className="w-44 border-t border-gray-200 my-2" />
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 font-semibold text-sm text-gray-700"
                  >
                    התנתקות
                  </button>
                </div>
              )}
            </div>
          </div>
        </div> {/*End of Profile and Logout*/}

        <div className="md:hidden" onClick={() => setToggle(!toggle)}>
          {toggle ? <FaTimes size={24} /> : <FaBars size={24} />}
        </div>
      </nav>

      <div
        className={
          toggle
            ? "absolute  z-10 p-4  bg-white w-full px-8 md:hidden border-b"
            : "hidden"
        }
      >
        <ul className="flex justify-evenly">
        <li className="bg-gray-100 py-2 px-8 rounded-[10px] hover:border-b-2 hover:border-[#15CDCA] transition">
                  <Link to="/feed">
                    <GrHomeRounded color="#3E54D3" size={24} />
                  </Link>
                </li>
                <li className="relative py-2 px-4 cursor-pointer hover:border-b-2 hover:border-[#15CDCA] transition">
                  <Link to="/chats">
                    <div className="relative">
                      <BsChatDots size={24} />
                      {unreadMessages > 0 && (
                        <span className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadMessages}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
                {/* Notification icon (the bell) */}
                <li
                  onClick={() => setDropdownOpen2(!dropdownOpen2)}
                  className="relative py-2 px-4 cursor-pointer hover:border-b-2 hover:border-[#15CDCA] transition"
                >
                  <BsBell size={24} onClick={handleNotificationClick} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full text-xs px-1.5">
                      {unreadCount}
                    </span>
                  )}
                  {dropdownOpen2 && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 top-12 w-64 bg-white border rounded-lg shadow-lg z-10">
                      {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            {/*notification type*/}
                            {/* comment */}
                            {notification.type === "comment" && (
                              <>
                                <Link
                                  className="flex mb-2 items-center gap-2"
                                  to={`/post/${notification.postId}`}
                                >
                                  <img
                                    className="w-10 h-10 rounded-full"
                                    src={
                                      notification.userProfilePicture ||
                                      "defaultProfilePictureURL"
                                    } // הצגת תמונת המשתמש הנכונה מהתגובה
                                    alt={`${users.userName}`}
                                  />
                                  {`${notification.commentName} הוסיף תגובה לפוסט שלך`}
                                </Link>
                                <hr />
                              </>
                            )}
                            {/* Like */}
                            {notification.type === "like" && (
                              <>
                                <Link
                                  className="flex mb-2 items-center gap-2"
                                  to={`/post/${notification.postId}`}
                                >
                                  <img
                                    className="w-10 h-10 rounded-full"
                                    src={
                                      notification.userProfilePicture ||
                                      "defaultProfilePictureURL"
                                    } // הצגת תמונת המשתמש הנכונה מהתגובה
                                    alt={`${users.userName}`}
                                  />
                                  {`${notification.likeName} אהב את הפוסט שלך`}
                                </Link>
                                <hr />
                              </>
                            )}
                            {/* friend */}
                            {notification.type === "new follower" && (
                              <>
                                <Link
                                  className="flex mb-2 items-center gap-2"
                                  to={`/profile/${notification.newFollowerId}`}
                                >
                                  <img
                                    className="w-10 h-10 rounded-full"
                                    src={
                                      notification.newFollowerProfilePicture ||
                                      "defaultProfilePictureURL"
                                    } // הצגת תמונת המשתמש הנכונה מהתגובה
                                    alt={`${notifications.newFollowerName}`}
                                  />
                                  {notification.newFollowerName} אישר/ה את בקשת
                                  החברות שלך
                                </Link>
                                <hr />
                              </>
                            )}
                            {/* mission */}
                            {notification.type === "Application" && (
                              <>
                                <Link
                                  className="flex mb-2 items-center gap-2"
                                  to={`/mission/${notification.missionId}`}
                                >
                                  <img
                                    className="w-10 h-10 rounded-full"
                                    src={
                                      notification.userProfilePicture ||
                                      "defaultProfilePictureURL"
                                    } // הצגת תמונת המשתמש הנכונה מהתגובה
                                    alt={`${users.userName}`}
                                  />
                                  {notification.postUserName} הוסף משימה:
                                  {notification.missionTitle}
                                </Link>
                                <hr />
                              </>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-700 text-center">
                          אין התראות חדשות
                        </div>
                      )}
                    </div>
                  )}
                </li>{" "}
                {/*End of the notification icon  */}
                {/* friend request icon */}
                <li
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="relative py-2 px-4 cursor-pointer hover:border-b-2 hover:border-[#15CDCA] transition"
                >
                  <LiaUserFriendsSolid size={24} onClick={toggleDropdown} />
                  {followerRequests.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full text-xs px-1.5">
                      {followerRequests.length}
                    </span>
                  )}
                  {dropdownOpen && (
                    <div className="absolute right-2 top-[40%] mt-2 w-80 bg-white border rounded-lg shadow-lg z-10">
                      {followerRequests.length > 0 ? (
                        followerRequests.map((request) => (
                          <div
                            key={request.id}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            <p className="flex items-center gap-2">
                              <img
                                className="w-8 h-8 rounded-full"
                                src={request.senderPicture}
                                alt={request.senderFirstName}
                              />
                              {request.senderUserName} שלח לך בקשת חברות
                            </p>
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                onClick={() => handleAccept(request,currentUser)}
                              >
                                אישור
                              </button>
                              <button
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                onClick={() => handleReject(request)}
                              >
                                דחייה
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-700">
                          אין בקשות חדשות
                        </div>
                      )}
                    </div>
                  )}
                </li>
          <div className="flex flex-col my-4 gap-4">
          <div className="">
          {/* Profile and Logout */}
        <div className="flex items-center cursor-pointer justify-end gap-4 col-span-1 md:flex md:items-center md:justify-end ">
            <div
              onClick={toggleDropdownProfile}
              className="md:flex relative md:justify-between md:items-center md:gap-2 md:bg-gray-100 md:py-2 md:px-5 md:rounded-[15px]"
            >
              <img
                src={currentUser.profilePicture || "defaultProfilePictureURL"}
                alt="Profile"
                className="w-8 h-8 rounded-full border-[#3E54D3] border"
              />
              <span className="md:block hidden">{currentUser.userName}</span>
              {isDropdownOpenProfile && (
                <div className="absolute flex flex-col items-center justify-center left-0 top-10 mt-2 bg-white shadow-lg rounded-md py-2 w-48">
                  <Link
                    to={`/profile/${currentUser.uid}`}
                    className=" px-4 py-2 text-sm text-[#3E54D3] font-medium"
                  >
                    כניסה לפרופיל
                  </Link>
                  <hr className="w-44 border-t border-gray-200 my-2" />
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 font-semibold text-sm text-gray-700"
                  >
                    התנתקות
                  </button>
                </div>
              )}
            </div>
          </div>
        </div> {/*End of Profile and Logout*/}

          </div>
        </ul>
      </div>
    </header>









































































    </>
  );
};

export default NavBar;
