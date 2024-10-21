import React, {useState, useMemo, useEffect} from "react";
import MyMission from "../../components/MyMission/MyMission";
import { getPosts } from "../../context/Firestore";
import MissionCard from "../../components/MissionCard/MissionCard";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";
import { useAuth } from "../../context/AuthContext";


const Feed = () => {

  const {currentUser}=useAuth()
  const [allPosts, setAllPosts]=useState([])
    useMemo(()=>{
        getPosts(setAllPosts)
    },[])
  return (

    <div className="feed-page">
      <div className="my-post">
        <MyMission/>
      </div>
      <div className="feed-post">
      {allPosts.map((post)=>{
        return(
            <div key={post.id}>
                <MissionCard posts={post} user={currentUser}/>
            </div>
        )
      })}
      </div>
    </div>
  );
};

export default Feed;
