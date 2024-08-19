import React,{useState,useMemo} from "react";
import MyPost from "../../components/MyPost/MyPost";
import "./Feed.css"
import { getStatus } from "../../context/Firestore";
import PostCard from "../../components/PostCard/PostCard";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";


const Feed = () => {
  
  const [allStatus, setAllStatus]=useState([])
  useMemo(()=>{
    getStatus(setAllStatus)
  },[])
  return (
    <div className="feed-page">
      <div className="my-post">
        <MyPost/>
      </div>
      <div className="feed-post">
      {allStatus.map((post)=>{
        return(<PostCard posts={post}/>)
      })}
      </div>
    </div>
  );
};

export default Feed;
