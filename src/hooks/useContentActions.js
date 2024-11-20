import {  deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { message } from 'antd';

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

export const editPost=(setIsEditing)=>{
    if (window.confirm("האם אתה בטוח שברצונך לעדכן את הפוסט הזה?")) {
        setIsEditing(true)
    }
}

//Comments functions

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

  export const handleEditComment = (comment,setEditingCommentId,setEditedComment) => {
    setEditingCommentId(comment.id);
    setEditedComment(comment.comment);
  };

  export const saveEditedComment = async (commentId,editedComment,setEditingCommentId,setEditedComment) => {
    try {
      const commentDoc = doc(db, "Comments", commentId);
      await editComment(commentDoc, { comment: editedComment });
      setEditingCommentId(null);
      setEditedComment("");
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  export const cancelEditing = (setEditingCommentId,setEditedComment) => {
    setEditingCommentId(null);
    setEditedComment("");
  };
