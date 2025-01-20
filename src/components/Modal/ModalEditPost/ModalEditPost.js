import React, { useState } from 'react'
import { getCurrentTimeStamp } from '../../../features/useMoment/useMoment';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../../config/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { message } from 'antd';
import ModalPost from '../ModalPost/ModalPost';

const ModalEditPost = ({ isOpen, onClose, posts, user }) => {
    const [post, setPost] = useState(posts.post);
    const [postImage, setPostImage] = useState(posts.postImage);
    const [uploading,setUploading]=useState(false)
    
    const sendPost = async () => {
        let imageURL = "";
    
        // Upload the image if a new image is selected
        if (postImage && typeof postImage !== "string") {
            try {
                imageURL = await uploadPostImage(postImage); // Upload to Storage
            } catch (error) {
                console.error("Error uploading image: ", error);
                return;
            }
        } else {
            imageURL = postImage; // Keep the existing image URL if no new image is selected
        }
    
        // Update the Firestore document
        const updatedPost = {
            user: {
                uid: user?.uid || "No UID",
                username: user?.userName || "Anonymous",
            },
            post: post,
            timeStamp: getCurrentTimeStamp("LLL"),
            postImage: imageURL,
        };
    
        try {
            await updateDoc(doc(db, "Posts", posts.id), updatedPost);
            onClose(); // Close the modal after submission
            setPost("");
            setPostImage(null);
            message.success("פוסט התעדכן בהצלחה")
        } catch (error) {
            console.error("Error posting status: ", error);
        }
    };
    const uploadPostImage = async (file) => {
        if (!file) return null;
        try {
            setUploading(true);
            const storageRef = ref(storage, `ImagePost/${user.uid}/${file.name}`);
            await uploadBytes(storageRef, file); // Upload the file
            const url = await getDownloadURL(storageRef); // Get the download URL
            return url; // Return the image URL
        } catch (error) {
            console.error("Error uploading image: ", error);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    return (
        <ModalPost
            modalOpen={isOpen}
            setModalOpen={onClose}
            setPost={setPost}
            post={post}
            sendPost={sendPost}
            postImage={postImage}
            setPostImage={setPostImage}
        />
    );
};

export default ModalEditPost