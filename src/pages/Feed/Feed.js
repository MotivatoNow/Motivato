import React, { useState, useMemo, useEffect } from "react";
import MyPost from "../../components/MyPost/MyPost";
import "./Feed.css";
import { getPosts } from "../../context/Firestore";
import PostCard from "../../components/PostCard/PostCard";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const Feed = () => {
  const { currentUser } = useAuth();
  const [allPosts, setAllPosts] = useState([]);
  useMemo(() => {
    getPosts(setAllPosts);
  }, []);
  return (
    // <div className="">
    //   <div className="">
    //     <MyPost />
    //   </div>
    //   <div className="">
    //     {allPosts.map((post) => {
    //       return (
    //         <div key={post.id}>
    //           <PostCard posts={post} user={currentUser} />
    //         </div>
    //       );
    //     })}
    //   </div>
    // </div>

    <div className="flex space-x-4 mx-auto bg-[#0B141C]">
      <div className="w-1/4">
        <div className="hover:bg-[#1F272F] rounded-lg p-2 mt-5 mr-4">
          <Link to={`/profile/${currentUser.uid}`}>
          <div className="flex items-center space-x-4">
            <img
              src={currentUser.profilePicture || "defaultProfilePictureURL"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover ml-1"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-200">{currentUser.userName}</h3>
            </div>
          </div></Link>
        </div>
      </div>
      <div className="w-3/6">
        <div className="">
          <div className="">
            <MyPost />
          </div>
          <div className="">
            {allPosts.map((post) => {
              return (
                <div key={post.id}>
                  <PostCard posts={post} user={currentUser} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="w-1/4">3</div>
    </div>
  );
};

export default Feed;
