import React, { useState, useMemo, useEffect } from "react";
import MyPost from "../../components/MyPost/MyPost";
import "./Feed.css";
import { getPosts } from "../../context/Firestore";
import PostCard from "../../components/PostCard/PostCard";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import RightSide from "../../components/Feed/RightSide/RightSide";
import LeftSide from "../../components/Feed/LeftSide/LeftSide"

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

  <div className="hidden lg:block  lg:col-span-1">
          <LeftSide/>
  </div>
</div>

  );
};

export default Feed;
