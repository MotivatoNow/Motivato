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
  deleteOldImage,
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
  const [editedComment, setEditedComment] = useState(""); //edit comment text
  const [commentImage, setCommentImage] = useState(null);
  const [editedCommentImage, setEditedCommentImage] = useState(null);

  // toggle the add comment.
  const [showCommentBox, setShowCommentBox] = useState(false);

  // comments
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  let commentsRef = collection(db, "Comments");

  // here we add to set comments.
  const getComments = (postId) => {
    try {
      const singlePostQuery = query(commentsRef, where("postId", "==", postId));
      onSnapshot(singlePostQuery, async (response) => {
        const commentsData = [];
        for (const docC of response.docs) {
          const commentData = docC.data();
          const userDoc = await getDoc(doc(db, "Users", commentData.userId));
          const userName = userDoc.exists()
            ? `${userDoc.data().userName}`
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
  const postComment = async (
    postId,
    comment,
    commentImage,
    timeStamp,
    userId,
    commentUserName
  ) => {
    try {
      let object = {
        postId: postId,
        comment: comment,
        commentImage: commentImage, //link image
        timeStamp: timeStamp,
        userId: userId,
        commentUserName: commentUserName,
      };
      await addDoc(commentsRef, object);
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
    } catch (error) {
      console.log(error);
    }
  };

  const deleteImage = () => {
    setCommentImage(null);
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
    console.log(commentId);
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
      <div className="mt-4 p-4 rounded-lg ">
        <div className="relative rounded-lg border p-2 shadow-sm bg-white">
          {/*New Comment */}
          <textarea
            placeholder="הוסף תגובה..."
            className="w-full focus:outline-none resize-none overflow-hidden px-10 py-2 text-sm"
            style={{ height: comment ? "80px" : "40px" }} // גובה דינמי
            onChange={(e) => {
              setComment(e.target.value);
              if (!e.target.value) {
                e.target.style.height = "40px"; // חזרה לגובה המקורי
              } else {
                e.target.style.height = "auto"; // איפוס הגובה
                e.target.style.height = `${e.target.scrollHeight}px`; // התאמת הגובה לתוכן
              }
            }}
            value={comment}
          />

          {/* אייקון המצלמה */}
          <label
            htmlFor="file-upload"
            className="absolute top-2 left-2 cursor-pointer text-gray-500 hover:text-blue-600"
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
          {/*Comment Image */}
          {commentImage && (
            <div className="relative flex items-center justify-center text-gray-500 bg-gray-100 py-2 px-4 rounded-[5px] border-none shadow-sm cursor-pointer">
              <img
                src={URL.createObjectURL(commentImage)}
                alt="Preview"
                className="h-10 w-10 object-cover rounded-lg"
              />
              <MdDeleteOutline
                className="absolute top-1 right-1 cursor-pointer"
                size={20}
                onClick={deleteImage}
              />
            </div>
          )}
          {/* כפתור שליחת תגובה */}
          {commentImage ? (
            <>
              {comment && (
                <>
                {/*Comment Image and Comment */}
                  <button
                    className="absolute bottom-2 left-2 bg-[#3E54D3] text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
                    onClick={addComment}
                  >
                    שלח
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              {comment && (
                <>{/*Comment and no Comment Image */}
                  <button
                    className="absolute bottom-2 left-2 bg-[#3E54D3] text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
                    onClick={addComment}
                  >
                    שלח
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/*All comments */}
        <div className="mt-4 p-4 bg-white rounded-lg shadow-inner">
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
                        {/*current user */}
                        <textarea
                          value={editedComment}
                          onChange={(e) => {
                            setEditedComment(e.target.value);
                            e.target.style.height = "auto"; // איפוס הגובה
                            e.target.style.height = `${e.target.scrollHeight}px`; // התאמת הגובה לתוכן
                          }}
                          className="w-full border border-gray-300 rounded-lg p-2 mb-2 resize-none overflow-hidden"
                          placeholder="ערוך תגובה"
                        />

                        <label
                          htmlFor="edit-file-upload"
                          className="cursor-pointer inline-block bg-[#3E54D3] hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-[5px] border-none shadow-sm transition"
                        >
                          <CiCamera size={24} />
                          <input
                            id="edit-file-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              setEditedCommentImage(e.target.files[0])
                            }
                          />
                        </label>
                        {comment.commentImage && (
                          
                          <div className="relative mt-2">
                            
                            <img
                              src={comment.commentImage}
                              alt="Comment content"
                              className="max-h-60 object-cover rounded-lg"
                            />
                            <MdDeleteOutline
                              onClick={() =>
                                deleteOldImage(comment.id, comment.commentImage)
                              }
                              size={24}
                              className="absolute top-2 right-2 cursor-pointer "
                            />
                          </div>
                        ) }

                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              saveEditedComment(
                                currentUser.uid,
                                posts.id,
                                comment.id,
                                editedComment,
                                commentImage,
                                editedCommentImage,
                                setEditingCommentId,
                                setEditedComment,
                                setEditedCommentImage
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
                                setEditedComment,
                                setEditedCommentImage
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
                        {/*other users */}
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
                        <p className="mt-1 text-gray-700 break-all whitespace-pre-wrap overflow-hidden">
                          {comment.comment}
                        </p>
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
