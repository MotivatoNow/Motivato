import React, {useEffect, useState} from 'react';
import "./PostCard.css";
import {doc, getDoc} from "firebase/firestore";
import {db} from "../../config/firebase";

const PostCard = ({posts}) => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const userDoc = await getDoc(doc(db, "Users", posts.userUid)); // שואב את המידע של המשתמש לפי ה- uid
            if (userDoc.exists()) {
                setUserData(userDoc.data());
            } else {
                console.log("No such user!");
            }
        };

        fetchUserData();
    }, [posts.userUid]);

    if (!userData) {
        return <div>Loading...</div>; // הצגת מצב טעינה
    }


    return (
        <div className="post-card">
            <div className="post-header">
                <div className="user-info">
                    <img
                        src={userData.profilePicture || "defaultProfilePictureURL"} // תמונת פרופיל
                        alt="Profile"
                        className="user-profile-image"
                    />
                    <div className="user-details">
                        <h3 className="user-name">
                            {userData.firstName ? userData.firstName : "Unknown User"}{" "}
                            {userData.lastName ? userData.lastName : "Unknown User"}
                        </h3>
                        <p className="post-timestamp">{posts.timeStamp}</p>
                    </div>
                </div>
            </div>
            <div className="post-content">
                <p className="status">{posts.post}</p>
            </div>
            <div className="post-actions">
                <button className="action-btn">Like</button>
                <button className="action-btn">Comment</button>
                <button className="action-btn">Share</button>
            </div>
        </div>
    );
};


export default PostCard;
