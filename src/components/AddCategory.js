import React, {useState} from "react";
import {storage,db} from "../firebase";
import {ref,uploadBytes,getDownloadURL} from "firebase/storage"
import {doc,setDoc} from "firebase/firestore";

const AddCategory=()=>{
    const [nameCategory,setNameCategory]=useState("")
    const [descriptionCategory,setDescriptionCategory]=useState("")
    const [imageCategory,setImageCategory]=useState(null)
    const [error,setError]=useState("")
    const [success,setSuccess]=useState("")

    const handleAddCategory=async(e)=>{
        e.preventDefault()
        setError("")
        setSuccess("")

        if(!nameCategory||!descriptionCategory||!imageCategory){
            setError("All fields are required")
            return;
        }

        try{

            const storageRef=ref(storage,`categories/${imageCategory.name}`);
            await uploadBytes(storageRef,imageCategory);
            const imageURL=await getDownloadURL(storageRef)

            const categoryData={
                nameCategory:nameCategory,
                descriptionCategory:descriptionCategory,
                imageURL:imageURL,
                count:0
            };

            const categoryDocRef=doc(db,"Categories",nameCategory);
            await setDoc(categoryDocRef,categoryData);

            setSuccess('Category added successfully');
        }
        catch (error){
            setError(error.message);
        }
    };

    return(
        <div className="add-category">
            <form onSubmit={handleAddCategory}>
                <input type="text" value={nameCategory} onChange={(e)=>setNameCategory(e.target.value)}
                       placeholder="שם הקטגוריה" required/>
                <textarea value={descriptionCategory} onChange={(e)=>setDescriptionCategory(e.target.value)}
                        placeholder="תיאור" required/>
                <input type="file" onChange={(e)=>setImageCategory(e.target.files[0])}
                        required/>
                <button type="submit">Add Category</button>
                {error && <p>{error}</p>}
                {success &&<p>{success}</p>}
            </form>
        </div>
    )
}
export default AddCategory;