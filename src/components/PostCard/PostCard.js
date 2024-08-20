import React from 'react';
import "./PostCard.css";

const PostCard = ({posts}) => {
    return (
        <div className='posts-card'>
            <h1>{posts.user.firstName ? posts.user.firstName : "Unknown User"}
                 {posts.user.lastName ? posts.user.lastName : "Unknown User"}</h1>
            <p>{posts.timeStamp}</p>
            <p className='status'>{posts.post}</p>
        </div>
    );
}

export default PostCard;
