import React,{useState,useMemo} from "react";
import MyPost from "../../components/MyPost/MyPost";
import "./Feed.css"
import { getPosts } from "../../context/Firestore";
import PostCard from "../../components/PostCard/PostCard";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";



const Feed = () => {
  
  const [allPosts, setAllPosts]=useState([])
  useMemo(()=>{
    getPosts(setAllPosts)
  },[])
  return (
    <div className="feed-page">
      <div className="my-post">
        <MyPost/>
      </div>
      <div className="feed-post">
      {allPosts.map((post)=>{
        return(<PostCard posts={post}/>)
      })}
      </div>
    </div>
  );
};

export default Feed;
