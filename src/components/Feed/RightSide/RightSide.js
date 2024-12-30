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
        if (userData?.followers) {
          loadFollowers(currentUser.followers, setFollowers);
        }

        loadUsers(currentUser, setSuggestedFollowers);
      }
    };
    fetchUserData();
  }, [currentUser]);

  return (
    <div className="rounded-lg p-2 mt-5 mr-4">
      <div className="rounded-lg bg-white p-2 items-center flex justify-center flex-col gap-1 space-x-4">
        <img
          src={currentUser.profilePicture || "defaultProfilePictureURL"}
          alt="Profile"
          className="w-16 h-16 rounded-full object-cover ml-1 border border-[#3E54D3]"
        />
        <div>
          <Link to={`/profile/${currentUser.slug}`}>
            <h3 className="text-lg font-semibold text-gray-800">
              {currentUser.userName}
            </h3>
          </Link>
        </div>
        <p className="text-gray-500">{currentUser.studentEducation}</p>
        <hr className="w-full border-t border-gray-200 my-2" />
        <div className="flex justify-center items-center flex-col">
          <p className="text-gray-600 font-bold">{followers.length}</p>
          <p className="text-gray-400 font-semibold">Followers</p>
        </div>
        <hr className="w-full border-t border-gray-200 my-2" />
        <Link
          className="text-[#3E54D3] font-semibold"
          to={`/profile/${currentUser.slug}`}
        >
          הפרופיל שלי
        </Link>
      </div>

      {/* הצעות חברים */}
      <div className="rounded-lg bg-white p-2 mt-2 flex justify-center flex-col gap-3 space-x-4">
        <h2 className="text-gray-800 font-semibold px-2">הצעות חברות חדשות</h2>

        {/* הצגת הצעות חברים */}
        {suggestedFollowers.map((user) => (
          <>
            {user.userType !== "Admin" && (
              <div key={user.id} className="px-2 flex gap-2 items-center">
                <Link
                  to={`/profile/${user.slug}`}
                  className="flex gap-2 items-center"
                >
                  <img
                    src={user.profilePicture || "defaultProfilePictureURL"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover ml-1 border border-[#3E54D3]"
                  />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {user.userType === "Student" && <>{user.userName}</>}
                    {user.userType === "Company" && <>{user.companyName}</>}
                  </h3>
                </Link>
                <FriendButton user={user} />
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
};

export default RightSide;
