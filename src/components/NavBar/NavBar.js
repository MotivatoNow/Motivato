import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import {
  FaBell,
  FaUserFriends,
  FaBars,
  FaTimes,
  FaRocketchat,
} from "react-icons/fa";
import logo from "../../assets/images/Icon.png";
import Search from "../Search/Search";
import { notification } from "antd";

const NavBar = () => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [notfications, setNotifcations] = useState([]);
  const { currentUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false); // Managing the dropdown state
  const [dropdownOpen2, setDropdownOpen2] = useState(false); // Managing the dropdown state
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [users, setUsers] = useState([]);

  const onToggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
        console.log("Signed out successfully");
      })
      .catch((error) => {
        console.log("Error Sign Out");
      });
  };

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

  // Listening for friend requests
  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, "friendRequests"),
        where("receiverId", "==", currentUser.uid),
        where("status", "==", "pending")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(requests)
        setFriendRequests(requests);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

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
        setNotifcations(allNotifications);

        // עדכון מספר ההתראות שלא נקראו (לדוגמה: אם כל התראות חדשות)
        const unread = allNotifications.filter(
          (notification) => !notification.read
        ).length;
        setUnreadCount(unread);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  // Accept friend request
  const handleAccept = async (request) => {
    try {
      const requestDocRef = doc(db, "friendRequests", request.id);

      // Update the status in Firebase to "accepted"
      await updateDoc(requestDocRef, { status: "accepted" });

      // Update the friends list for both users
      await updateDoc(doc(db, "Users", currentUser.uid), {
        friends: arrayUnion(request.senderId),
      });
      await updateDoc(doc(db, "Users", request.senderId), {
        friends: arrayUnion(currentUser.uid),
      });

      // Send a notification to the user who sent the friend request
      const receiverUserDocRef = doc(db, "Users", request.senderId);
      try {
        const docSnap = await getDoc(receiverUserDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const receiverName = `${data.firstName} ${data.lastName}`;
          console.log(data); //natan    currentUser=elianor
          await newFriendNotification(data.uid, currentUser);
        }
      } catch (e) {
        console.log(e);
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };
  const newFriendNotification = async (newFriendId, acceptedUser) => {
    const notification = {
      postUser: newFriendId, 
      newFriendId: acceptedUser.uid, 
      newFriendName: `${acceptedUser.userName}`, //elianor.fullName
      type: "new friend",
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
      const requestDocRef = doc(db, "friendRequests", request.id);
      await updateDoc(requestDocRef, { status: "rejected" });
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
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

      setNotifcations([]); // ריקון ההתראות ב-state המקומי
      console.log("Notifications cleared!");
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const handleNotificationClick = () => {
    toggleDropdown2(); // פותח/סוגר את ה-dropdown

    if (unreadCount > 0) {
      // עדכון של כל ההתראות שלא נקראו לסטטוס של 'נקרא'
      notfications.forEach(async (notification) => {
        if (!notification.read) {
          const notificationRef = doc(db, "Notifications", notification.id);
          await updateDoc(notificationRef, { read: true });
        }
      });

      // איפוס ה-count המקומי
      setUnreadCount(0);
    }
  };
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

          if (notificationData.type === "comment") {
            userDoc = await getDoc(
              doc(db, "Users", notificationData.commentId)
            );
          } else if (notificationData.type === "like") {
            userDoc = await getDoc(doc(db, "Users", notificationData.likeId));
          } else if (notificationData.type === "new friend") {
            userDoc = await getDoc(
              doc(db, "Users", notificationData.newFriendId)
            );
          } else {
            userDoc = await getDoc(doc(db, "Users", notificationData.user));
          }

          const userName = userDoc.exists()
            ? `${userDoc.data().firstName} ${userDoc.data().lastName}`
            : "Unknown User";
          const userProfilePicture = userDoc.exists()
            ? userDoc.data().profilePicture
            : "defaultProfilePictureURL"; // Default picture if not available

          notificationsData.push({
            id: docN.id,
            ...notificationData,
            userName,
            userProfilePicture,
          });
        }
        setNotifcations(notificationsData); // Set notifications with user info
      });
      

      return () => unsubscribe(); // Clean up listener
    }
  }, [currentUser]);

  return (
    <>
      <header className="bg-white w-[100%] z-50">
        <nav className=" flex mx-auto justify-between items-center w-[92%] py-3 ">
          <div className="flex items-center gap-3">
            <img className="w-32 cursor-pointer" src={logo} alt="LOGO ICON" />
            {/* תפריט הניווט */}
            <div
              className={`nav-links duration-500 md:static absolute bg-white md:min-h-fit ${
                currentUser && isVerified ? "min-h-[20vh]" : "min-h-[90vh]"
              } md:w-auto left-0 ${
                menuOpen ? "top-14" : "top-[-150%]"
              } w-[40%] flex flex-col gap-3 items-center px-5`}
            >
              <ul className="flex md:flex-row flex-col md:items-center md:gap-[4vw] gap-8">
                {currentUser && isVerified ? (
                  <>
                    <a
                      className="nav-link active"
                      aria-current="page"
                      href=""
                      onClick={() => handleNavigation("/feed")}
                    >
                      דף הבית
                    </a>
                  </>
                ) : (
                  <>
                    <li>
                      <a
                        className="hover:text-gray-500 cursor-pointer text-[#292B48]"
                        href="#"
                      >
                        דף הבית
                      </a>
                    </li>
                    <li>
                      <a
                        className="hover:text-gray-500 cursor-pointer text-[#292B48]"
                        href="#"
                      >
                        אודות
                      </a>
                    </li>
                    <li>
                      <a
                        className="hover:text-gray-500 cursor-pointer text-[#292B48]"
                        href="#"
                      >
                        שירותים
                      </a>
                    </li>
                    <li>
                      <a
                        className="hover:text-gray-500 cursor-pointer text-[#292B48]"
                        href="#"
                      >
                        צור קשר
                      </a>
                    </li>
                  </>
                )}
              </ul>
              {!currentUser && !isVerified && (
                <>
                  <div className="gap-3 flex md:hidden">
                    <button
                      type="button"
                      onClick={() => handleNavigation("/register")}
                      className="bg-[#4FE0B6] text-[#292B48] p-2 rounded-lg hover:bg-[#15CDCA] duration-500"
                    >
                      הרשמה
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigation("/login")}
                      className="bg-[#4F80E2] text-white p-2 rounded-lg hover:bg-[#3E54D3] duration-500"
                    >
                      התחברות
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {currentUser && isVerified ? (
            <>
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-8 ">
                  <FaRocketchat
                    className="text-xl cursor-pointer"
                    onClick={() => navigate("/chats")}
                  />
                  {/* כפתור התראות */}
                  <div className="relative flex flex-col items-center">
                    <FaBell
                      className="text-xl cursor-pointer hover:text-gray-600"
                      onClick={handleNotificationClick}
                    />

                    {/* הצגת מספר ההתראות שלא נקראו */}
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full text-xs px-1.5">
                        {unreadCount}
                      </span>
                    )}
                    {dropdownOpen2 && (
                      <div className="absolute left-[50%] mt-2 top-[40%] w-80 bg-white border rounded-lg shadow-lg z-10">
                        {notfications.length > 0 ? (
                          notfications.map((notification, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                              {/* סוג ההתראה */}
                              {notification.type === "comment" && (
                                <>
                                  <Link
                                    className="flex mb-2 items-center gap-2"
                                    to={`/post/${notification.postId}`}
                                  >
                                    <img
                                      className="comment-user-image"
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
                              {notification.type === "like" && (
                                <>
                                  <Link
                                    className="flex mb-2 items-center gap-2"
                                    to={`/post/${notification.postId}`}
                                  >
                                    <img
                                      className="comment-user-image"
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
                              {notification.type === "new friend" && (
                                <>
                                  <Link
                                    className="flex mb-2 items-center gap-2"
                                    to={`/profile/${notification.newFriendId}`}
                                  >
                                    <img
                                      className="comment-user-image"
                                      src={
                                        notification.userProfilePicture ||
                                        "defaultProfilePictureURL"
                                      } // הצגת תמונת המשתמש הנכונה מהתגובה
                                      alt={`${users.userName}`}
                                    />
                                    {notification.newFriendName} אישר/ה את בקשת
                                    החברות שלך
                                  </Link>
                                  <hr />
                                </>
                              )}
                              {notification.type === "new Mission" && (
                                <>
                                  <Link
                                    className="flex mb-2 items-center gap-2"
                                    to={`/mission/${notification.missionId}`}
                                  >
                                    <img
                                      className="comment-user-image"
                                      src={
                                        notification.userProfilePicture ||
                                        "defaultProfilePictureURL"
                                      } // הצגת תמונת המשתמש הנכונה מהתגובה
                                      alt={`${users.userName}`}
                                    />
                                    {notification.userName} הוסף משימה:{notification.missionTitle}
                                  </Link>
                                  <hr />
                                </>
                                
                              )}
                              
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-700">
                            אין התראות חדשות
                          </div>
                        )}
                      </div>
                    )}
                    <span className="text-sm text-gray-600 mt-1">התראות</span>
                  </div>

                  {/* כפתור בקשות חברות */}
                  <div className="relative flex flex-col items-center">
                    <FaUserFriends
                      className="text-xl text-[#4F80E2] cursor-pointer hover:text-gray-600"
                      onClick={toggleDropdown}
                    />
                    {friendRequests.length > 0 && (
                      <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full text-xs px-1.5">
                        {friendRequests.length}
                      </span>
                    )}
                    {dropdownOpen && (
                      <div className="absolute right-2 top-[40%] mt-2 w-80 bg-white border rounded-lg shadow-lg z-10">
                        {friendRequests.length > 0 ? (
                          friendRequests.map((request) => (
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
                                {request.senderuserName} שלח לך בקשת חברות
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
                    <span className="text-sm text-gray-600 mt-1">
                      בקשות חברות
                    </span>
                  </div>
                </div>
              </div>
              <Search />

              <div className="flex gap-3 items-center">
                <span>שלום {`${currentUser.userName}`}</span>
                <span className="bg-[#4FE0B6] text-[#292B48] p-3 rounded-lg hover:bg-[#15CDCA] duration-500">
                  <Link to={`/profile/${currentUser.uid}`}>לפרופיל</Link>
                </span>

                <button
                  className="bg-[#4F80E2] text-white p-3 rounded-lg hover:bg-[#3E54D3] duration-500"
                  onClick={handleLogout}
                >
                  התנתקות
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-6 ">
              <div className="hidden gap-6 md:flex">
                <button
                  type="button"
                  onClick={() => handleNavigation("/register")}
                  className="bg-[#4FE0B6] text-[#292B48] p-3 rounded-lg hover:bg-[#15CDCA] duration-500"
                >
                  הרשמה
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigation("/login")}
                  className="bg-[#4F80E2] text-white p-3 rounded-lg hover:bg-[#3E54D3] duration-500"
                >
                  התחברות
                </button>
              </div>
            </div>
          )}
          {/* אייקון התפריט */}
          <span
            className="text-3xl cursor-pointer md:hidden z-50"
            onClick={onToggleMenu}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </span>
        </nav>
      </header>
    </>
  );
};

export default NavBar;
