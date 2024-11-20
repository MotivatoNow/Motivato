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
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CommentButton = ({posts}) => {
    const {currentUser} = useAuth();    
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
      if (posts.user.uid !== currentUser.uid) {
        const commentName = `${currentUser.userName} `;
        commentNotifications(
          posts.id,
          currentUser.uid,
          commentName,
          posts.user.uid
        );
      }
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
  const commentNotifications = async (
    postId,
    commentId,
    commentName,
    postOwnerId
  ) => {
    const notification = {
      postId: postId,
      commentId: commentId,
      type: "comment",
      postUser: postOwnerId,
      commentName: commentName,
    };
    const notificationsRef = addDoc(
      collection(db, "Notifications"),
      notification
    )
      .then((res) => {
        console.log("Document has been added succesfully");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useMemo(() => {
    getComments(posts.id);
  }, [posts.id]);

  useEffect(() => {
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
    getComments(posts.id);
  }, [posts.user.uid]);


  return (
    <>
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
                <div
                  className="bg-white p-3 rounded-lg  flex space-x-3"
                  key={comment.id}
                >
                  <Link
                    to={`/profile/${comment.userId}`}
                    className="flex-shrink-0"
                  >
                    <img
                      className="w-10 h-10 rounded-full object-cover"
                      src={
                        comment.userProfilePicture || "defaultProfilePictureURL"
                      }
                      alt={`${comment.commentUserName}`}
                    />
                  </Link>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/profile/${comment.userId}`}
                        className="text-sm font-semibold text-gray-800 hover:underline"
                      >
                        {comment.commentUserName}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {comment.timeStamp}
                      </p>
                    </div>
                    <p className="mt-1 text-gray-700">{comment.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </>
  )
}

export default CommentButton