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
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { FaBars, FaTimes } from "react-icons/fa";
import { GrLogout } from "react-icons/gr";
import { BsBell, BsChatDots } from "react-icons/bs";
import { LiaUserFriendsSolid } from "react-icons/lia";
import { GrHomeRounded } from "react-icons/gr";
import logo from "../../assets/images/Icon.png";
import mobileLogo from "../../assets/images/Logo_PNG.png";
import Search from "../Search/Search";

const NavBar = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownOpen2, setDropdownOpen2] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
        console.log("Signed out successfully");
      })
      .catch((error) => console.log("Error Sign Out"));
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

  return (
    <header className="bg-white shadow-sm  w-full top-0 z-50">
      <nav className="grid grid-cols-3 items-center px-5 py-2 bg-white">
        {/* logo and search*/}
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
            {menuOpen ? <FaTimes /> : <FaBars />}
          </span>
        </div>

        {/* navbar*/}
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
                <li className="py-2 px-4 hover:border-b-2 hover:border-[#15CDCA] transition">
                  <Link to="/chats">
                    <BsChatDots size={24} />
                  </Link>
                </li>
                <li
                  onClick={() => setDropdownOpen2(!dropdownOpen2)}
                  className="relative py-2 px-4 cursor-pointer hover:border-b-2 hover:border-[#15CDCA] transition"
                >
                  <BsBell size={24} />
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
                            className="p-2 text-gray-700 hover:bg-gray-100"
                          >
                            {notification.message}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-700 text-center">
                          אין התראות חדשות
                        </div>
                      )}
                    </div>
                  )}
                </li>
                <li
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="relative py-2 px-4 cursor-pointer hover:border-b-2 hover:border-[#15CDCA] transition"
                >
                  <LiaUserFriendsSolid size={24} />
                  {friendRequests.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full text-xs px-1.5">
                      {friendRequests.length}
                    </span>
                  )}
                  {dropdownOpen && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 top-12 w-64 bg-white border rounded-lg shadow-lg z-10">
                      {friendRequests.length > 0 ? (
                        friendRequests.map((request) => (
                          <div
                            key={request.id}
                            className="p-2 text-gray-700 hover:bg-gray-100"
                          >
                            {request.senderName} שלח לך בקשת חברות
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-700 text-center">
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

        {/* profile and logout*/}
        {currentUser && isVerified && (
          <div className="flex items-center justify-end gap-4 col-span-1 md:flex md:items-center md:justify-end ">
            <Link
              to={`/profile/${currentUser.uid}`}
              className="md:flex md:justify-between md:items-center md:gap-2 md:bg-gray-100 md:py-2 md:px-5 md:rounded-[15px]"
            >
              <img
                src={currentUser.profilePicture || "defaultProfilePictureURL"}
                alt="Profile"
                className="w-8 h-8 rounded-full border-[#3E54D3] border"
              />
              <span className="md:block hidden">{currentUser.userName}</span>
            </Link>
            <GrLogout
              onClick={handleLogout}
              className="cursor-pointer"
              size={24}
            />
          </div>
        )}
      </nav>
    </header>
  );
};

export default NavBar;
