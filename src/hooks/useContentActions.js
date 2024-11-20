import {  deleteDoc, doc } from 'firebase/firestore';
import React from 'react'
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
