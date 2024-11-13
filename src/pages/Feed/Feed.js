import React, { useState, useMemo, useEffect } from "react";
import MyPost from "../../components/MyPost/MyPost";
import "./Feed.css";
import { getPosts } from "../../context/Firestore";
import PostCard from "../../components/PostCard/PostCard";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import RightSide from "../../components/Feed/RightSide/RightSide";

const Feed = () => {
  const { currentUser } = useAuth();
  const [allPosts, setAllPosts] = useState([]);
  useMemo(() => {
    getPosts(setAllPosts);
  }, []);
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#f2f4f7] w-full mx-auto ">
  {/* עמודת פרופיל - צד שמאל */}
  <div className="hidden lg:block  lg:col-span-1">
          <RightSide />
  </div>

  {/* עמודת הפיד המרכזית */}
  <div className="col-span-1 lg:col-span-2">
    <div>
      <MyPost />
      <div>
        {allPosts.map((post) => (
          <div key={post.id}>
            <PostCard posts={post} user={currentUser} />
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* עמודת המלצות - צד ימין */}
  <div className="hidden lg:block lg:col-span-1">
    <div className="hover:bg-[#1F272F] rounded-lg p-2 mt-5 mr-4">
      <Link to={`/profile/${currentUser.uid}`}>
        <div className="flex items-center space-x-4">
          <img
            src={currentUser.profilePicture || "defaultProfilePictureURL"}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover ml-1"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-200">
              {currentUser.userName}
            </h3>
          </div>
        </div>
      </Link>
    </div>
  </div>
</div>

  );
};

export default Feed;
