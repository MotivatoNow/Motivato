import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../config/firebase";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import ModalLikes from "../../components/Modal/ModalLikes/ModalLikes";
import { IoIosHeart } from "react-icons/io";
import { FaThumbsUp, FaRegThumbsUp } from "react-icons/fa";
import { createNotification } from "../../hooks/useLoadNotifications";

const LikeButton = ({ posts }) => {
  const [liked, setLiked] = useState(false);
  const [likedCount, setLikedCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const docRef = doc(db, "Likes", posts.id);
        const docS = await getDoc(docRef);

        if (docS.exists()) {
          const data = docS.data();
          setLikedCount(data.likeCount || 0);
          setLiked(data.likedUsers.includes(currentUser.uid));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchLikes();
  }, [posts.id, currentUser]);

  const handleLike = async () => {
    if (!currentUser || !currentUser.uid) {
      console.error("User not logged in or user ID is undefined");
      return;
    }

    const docRef = doc(db, "Likes", posts.id);

    try {
      const docSnap = await getDoc(docRef);
      let newLikedCount = likedCount;
      let likedUsers = [];

      if (docSnap.exists()) {
        const data = docSnap.data();
        likedUsers = data.likedUsers;

        if (liked) {
          newLikedCount -= 1;
          likedUsers = likedUsers.filter(
            (userId) => userId !== currentUser.uid
          );
        } else {
          newLikedCount += 1;
          likedUsers.push(currentUser.uid);
        }
      } else {
        newLikedCount = 1;
        likedUsers = [currentUser.uid];
      }

      await setDoc(
        docRef,
        { likeCount: newLikedCount, likedUsers },
        { merge: true }
      );
      if (!liked && posts.user.uid !== currentUser.uid) {
        const notification = {
          type: "like",
          postId: posts.id,
          likeId: currentUser.uid,
          postUser: posts.user.uid,
          likeName: currentUser.userName,
        };
        await createNotification(notification)
      }

      setLiked(!liked);
      setLikedCount(newLikedCount);
    } catch (error) {
      console.error(error);
    }
  };
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
          onClick={handleLike}
        >
          <FaThumbsUp className="text-blue-500 ml-1" size={20} />
          {/* <span className="text-gray-800">לייק</span> */}
        </button>
      ) : (
        <button
          className="action-btn flex py-2 px-3 md:px-10 rounded-[10px] bg-gray-100 items-center space-x-2"
          onClick={handleLike}
        >
          <FaRegThumbsUp className="text-[#3E54D3] ml-1" size={20}/>
          {/* <span className="text-gray-800">לייק</span> */}
        </button>
      )}
    </>
  );
};

export default LikeButton;
