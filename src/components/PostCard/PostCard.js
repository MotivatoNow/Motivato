import React, {useEffect, useState} from 'react';
import "./PostCard.css";
import {doc, getDoc} from "firebase/firestore";
import {db} from "../../config/firebase";

const PostCard = ({posts}) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (posts && posts.userUid) {
            const fetchUserData = async () => {
                try {
                    const userDoc = await getDoc(doc(db, "Users", posts.userUid));
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
        }
    }, [posts.userUid]);


    if (loading) {
        return <div>Loading...</div>;
    }

    if (!userData) {
        return <div>User data not found</div>;
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
