import React, {useEffect, useState} from 'react'
import {useAuth} from '../../context/AuthContext'
import {db} from '../../config/firebase'
import {addDoc, collection, doc, getDoc, setDoc} from 'firebase/firestore'
import ModalLikes from "../../components/Modal/ModalLikes/ModalLikes";
import ModalComponent from "../../components/Modal/ModalPost/Modal";


const LikeButton = ({posts}) => {
    const [liked, setLiked] = useState (false)
    const [likedCount, setLikedCount] = useState (0)
    const [modalOpen, setModalOpen] = useState (false);
    const {currentUser} = useAuth ();

    useEffect (() => {

        const fetchLikes = async () => {
            try {
                const docRef = doc (db, "Likes", posts.id);
                const docS = await getDoc (docRef);

                if (docS.exists ()) {
                    const data = docS.data ()
                    setLikedCount (data.likeCount || 0);
                    setLiked (data.likedUsers.includes (currentUser.uid));
                }
            } catch (error) {
                console.log (error)
            }
        }
        fetchLikes ()

    }, [posts.id, currentUser])


    const handleLike = async () => {
        if (!currentUser || !currentUser.uid) {
            console.error ('User not logged in or user ID is undefined');
            return;
        }

        const docRef = doc (db, 'Likes', posts.id);

        try {
            const docSnap = await getDoc (docRef);
            let newLikedCount = likedCount;
            let likedUsers = [];

            if (docSnap.exists ()) {
                const data = docSnap.data ();
                likedUsers = data.likedUsers;

                if (liked) {
                    newLikedCount -= 1;
                    likedUsers = likedUsers.filter (userId => userId !== currentUser.uid);
                } else {
                    newLikedCount += 1;
                    likedUsers.push (currentUser.uid);
                }
            } else {
                newLikedCount = 1;
                likedUsers = [currentUser.uid];
            }

            await setDoc (docRef, {likeCount: newLikedCount, likedUsers}, {merge: true});
            if (liked && posts.user.uid !== currentUser.uid) {
                const likeName = `${currentUser.firstName} ${currentUser.lastName}`
                likeNotifications (posts.id, currentUser.uid, likeName, posts.user.uid)
            }

            setLiked (!liked);
            setLikedCount (newLikedCount);
        } catch (error) {
            console.error (error);
        }
    };
    const likeNotifications = async (postId, likeId, likeName, postOwnerId) => {
        const notification = {
            postId: postId,
            likeId: likeId,
            type: "like",
            postUser: postOwnerId,
            likeName: likeName
        }
        const notificationsRef = addDoc (collection (db, "Notifications"), notification)
            .then ((res) => {
                console.log ("Document has been added succesfully");
            })
            .catch ((err) => {
                console.log (err);
            });

    }
    return (
        <>
            <div>

                <div className="">
                    {likedCount}
                    <i className="open_post-likes fa-regular fa-thumbs-up" onClick={() => setModalOpen (true)}>
                        <span>אהבו את הפוסט הזה</span>
                    </i>
                </div>
                <ModalLikes
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    postsId={posts.id}

                />
            </div>
            {
                liked ? (<button className="action-btn" onClick={handleLike}>Unlike</button>) : (
                    <button className="action-btn" onClick={handleLike}>Like</button>)
            }


        </>
    )
}

export default LikeButton