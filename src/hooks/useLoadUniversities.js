import { collection, onSnapshot } from "firebase/firestore"
import { db } from "../config/firebase"

export const loadUniversities=async(setUniversities)=>{
    onSnapshot(collection(db,"Universities"),(response)=>{
        setUniversities(
          response.docs.map((doc) => ({ id: doc.id, ...doc.data() })
        ))
      })
}