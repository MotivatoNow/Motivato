import React from 'react'
import "./PostCard.css"
const PostCard = ({posts}) => {
  return (
    <div className='posts-card'>
        <p>{posts.userEmail}</p>
        <p className='status'>{posts.status}</p>
    </div>
  )
}

export default PostCard