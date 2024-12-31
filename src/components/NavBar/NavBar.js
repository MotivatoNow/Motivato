import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db, auth } from "../../config/firebase";
import {
  doc,
  getDoc,
  query,
  collection,
  where,
  onSnapshot,
  updateDoc,
  arrayUnion,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { FaBarsStaggered } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import { BsBell, BsChatDots } from "react-icons/bs";
import { LiaUserFriendsSolid } from "react-icons/lia";
import { GrHomeRounded } from "react-icons/gr";
import logo from "../../assets/images/Icon.png";
import mobileLogo from "../../assets/images/Logo_PNG.png";
import Search from "../Search/Search";
import "../../App.css";

const NavBar = () => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [followerRequests, setFollowerRequests] = useState([]);
  const [notfications, setNotifications] = useState([]);
  const { currentUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false); // Managing the dropdown state
  const [dropdownOpen2, setDropdownOpen2] = useState(false); // Managing the dropdown state
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

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

  // Accept friend request
  const handleAccept = async (request) => {
    try {
      const requestDocRef = doc(db, "followerRequests", request.id);

      // Update the status in Firebase to "accepted"
      await updateDoc(requestDocRef, { status: "accepted" });

      // Update the friends list for both users
      await updateDoc(doc(db, "Users", currentUser.uid), {
        followers: arrayUnion(request.senderId),
      });
      await updateDoc(doc(db, "Users", request.senderId), {
        followers: arrayUnion(currentUser.uid),
      });

      // Send a notification to the user who sent the friend request
      const receiverUserDocRef = doc(db, "Users", request.senderId);
      try {
        const docSnap = await getDoc(receiverUserDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // const receiverName = `${data.userName}`;
          console.log(data); //natan    currentUser=elianor
          await newFriendNotification(data.uid, currentUser);
        }
      } catch (e) {
        console.log(e);
      }
    } catch (error) {
      console.error("Error accepting follower request:", error);
    }
  };

  // notification for new friend and adding it to firebase
  const newFriendNotification = async (newFriendId, acceptedUser) => {
    const notification = {
      postUser: newFriendId,
      newFollowerId: acceptedUser.uid,
      newFollowerName: acceptedUser.userName,
      // acceptedUser.type === "student"
      //   ? `${acceptedUser.userName}` //to student name
      //   : `${acceptedUser.companyName}`, // to company name
      type: "new follower",
      newFollowerProfilePicture: acceptedUser.profilePicture,
    };
    const notificationsRef = addDoc(
      collection(db, "Notifications"),
      notification
    )
      .then((res) => {
        console.log("Document has been added succesfully");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Reject friend request
  const handleReject = async (request) => {
    try {
      const requestDocRef = doc(db, "followerRequests", request.id);
      await updateDoc(requestDocRef, { status: "rejected" });
    } catch (error) {
      console.error("Error rejecting follower request:", error);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if(toggleDropdown) clearNotifications()
    setDropdownOpen(!dropdownOpen);
    if (dropdownOpen2) setDropdownOpen2(!dropdownOpen2);
  };
  // Toggle dropdown
  const toggleDropdown2 = () => {
    setDropdownOpen2(!dropdownOpen2);
    if (dropdownOpen) setDropdownOpen(!dropdownOpen);
  };
  const clearNotifications = async () => {
    try {
      const q = query(
        collection(db, "Notifications"),
        where("postUser", "==", currentUser.uid)
      );

      setNotifications([]); //Clear the notification in the local state
      console.log("Notifications cleared!");
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const handleNotificationClick = () => {
    toggleDropdown2(); // close or open the dropdown

    if (unreadCount > 0) {
      //update from unread to reade
      notfications.forEach(async (notification) => {
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
    const checkVerification = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "Users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsVerified(userData.isVerified);
        }
      }
    };

    checkVerification();
  }, [currentUser]);

  //**useEffect 2 for friend Request
  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, "followerRequests"),
        where("receiverId", "==", currentUser.uid),
        where("status", "==", "pending")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFollowerRequests(requests);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  //useEffect 3 for Notification
  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, "Notifications"),
        where("postUser", "==", currentUser.uid)
      );

      const unsubscribe = onSnapshot(q, (docSnapshot) => {
        const allNotifications = docSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(allNotifications);

        // עדכון מספר ההתראות שלא נקראו (לדוגמה: אם כל התראות חדשות)
        const unread = allNotifications.filter(
          (notification) => !notification.read
        ).length;

        setUnreadCount(unread);
      });

      return () => unsubscribe();
    }
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
          const conversation = docSnapshot.data();
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

  //*useEffect 5 for User
  useEffect(() => {
    if (currentUser) {
      const singleQuery = query(
        collection(db, "Notifications"),
        where("postUser", "==", currentUser.uid)
      );

      const unsubscribe = onSnapshot(singleQuery, async (response) => {
        const notificationsData = [];
        for (const docN of response.docs) {
          const notificationData = docN.data();
          let userDoc;
          if (
            notificationData.type === "comment" &&
            notificationData.postUser === currentUser.uid
          ) {
            userDoc = await getDoc(
              doc(db, "Users", notificationData.commentId)
            );
          } else if (
            notificationData.type === "like" &&
            notificationData.postUser === currentUser.uid
          ) {
            userDoc = await getDoc(doc(db, "Users", notificationData.likeId));
          } else if (notificationData.type === "new follower") {
            userDoc = await getDoc(
              doc(db, "Users", notificationData.newFollowerId)
            );
          } else {
            userDoc = await getDoc(doc(db, "Users", notificationData.user));
          }
          const userName = userDoc.exists()
            ? `${userDoc.data().firstName} ${userDoc.data().lastName}`
            : "Unknown User";
          const userProfilePicture = userDoc.exists()
            ? userDoc.data().profilePicture
            : "defaultProfilePictureURL";

          notificationsData.push({
            id: docN.id,
            ...notificationData,
            userName,
            userProfilePicture,
          });
        }
        setNotifications(notificationsData);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  //End of useEffect

  return (
    <header className="bg-white shadow-sm w-full top-0 z-50">
      <nav className="grid grid-cols-3 items-center px-5 py-2 bg-white">
        {/* Logo and Search */}
        <div className="flex items-center gap-1">
          <Link to={currentUser && isVerified ? `/feed` : `/`}>
            <img
              className="w-32 cursor-pointer md:flex hidden"
              src={logo}
              alt="Motivato's logo"
            />
          </Link>
          <Link to={currentUser && isVerified ? `/feed` : `/`}>
            <img
              className="w-12 cursor-pointer md:hidden flex"
              src={mobileLogo}
              alt="Motivato's logo"
            />
          </Link>
          {currentUser && isVerified && <Search />}
        </div>

        {/* Hamburger icon */}
        <div className="md:hidden flex justify-end col-span-1">
          <span
            className="text-3xl cursor-pointer z-[10001]"
            onClick={toggleMenu}
          >
            {menuOpen ? <FaTimes /> : <FaBarsStaggered />}
          </span>
        </div>

        {/* Navbar */}
        <div
          className={`${
            menuOpen ? "top-[60px]" : "-top-full"
          } fixed left-0 md:relative md:top-0 w-full bg-white md:bg-transparent md:h-auto h-auto transition-all duration-500 ease-in-out z-40 md:z-0 col-span-3 md:col-span-1`}
        >
          <ul className="flex flex-row md:flex-row items-center justify-evenly gap-3 md:gap-14 mt-4 md:mt-0 py-4 md:py-0 border-t md:border-t-0">
            {currentUser && isVerified ? (
              <>
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
                      {notfications.length > 0 ? (
                        notfications.map((notification, index) => (
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
                                    alt={`${notfications.newFollowerName}`}
                                  />
                                  {notification.newFollowerName} אישר/ה את בקשת
                                  החברות שלך
                                </Link>
                                <hr />
                              </>
                            )}
                            {/* mission */}
                            {notification.type === "new Mission" && (
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
                                onClick={() => handleAccept(request)}
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
              </>
            ) : (
              <>
                <li className="py-2 px-4 hover:bg-gray-100 transition rounded-md">
                  <Link to="/">
                    <GrHomeRounded size={24} />
                  </Link>
                </li>
                <li className="py-2 bg-[#4FE0B6] text-[#292B48] px-5 hover:bg-[#15CDCA] transition rounded-md">
                  <Link to="/register">הרשמה</Link>
                </li>
                <li className="py-2 bg-[#4F80E2] text-white px-5 hover:bg-[#3E54D3] transition rounded-md">
                  <Link to="/login">התחברות</Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Profile and logout */}
        {currentUser && isVerified && (
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
                  <hr className="w-44 border-t border-gray-200 my-2"/>
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
        )}
      </nav>
    </header>
  );
};

export default NavBar;
