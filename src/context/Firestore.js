import {db} from "../firebase"
import { addDoc,collection, onSnapshot } from "firebase/firestore"

let dbRef=collection(db,"Posts")
export const postStatus=(db,object)=>{
    addDoc(dbRef,object)
    .then((res)=>{
        console.log("Document has been added succesfully")
    })
    .catch((err)=>{
        console.log(err)
    })
}
export const getPosts=(setAllPosts)=>{
    onSnapshot(dbRef,(response)=>{
        setAllPosts(response.docs.map((docs)=>{
            return {...docs.data(),id:docs.id}
        }))
    })
}