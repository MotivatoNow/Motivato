import React from 'react'
import "./PostCard.css"
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
const PostCard = ({posts}) => {

  return (
    <div className='posts-card'>
        <h1>{posts.user}</h1>
        <p>{posts.timeStamp}</p>
        <p className='status'>{posts.post}</p>
    </div>
  )
}

export default PostCard