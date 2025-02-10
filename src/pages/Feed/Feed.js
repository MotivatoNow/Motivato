import React, { useState, useMemo } from "react";
import MyPost from "../../components/MyPost/MyPost";
import PostCard from "../../components/PostCard/PostCard";
import { useAuth } from "../../context/AuthContext";
import RightSide from "../../components/Feed/RightSide/RightSide";
import LeftSide from "../../components/Feed/LeftSide/LeftSide";
import { loadPosts } from "../../hooks/useLoadPosts";

const Feed = () => {
  const { currentUser } = useAuth();
  const [allPosts, setAllPosts] = useState([]);
  useMemo(() => {
    loadPosts(setAllPosts);
  }, []);
  
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 -mt-16 bg-[#F6F9FC] w-full min-h-screen  ">
      {/* עמודת פרופיל - צד שמאל */}
      <div
        className="hidden lg:block lg:col-span-1 transition-all duration-300">
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

      <div
        className="hidden lg:block lg:col-span-1 transition-all duration-300">
        <LeftSide />
      </div>
    </div>
  );
};

export default Feed;
