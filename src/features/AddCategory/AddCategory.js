import React, { useState } from "react";
import { storage, db } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { v4 as uid } from "uuid";
const AddCategory = ({setCategories} ) => {
  const [nameCategory, setNameCategory] = useState("");
  const [descriptionCategory, setDescriptionCategory] = useState("");
  const [imageCategory, setImageCategory] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nameCategory || !descriptionCategory || !imageCategory) {
      setError("All fields are required");
      return;
    }

    try {
      const storageRef = ref(storage, `categories/${imageCategory.name}`);
      await uploadBytes(storageRef, imageCategory);
      const imageURL = await getDownloadURL(storageRef);

      const categoryDocRef = doc(db, "Categories", nameCategory);

      const newCategories = {
        categoryId: uid(),
        nameCategory: nameCategory,
        descriptionCategory: descriptionCategory,
        imageURL: imageURL,
        count: 0,
      };

      await setDoc(categoryDocRef, newCategories);
      setCategories((prev) => [...prev, { ...newCategories, id: newCategories.categoryId }]);
      setSuccess("Category added successfully");
      setNameCategory("");
      setImageCategory(null);
      setDescriptionCategory("");
      
    } catch (error) {
      setError(error.message);
    }
  };

  return (
<div className="max-w-lg mx-auto mt-10 bg-base-100 p-6 rounded-lg shadow-md">
  <h2 className="text-2xl font-semibold text-gray-800 mb-4">הוסף קטגוריה</h2>
  <form onSubmit={handleAddCategory} className="space-y-4">
    {/* שם הקטגוריה */}
    <div className="form-control">
      <label className="label">
        <span className="label-text">שם הקטגוריה</span>
      </label>
      <input
        type="text"
        value={nameCategory}
        onChange={(e) => setNameCategory(e.target.value)}
        placeholder="שם הקטגוריה"
        className="input input-bordered"
        required
      />
    </div>
    {/* תיאור הקטגוריה */}
    <div className="form-control">
      <label className="label">
        <span className="label-text">תיאור</span>
      </label>
      <textarea
        value={descriptionCategory}
        onChange={(e) => setDescriptionCategory(e.target.value)}
        placeholder="תיאור"
        className="textarea textarea-bordered"
        required
      />
    </div>
    {/* העלאת תמונה */}
    <div className="form-control">
      <label className="label">
        <span className="label-text">בחר תמונה</span>
      </label>
      <input
        type="file"
        onChange={(e) => setImageCategory(e.target.files[0])}
        className="file-input file-input-bordered"
        required
      />
    </div>
    {/* כפתור שליחה */}
    <button
      type="submit"
      className="btn btn-primary w-full"
    >
      הוסף קטגוריה
    </button>
    {/* הודעות שגיאה/הצלחה */}
    {error && <p className="mt-2 text-sm text-error">{error}</p>}
    {success && <p className="mt-2 text-sm text-success">{success}</p>}
  </form>
</div>

  );
};
export default AddCategory;
