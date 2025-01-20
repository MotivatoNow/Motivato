import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../config/firebase";
import { message } from "antd";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

//Post functions
export const deletePost = (postId) => {
  if (window.confirm("האם אתה בטוח שברצונך למחוק את הפוסט הזה?")) {
    handleDeletePost(postId);
  }
};

const handleDeletePost = async (postId) => {
  const postRef = doc(db, "Posts", postId);
  try {
    await deleteDoc(postRef);
    message.success("הפוסט נמחק בהצלחה!");
  } catch (error) {
    console.error("שגיאה בעת מחיקת הפוסט:", error);
    alert("נכשל בניסיון למחוק את הפוסט.");
  }
};

export const editPost = (setIsEditing) => {
  if (window.confirm("האם אתה בטוח שברצונך לעדכן את הפוסט הזה?")) {
    setIsEditing(true);
  }
};

//Comments functions
export const deleteOldImage = async (commentId,imageURL,) => {
  try {
    const storageRef=ref(storage,imageURL)
    await deleteObject(storageRef);

    const commentDoc=doc(db,"Comments",commentId)
    await updateDoc(commentDoc,{commentImage:""})
    
  } catch (error) {
    console.error(error);
  }
};
export const deleteComment = (commentId) => {
  if (window.confirm("האם ברצונך למחוק את התגובה?")) {
    handleDeleteComment(commentId);
  }
};

const handleDeleteComment = async (commentId) => {
  const commentRef = doc(db, "Comments", commentId);
  try {
    await deleteDoc(commentRef);

    message.success("התגובה נמחקה בהצלחה!");
  } catch (error) {
    console.error("שגיאה בעת מחיקת התגובה:", error);
    alert("נכשל בניסיון למחוק את התגובה.");
  }
};

export const editComment = async (commentDoc, updatedFields) => {
  try {
    await updateDoc(commentDoc, updatedFields);
    console.log("Comment updated successfully");
  } catch (error) {
    console.error("Error updating comment:", error);
  }
};

export const handleEditComment = (
  comment,
  setEditingCommentId,
  setEditedComment
) => {
  
  setEditingCommentId(comment.id);
  setEditedComment(comment.comment);
};

export const saveEditedComment = async (
  currentUserId,
  postId,
  commentId,
  editedComment,
  commentImage,
  editedCommentImage,
  setEditingCommentId,
  setEditedComment,
  setCommentImage
) => {
  try {
    
    let imageURL = commentImage;

    if (editedCommentImage) {
      if (commentImage) {
        await deleteObject(ref(storage, commentImage));
      }
      const storageRef = ref(
        storage,
        `ImageComment/${postId}/${currentUserId}/${editedCommentImage.name}`
      );
      await uploadBytes(storageRef, editedCommentImage);
      imageURL = await getDownloadURL(storageRef);
      const commentDoc = doc(db, "Comments", commentId);
      await editComment(commentDoc, { commentImage: imageURL });
    }
    if (editedComment) {
      const commentDoc = doc(db, "Comments", commentId);
      await editComment(commentDoc, { comment: editedComment });
    }
    setEditingCommentId(null);
    setEditedComment("");
    setCommentImage(null);
  } catch (error) {
    console.error("Error editing comment:", error);
  }
};

export const cancelEditing = (
  setEditingCommentId,
  setEditedComment,
  setCommentImage
) => {
  setEditingCommentId(null);
  setEditedComment("");
  setCommentImage(null);
};

//Missions functions
export const deleteMissions = (missionId) => {
  if (window.confirm("האם אתה בטוח שברצונך למחוק את המשימה הזה?")) {
    handleDeleteMission(missionId);
  }
};

const handleDeleteMission = async (missionId) => {
  const missionRef = doc(db, "Missions", missionId);
  try {
    await deleteDoc(missionRef);

    message.success("המשימה נמחקה בהצלחה!");
  } catch (error) {
    console.error("שגיאה בעת מחיקת המשימה:", error);
    alert("נכשל בניסיון למחוק את המשימה.");
  }
};

export const editMission = (setIsEditing) => {
  if (window.confirm("האם אתה בטוח שברצונך לעדכן את המשימה הזה?")) {
    setIsEditing(true);
  }
};
