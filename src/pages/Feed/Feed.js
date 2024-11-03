import React, {useState, useMemo, useEffect} from "react";
import MyPost from "../../components/MyPost/MyPost";
import "./Feed.css"
import { getPosts } from "../../context/Firestore";
import PostCard from "../../components/PostCard/PostCard";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";
import { useAuth } from "../../context/AuthContext";


const Feed = () => {

  const {currentUser}=useAuth()
  const [allPosts, setAllPosts]=useState([])
    useMemo(()=>{
        getPosts(setAllPosts)
    },[])
  return (

    <div className="">
     
      <div className="">
        <MyPost/>
      </div>
      <div className="">
      {allPosts.map((post)=>{
        return(
            <div key={post.id}>
                <PostCard posts={post} user={currentUser}/>
            </div>
        )
      })}
      </div>
    </div>
  );
};

export default Feed;
