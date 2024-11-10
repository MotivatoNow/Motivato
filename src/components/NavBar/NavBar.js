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
import {
  FaBell,
  FaUserFriends,
  FaBars,
  FaTimes,
  FaRocketchat,
  FaHome,
} from "react-icons/fa";
import { GrLogout } from "react-icons/gr";
import logo from "../../assets/images/Icon.png";
import mobileLogo from '../../assets/images/Logo_PNG.png'
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
    <header className="bg-white shadow-md">
      <nav className="flex justify-between items-center px-5 py-2">
        <div className="flex items-center gap-2">
          <img
            className="w-32 cursor-pointer md:flex hidden"
            src={logo}
            alt="Motivato's logo"
            onClick={() => navigate("/")}
          />
          <img
            className="w-12 cursor-pointer md:hidden flex"
            src={mobileLogo}
            alt="Motivato's logo"
            onClick={() => navigate("/")}
          />
          {currentUser && isVerified && <Search />}
        </div>

        {/* Hamburger icon for phones  */}
        <span className="text-3xl cursor-pointer md:hidden z-[10001]" onClick={toggleMenu}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </span>

        <div
          className={`${
            menuOpen ? "left-0" : "-left-full"
          } md:left-0 fixed md:static top-0 md:flex md:flex-row flex-col items-center bg-white md:bg-transparent md:h-5 h-screen w-full md:w-auto transition-all duration-500 ease-in-out z-50`}
        >
          <ul className="flex flex-col md:flex-row items-center gap-4 mt-20 md:mt-0">
            {currentUser && isVerified ? (
              <>
                <li className="py-4  px-5 hover:bg-gray-100 transition rounded-md">
                  <Link to="/feed">
                    <FaHome size={20} />
                  </Link>
                </li>
                <li className="py-4 px-5 hover:bg-gray-100 transition rounded-md">
                  <Link to="/chats">
                    <FaRocketchat size={20} />
                  </Link>
                </li>
                <li
                  onClick={() => setDropdownOpen2(!dropdownOpen2)}
                  className="relative 2 py-4 cursor-pointer px-5 hover:bg-gray-100 transition rounded-md flex items-center"
                >
                  <FaBell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full text-xs px-1.5">
                      {unreadCount}
                    </span>
                  )}
                  {dropdownOpen2 && (
                    <div className="absolute left-0 mt-2 top-10 w-80 bg-white border rounded-lg shadow-lg z-10">
                      {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                          <div key={index} className="p-2 text-gray-700 hover:bg-gray-100">
                            {notification.message}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-700">אין התראות חדשות</div>
                      )}
                    </div>
                  )}
                </li>
                <li
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="relative py-4 cursor-pointer px-5 hover:bg-gray-100 transition rounded-md flex items-center"
                >
                  <FaUserFriends size={20} />
                  {friendRequests.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full text-xs px-1.5">
                      {friendRequests.length}
                    </span>
                  )}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 top-10 w-80 bg-white border rounded-lg shadow-lg z-10">
                      {friendRequests.length > 0 ? (
                        friendRequests.map((request) => (
                          <div key={request.id} className="p-2 text-gray-700 hover:bg-gray-100">
                            {request.senderName} שלח לך בקשת חברות
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-700">אין בקשות חדשות</div>
                      )}
                    </div>
                  )}
                </li>
              </>
            ) : (
              <>
                <li className="py-4 cursor-pointer px-5 hover:bg-gray-100 transition rounded-md">
                  <Link to="/"><FaHome size={20}/></Link>
                </li>
                <li className="py-3 bg-[#4FE0B6] text-[#292B48] px-5 hover:bg-[#15CDCA] transition rounded-md">
                  <Link to="/register">הרשמה</Link>
                </li>
                <li className="py-3 bg-[#4F80E2] text-white px-5 hover:bg-[#3E54D3] transition rounded-md">
                  <Link to="/login">התחברות</Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {currentUser && isVerified && (
          <div className="flex items-center gap-2">
            <Link to={`/profile/${currentUser.uid}`}>
              <img
                src={currentUser.profilePicture || "defaultProfilePictureURL"}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
            </Link>
            <GrLogout onClick={handleLogout} className="cursor-pointer" size={20} />
          </div>
        )}
      </nav>
    </header>
  );
};

export default NavBar;
