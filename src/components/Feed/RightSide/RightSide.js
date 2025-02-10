import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link } from "react-router-dom";
import FriendButton from "../../FriendButton/FriendButton";
import {
  loadFollowers,
  loadUser,
  loadUsers,
} from "../../../hooks/useLoadUsers";

const RightSide = () => {
  const { currentUser } = useAuth();
  const [suggestedFollowers, setSuggestedFollowers] = useState([]);
  const [followers, setFollowers] = useState([]);

  // טעינת משתמשים להצעות חברים
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userData = await loadUser(currentUser.uid, () => {});
        if (userData?.followers?.length > 0) {
          await loadFollowers(userData.followers, setFollowers);
        }
        loadUsers(currentUser, setSuggestedFollowers);
      }
    };
    fetchUserData();
  }, [currentUser]);

  return (
    <div className="rounded-lg p-4 shadow bg-white space-y-6 ">
    {/* פרופיל משתמש */}
    <div className="flex flex-col items-center text-center space-y-2">
      <img
        src={currentUser.profilePicture || "https://via.placeholder.com/100"}
        alt="Profile"
        className="w-20 h-20 object-contain rounded-full border-2 shadow"
      />
      <Link to={`/profile/${currentUser.uid}`} className="text-lg font-bold text-gray-800 hover:underline">
        {currentUser.userName}
      </Link>
      <p className="text-sm text-gray-500">{currentUser.studentEducation}</p>
      <div className="divider w-full" />
      <div>
        <p className="font-bold text-gray-700">{followers.length}</p>
        <p className="text-sm text-gray-500">Followers</p>
      </div>
      <div className="divider w-full" />
      <Link
          className="text-[#3E54D3] font-semibold"
          to={`/profile/${currentUser.uid}`}
        >
          הפרופיל שלי
        </Link>
    </div>
  
    {/* הצעות חברים */}
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">הצעות חברות חדשות</h2>
      {suggestedFollowers.length > 0 ? (
        suggestedFollowers.map(
          (user) =>
            user.userType !== "Admin" && user.isVerified && (
              <div
                key={user.uid}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg shadow hover:shadow-md transition"
              >
                <Link to={`/profile/${user.uid}`} className="flex items-center gap-3">
                  <img
                    src={user.profilePicture || "https://via.placeholder.com/50"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border border-primary"
                  />
                  <h3 className="text-md font-medium text-gray-800">
                    {user.userType === "Student" ? user.userName : user.companyName}
                  </h3>
                </Link>
                <FriendButton user={user} />
              </div>
            )
        )
      ) : (
        <p className="text-gray-500 text-center">אין הצעות חברות חדשות</p>
      )}
    </div>
  </div>
  
  );
};

export default RightSide;
