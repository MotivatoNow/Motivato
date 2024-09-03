import React, {useEffect, useMemo, useState} from "react";
import "./PostCard.css";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    onSnapshot,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import {db} from "../../config/firebase";
import {useAuth} from "../../context/AuthContext";
import LikeButton from "../../features/LikeButton/LikeButton";
import {getCurrentTimeStamp} from "../../features/useMoment/useMoment";
import {Link} from "react-router-dom";

const PostCard = ({posts, user}) => {
    const {currentUser} = useAuth ();
    const [userData, setUserData] = useState (null);
    const [loading, setLoading] = useState (true);

    // toggle the add comment.
    const [showCommentBox, setShowCommentBox] = useState (false);
    // comments
    const [comment, setComment] = useState ("");
    const [comments, setComments] = useState ([]);

    let commentsRef = collection (db, "Comments");
    // here we add to setcomments.
    const getComment = (event) => {
        setComment (event.target.value);
    };

    const getComments = (postId) => {
        try {
            const singlePostQuery = query (commentsRef, where ("postId", "==", postId));
            onSnapshot (singlePostQuery, async (response) => {
                const commentsData = [];
                for (const docC of response.docs) {
                    const commentData = docC.data ();
                    const userDoc = await getDoc (doc (db, "Users", commentData.userId));
                    const userName = userDoc.exists ()
                        ? `${userDoc.data ().firstName} ${userDoc.data ().lastName}`
                        : "Unknown User";
                    commentsData.push ({
                        id: doc.id,
                        ...commentData,
                        userName,
                    });
                }
                setComments (commentsData);
            });
        } catch (error) {
            console.error (error);
        }
    };
    // Adding to firebase.
    const postComment = (postId, comment, timeStamp, userId) => {
        try {
            addDoc (commentsRef, {
                postId,
                comment,
                timeStamp,
                userId,
            });
        } catch (error) {
            console.error (error);
        }
    };
    //function to add comments.
    const addComment = () => {
        postComment (
            posts.id,
            comment,
            getCurrentTimeStamp ("LLL"),
            currentUser?.uid
        );
        setComment ("");
    };

    useMemo (() => {
        getComments (posts.id);
    }, [posts.id]);

    useEffect (() => {
        if (posts && posts.user.uid) {
            const fetchUserData = async () => {
                try {
                    const userDoc = await getDoc (doc (db, "Users", posts.user.uid));
                    if (userDoc.exists ()) {
                        setUserData (userDoc.data ());
                    } else {
                        console.log ("No such user!");
                    }
                } catch (error) {
                    console.error ("Error fetching user data:", error);
                } finally {
                    setLoading (false);
                }
            };
            fetchUserData ();
        }
        getComments (posts.id);
    }, [posts.user.uid]);

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
            <hr/>

            <div className="post-actions">
                <LikeButton postsId={posts.id}/>
                <button
                    className="action-btn"
                    onClick={() => setShowCommentBox (!showCommentBox)}
                >
                    Comment
                </button>
                <button className="action-btn">Share</button>
            </div>
            {showCommentBox ? (
                <>
                    {" "}
                    <input
                        placeholder="הוספת תגובה"
                        className="comment-input"
                        onChange={getComment}
                        name={comment}
                        value={comment}
                    />
                    <button className="add-comment-btn" onClick={addComment}>
                        הוסף תגובה
                    </button>
                    {comments.length > 0 ? (
                        comments.map ((comment, i) => {
                            return (
                                <div className="comment" key={comment.userId}>
                                  <div className="comment-header">
                                    <Link to={`/profile/${comment.userId}`} className="comment-user">
                                      <img
                                          className="comment-user-image"
                                          src={user.profilePicture}
                                          alt={`${user.firstName} ${user.lastName}`}
                                      />
                                      <span className="comment-user-name">
                            {user.firstName} {user.lastName}
                        </span>
                                    </Link>
                                    <p className="comment-timestamp">{comment.timeStamp}</p>
                                  </div>
                                  <div className="comment-body">
                                    <p className="comment-text">{comment.comment}</p>
                                  </div>
                                  <hr className="comment-divider"/>
                                </div>
                            );
                        })
                    ) : (
                        <></>
                    )}
                </>
            ) : (
                <></>
            )}
        </div>
    );
};

export default PostCard;
