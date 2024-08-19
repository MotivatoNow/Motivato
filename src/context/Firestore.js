import {db} from "../firebase"
import { addDoc,collection, onSnapshot } from "firebase/firestore"

let dbRef=collection(db,"Posts")
export const postStatus=(object)=>{
    addDoc(dbRef,object)
    .then((res)=>{
        console.log("Document has been added succesfully")
    })
    .catch((err)=>{
        console.log(err)
    })
}
export const getStatus=(setAllStatus)=>{
    onSnapshot(dbRef,(response)=>{
        setAllStatus(response.docs.map((docs)=>{
            return {...docs.data(),id:docs.id}
        }))
    })
}