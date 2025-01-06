import React, { useState } from "react";
import { storage, db } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { v4 as uid } from "uuid";
const AddUniversity = ({setUniversities} ) => {
  const [nameUniversity, setNameUniversity] = useState("");
  const [logoUniversity, setLogoUniversity] = useState(null);
  const [URLUniversity, setURLUniversity] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddUniversity = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nameUniversity || !logoUniversity || !URLUniversity) {
      setError("All fields are required");
      return;
    }

    try {
      const storageRef = ref(storage, `universities/${logoUniversity.name}`);
      await uploadBytes(storageRef, logoUniversity);
      const imageURL = await getDownloadURL(storageRef);

      const universityDocRef = doc(db, "Universities", nameUniversity);

      const newUniversity  = {
        universityId: uid(),
        nameUniversity: nameUniversity,
        logoUniversity: imageURL,
        URLUniversity:URLUniversity,
      };

      await setDoc(universityDocRef, newUniversity);
      setUniversities((prev) => [...prev, { ...newUniversity, id: newUniversity.universityId }]);
      
      setSuccess("University added successfully");
      setNameUniversity("");
      setLogoUniversity(null);
      setURLUniversity("");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        הוסף מוסד לימודי
      </h2>
      <form onSubmit={handleAddUniversity} className="space-y-4">
        <input
          type="text"
          value={nameUniversity}
          onChange={(e) => setNameUniversity(e.target.value)}
          placeholder="שם מוסד לימודי"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <input
          type="text"
          value={URLUniversity}
          onChange={(e) => setURLUniversity(e.target.value)}
          placeholder="אתר מוסד לימודי"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
          required
        />

        <input
          type="file"
          onChange={(e) => setLogoUniversity(e.target.files[0])}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          הוסף מוסד לימודי
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
      </form>
    </div>
  );
};
export default AddUniversity;
