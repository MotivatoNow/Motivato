import React, { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { FaRegComment } from "react-icons/fa";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import LikeButton from "../LikeButton/LikeButton";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";
import { Link } from "react-router-dom";
import ShareButton from "../ShareButton/ShareButton";
import { CiEdit } from "react-icons/ci";
import { MdDeleteOutline } from "react-icons/md";
import { deletePost, editPost } from "../../hooks/useContentActions";
import ModalEditPost from "../Modal/ModalEditPost/ModalEditPost";
import CommentButton from "../CommentButton/CommentButton";

const PostCard = ({ posts }) => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);

  // toggle the add comment.
  const [showCommentBox, setShowCommentBox] = useState(false);

  useEffect(() => {
    if (posts && posts.user.uid) {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "Users", posts.user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            console.log("No such user!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    }
  }, [posts.user.uid]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>User data not found</div>;
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mb-6 max-w-2xl mx-auto mt-3">
      <div className="flex items-center mb-4">
        <Link to={`/profile/${userData.uid}`}>
          <img
            src={userData.profilePicture || "defaultProfilePictureURL"}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
        </Link>
        <div className="mr-4">
          <Link to={`/profile/${userData.uid}`}>
            <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-500 hover:underline">
              {userData.userName}
            </h3>
          </Link>
          <p className="text-sm text-gray-600">{posts.timeStamp}</p>
        </div>
        {currentUser.uid === userData.uid && (
          <div className="flex gap-3">
            <MdDeleteOutline onClick={() => deletePost(posts.id)} size={20} />
            <CiEdit onClick={() => editPost(setIsEditing)} size={20} />
            {isEditing && (
              <ModalEditPost
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                posts={posts}
                user={currentUser}
              />
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="break-words max-w-full whitespace-pre-wrap overflow-hidden text-gray-800">{posts.post}</p>
        {posts.postImage && (
          <div className="mt-4">
            <img
              src={posts.postImage}
              alt="Post content"
              className="w-full max-h-96 object-cover rounded-lg"
            />
          </div>
        )}
      </div>
      <hr className="text-white" />

      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <LikeButton posts={posts} />
        <button
          className="flex items-center space-x-2 text-[#3E54D3] hover:text-blue-600 py-2 px-3 md:px-10 rounded-[10px] bg-gray-100"
          onClick={() => setShowCommentBox(!showCommentBox)}
        >
          <FaRegComment className="ml-1" size={20} /> {/*Icon of the comment */}
        </button>
        <ShareButton posts={posts} />
      </div>
      {showCommentBox&&(
        <CommentButton posts={posts} />
      )}
    </div>
  );
};

export default PostCard;
