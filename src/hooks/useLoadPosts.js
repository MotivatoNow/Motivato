import { message } from "antd";
import { addDoc, collection, onSnapshot } from "firebase/firestore"
import { db } from "../config/firebase";

const postsCollection=collection(db, "Posts");

export const createPost=async(object)=>{
    try{
        await addDoc(postsCollection, object);
        message.success("Document has been added successfully")
    }
    catch(error){
        console.log(error)
    }
}

export const loadPosts=(setAllPosts)=>{
    onSnapshot(postsCollection,(snapshot)=>{
        const posts=snapshot.docs.map((doc)=>({...doc.data(),id:doc.id,}))
        setAllPosts(posts)
    })
}

export const loadPostByID=(id,setAllPosts)=>{
    onSnapshot(postsCollection,(snapshot)=>{
        const userPosts=snapshot.docs
            .map((doc)=>({...doc.data(),id:doc.id,}))
            .filter((post)=>post.user?.uid===id)
        setAllPosts(userPosts)
    })
}