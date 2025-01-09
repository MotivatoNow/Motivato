import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../config/firebase";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import ModalLikes from "../../components/Modal/ModalLikes/ModalLikes";
import { IoIosHeart } from "react-icons/io";
import { FaThumbsUp, FaRegThumbsUp } from "react-icons/fa";
import { createNotification } from "../../hooks/useLoadNotifications";
import { fetchLikes, handleLike } from "../../hooks/useLoadLikes";

const LikeButton = ({ posts }) => {

  const [liked, setLiked] = useState(false);
  const [likedCount, setLikedCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    await fetchLikes(posts, setLiked, setLikedCount, currentUser);
    setLoading(false); 
  };

  fetchData();
}, [posts.id, currentUser]);
if (loading) 
  return <div>Loading...</div>;
  return (
    <>
      <div className="">
        <div className="flex justify-center items-center">
          {likedCount}
          <i
            className="open_post-likes fa-regular fa-thumbs-up flex "
            onClick={() => setModalOpen(true)}
          >
            <div className="bg-[#3E54D3] rounded-full p-1.5 flex items-center justify-center mr-1">
              <IoIosHeart className="text-white" size={14}/>
            </div>
          </i>
        </div>
        <ModalLikes
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          postsId={posts.id}
        />
      </div>
      {liked ? (
        <button
          className="action-btn py-2 px-3 md:px-10 rounded-[10px] bg-gray-100 flex items-center space-x-2"
          onClick={() => handleLike(currentUser, posts, likedCount, liked, setLiked, setLikedCount)}
        >
          <FaThumbsUp className="text-blue-500 ml-1" size={20} />
          {/* <span className="text-gray-800">לייק</span> */}
        </button>
      ) : (
        <button
          className="action-btn flex py-2 px-3 md:px-10 rounded-[10px] bg-gray-100 items-center space-x-2"
          onClick={() => handleLike(currentUser, posts, likedCount, liked, setLiked, setLikedCount)}
        >
          <FaRegThumbsUp className="text-[#3E54D3] ml-1" size={20}/>
          {/* <span className="text-gray-800">לייק</span> */}
        </button>
      )}
    </>
  );
};

export default LikeButton;
