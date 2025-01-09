import { onSnapshot, collection } from "firebase/firestore"
import React from "react"
import { db } from "../config/firebase"

export const loadCategories=async(setCategories)=>{
    onSnapshot(collection(db,"Categories"),(response)=>{
      setCategories(
        response.docs.map((doc) => ({ id: doc.id, ...doc.data() })
      ))
    })
}
