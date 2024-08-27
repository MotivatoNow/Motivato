import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../config/firebase'
import { doc, getDoc,setDoc } from 'firebase/firestore'

const LikeButton = ({postsId}) => {
    const [liked,setLiked]=useState(false)
    const [likedCount,setLikedCount]=useState(0)
    const {currentUser}=useAuth();

    useEffect(()=>{

        const fetchLikes=async()=>{
            try{
                const docRef=doc(db,"Likes",postsId);
                const docS=await getDoc(docRef);

                if (docS.exists()) {
                    const data = docS.data();
                    setLikedCount(data.likeCount || 0);
                    setLiked(data.likedUsers.includes(currentUser.uid));
                }
            }
            catch(error){
                console.log(error)
            }
        }
        fetchLikes()

    },[postsId,currentUser])


    const handleLike = async () => {
        if (!currentUser || !currentUser.uid) {
            console.error('User not logged in or user ID is undefined');
            return;
        }

        const docRef = doc(db, 'Likes', postsId);

        try {
            const docSnap = await getDoc(docRef);
            let newLikedCount = likedCount;
            let likedUsers = [];

            if (docSnap.exists()) {
                const data = docSnap.data();
                likedUsers = data.likedUsers || [];

                if (liked) {
                    newLikedCount -= 1;
                    likedUsers = likedUsers.filter(userId => userId !== currentUser.uid);
                } else {
                    newLikedCount += 1;
                    likedUsers.push(currentUser.uid);
                }
            } else {
                newLikedCount = 1;
                likedUsers = [currentUser.uid];
            }

            await setDoc(docRef, { likeCount: newLikedCount, likedUsers }, { merge: true });

            setLiked(!liked);
            setLikedCount(newLikedCount);
        } catch (error) {
            console.error('Erreur lors de la mise à jour des likes:', error);
        }
    };
  return (
    <>
    <p>{likedCount} Likes</p>
    <button className="action-btn" onClick={handleLike}>Like</button>
    </>
  )
}

export default LikeButton