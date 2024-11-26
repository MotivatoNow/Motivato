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
import { db } from "../../config/firebase";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  cancelEditing,
  deleteComment,
  handleEditComment,
  saveEditedComment,
} from "../../hooks/useContentActions";
import { MdDeleteOutline } from "react-icons/md";
import { CiCamera, CiEdit } from "react-icons/ci";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../firebase";

const CommentButton = ({ posts }) => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [commentImage, setCommentImage] = useState(null);

  // toggle the add comment.
  const [showCommentBox, setShowCommentBox] = useState(false);
  // comments
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  let commentsRef = collection(db, "Comments");

  // here we add to set comments.
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
  const postComment = (
    postId,
    comment,
    commentImage,
    timeStamp,
    userId,
    commentUserName
  ) => {
    try {
      let object={
        postId:postId,
        comment:comment,
        commentImage:commentImage,//link image 
        timeStamp:timeStamp,
        userId:userId,
        commentUserName:commentUserName
      }
      addDoc(commentsRef, object);
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
    let imageURL = "";
    if (commentImage) {
      try {
        imageURL = await uploadCommentImage(commentImage);
      } catch (error) {
        console.error("Error uploading image:", error);
        return;
      }
    }
    try {
      postComment(
        posts.id,
        comment,
        imageURL,
        getCurrentTimeStamp("LLL"),
        currentUser?.uid,
        currentUser?.userName
      );
      setComment("");
      setCommentImage(null);
    } 
    catch (error) {
      console.log(error);
    }
  };

  const deleteImage = (commentImage) => {
    setCommentImage("");
  };
  const uploadCommentImage = async (file) => {
    const storageRef = ref(
      storage,
      `ImageComment/${posts.id}/${currentUser.uid}/${file.name}`
    );
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  //Notification
  const commentNotifications = async (
    postId,
    commentId,
    commentName,
    postOwnerId
  ) => {
    console.log(commentId)
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
          <div className="flex items-center gap-4 mb-4">
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-block bg-[#3E54D3] hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-[5px] border-none shadow-sm transition"
            >
              <CiCamera size={24} />
            </label>

            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setCommentImage(e.target.files[0])}
            />
            {commentImage && (
              <div className="relative flex items-center justify-center text-gray-500 bg-gray-100 py-2 px-4 rounded-[5px] border-none shadow-sm cursor-pointer">
                {commentImage && (
                  <>
                    <img src={commentImage} className="h-6 w-6" />
                  </>
                )}
                <span className="absolute top-1 right-0">
                  {commentImage.name}
                  <MdDeleteOutline
                    onClick={() => deleteImage(commentImage)}
                    size={20}
                  />
                </span>
              </div>
            )}
            {/*  */}
          </div>
          <button
            className="bg-[#3E54D3] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            onClick={addComment}
          >
            הוסף תגובה
          </button>
        </div>

        <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow-inner">
          {comments.length > 0 && (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  className="bg-white p-3 rounded-lg flex space-x-3"
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
                    {editingCommentId === comment.id ? (
                      <>
                        <input
                          value={editedComment}
                          onChange={(e) => setEditedComment(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 mb-2"
                        />{commentImage && (
                          <div className="relative flex items-center justify-center text-gray-500 bg-gray-100 py-2 px-4 rounded-[5px] border-none shadow-sm cursor-pointer">
                            {commentImage && (
                              <>
                                <img src={commentImage} className="h-6 w-6" />
                              </>
                            )}
                            <span className="absolute top-1 right-0">
                              {commentImage.name}
                              <MdDeleteOutline
                                onClick={() => deleteImage(commentImage)}
                                size={20}
                              />
                            </span>
                          </div>
                        )}
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              saveEditedComment(
                                comment.id,
                                editedComment,
                                setEditingCommentId,
                                setEditedComment
                              )
                            }
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                          >
                            שמור
                          </button>
                          <button
                            onClick={() =>
                              cancelEditing(
                                setEditingCommentId,
                                setEditedComment
                              )
                            }
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                          >
                            ביטול
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <Link
                            to={`/profile/${comment.userId}`}
                            className="text-sm font-semibold text-gray-800 hover:underline"
                          >
                            {comment.userName}
                          </Link>
                          <p className="text-xs text-gray-500">
                            {comment.timeStamp}
                          </p>
                        </div>
                        <div className="mb-4">
                          {comment.commentImage && (
                            <div className="mt-4">
                              <img
                                src={comment.commentImage}
                                alt="Post content"
                                className="w-full max-h-96 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                        <p className="mt-1 text-gray-700">{comment.comment}</p>
                      </>
                    )}
                  </div>
                  {currentUser.uid === comment.userId && (
                    <div className="flex space-x-2">
                      <MdDeleteOutline
                        className="cursor-pointer"
                        onClick={() => deleteComment(comment.id)}
                        size={20}
                      />
                      <CiEdit
                        className="cursor-pointer"
                        onClick={() =>
                          handleEditComment(
                            comment,
                            setEditingCommentId,
                            setEditedComment
                          )
                        }
                        size={20}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CommentButton;
