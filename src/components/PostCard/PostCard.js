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
import LikeButton from "../../features/LikeButton/LikeButton";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";
import { Link } from "react-router-dom";
import ShareButton from "../ShareButton/ShareButton";

const PostCard = ({ posts }) => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // toggle the add comment.
  const [showCommentBox, setShowCommentBox] = useState(false);
  // comments
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  let commentsRef = collection(db, "Comments");
  // here we add to setcomments.
  const getComment = (event) => {
    setComment(event.target.value);
  };

  const getComments = (postId) => {
    try {
      const singlePostQuery = query(commentsRef, where("postId", "==", postId));
      onSnapshot(singlePostQuery, async (response) => {
        const commentsData = [];
        for (const docC of response.docs) {
          const commentData = docC.data();
          const userDoc = await getDoc(doc(db, "Users", commentData.userId));
          const userName = userDoc.exists()
            ? `${userDoc.data().firstName} ${userDoc.data().lastName}`
            : "Unknown User";
          const userProfilePicture = userDoc.exists()
            ? userDoc.data().profilePicture
            : "defaultProfilePictureURL";

          commentsData.push({
            id: docC.id,
            ...commentData,
            userName,
            userProfilePicture,
          });
        }
        setComments(commentsData);
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Adding to firebase.
  const postComment = (postId, comment, timeStamp, userId, commentUserName) => {
    try {
      addDoc(commentsRef, {
        postId,
        comment,
        timeStamp,
        userId,
        commentUserName,
      });
    } catch (error) {
      console.error(error);
    }
  };
  //function to add comments.
  const addComment = async () => {
    postComment(
      posts.id,
      comment,
      getCurrentTimeStamp("LLL"),
      currentUser?.uid,
      currentUser?.userName
    );
    setComment("");
  };

  useMemo(() => {
    getComments(posts.id);
  }, [posts.id]);

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
    getComments(posts.id);
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
        /></Link>
        <div className="mr-4">
          <Link to={`/profile/${userData.uid}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-500 hover:underline">{userData.userName}</h3></Link>
          <p className="text-sm text-gray-600">{posts.timeStamp}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-800">{posts.post}</p>
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
      <hr className="text-white"/>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <LikeButton posts={posts} />
        <button
          className="flex items-center space-x-2 text-[#3E54D3] hover:text-blue-600 py-2 px-3 md:px-10 rounded-[10px] bg-gray-100"
          onClick={() => setShowCommentBox(!showCommentBox)}
        >
          <FaRegComment className="ml-1" />
          <span className="text-gray-800">תגובה</span>
        </button>
        <ShareButton posts={posts} />
      </div>

      {showCommentBox && (
  <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow-inner">
    <div className="flex items-center space-x-2 mb-3">
      <input
        placeholder="הוסף תגובה"
        className="flex-grow border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:[#3E54D3]"
        onChange={getComment}
        name={comment}
        value={comment}
      />
      <button
        className="bg-[#3E54D3] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        onClick={addComment}
      >
        הוסף תגובה
      </button>
    </div>

    {comments.length > 0 && (
      <div className="space-y-4">
        {comments.map((comment) => (
          <div className="bg-white p-3 rounded-lg  flex space-x-3" key={comment.id}>
            <Link to={`/profile/${comment.userId}`} className="flex-shrink-0">
              <img
                className="w-10 h-10 rounded-full object-cover"
                src={comment.userProfilePicture || "defaultProfilePictureURL"}
                alt={`${comment.commentUserName}`}
              />
            </Link>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <Link to={`/profile/${comment.userId}`} className="text-sm font-semibold text-gray-800 hover:underline">
                  {comment.commentUserName}
                </Link>
                <p className="text-xs text-gray-500">{comment.timeStamp}</p>
              </div>
              <p className="mt-1 text-gray-700">{comment.comment}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

    </div>
  );
};

export default PostCard;
