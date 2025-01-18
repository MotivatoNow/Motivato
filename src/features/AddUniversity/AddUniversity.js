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
    <div className="max-w-lg mx-auto mt-10 bg-base-100 p-6 rounded-lg shadow-md">
  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
    הוסף מוסד לימודי
  </h2>
  <form onSubmit={handleAddUniversity} className="space-y-4">
    {/* שם מוסד לימודי */}
    <div className="form-control">
      <label className="label">
        <span className="label-text">שם מוסד לימודי</span>
      </label>
      <input
        type="text"
        value={nameUniversity}
        onChange={(e) => setNameUniversity(e.target.value)}
        placeholder="שם מוסד לימודי"
        className="input input-bordered w-full"
        required
      />
    </div>

    {/* אתר מוסד לימודי */}
    <div className="form-control">
      <label className="label">
        <span className="label-text">אתר מוסד לימודי</span>
      </label>
      <input
        type="text"
        value={URLUniversity}
        onChange={(e) => setURLUniversity(e.target.value)}
        placeholder="אתר מוסד לימודי"
        className="input input-bordered w-full"
        required
      />
    </div>

    {/* העלאת לוגו */}
    <div className="form-control">
      <label className="label">
        <span className="label-text">לוגו מוסד לימודי</span>
      </label>
      <input
        type="file"
        onChange={(e) => setLogoUniversity(e.target.files[0])}
        className="file-input file-input-bordered w-full"
        accept="image/*"
        required
      />
    </div>

    {/* כפתור שליחה */}
    <button
      type="submit"
      className="btn btn-primary w-full"
    >
      הוסף מוסד לימודי
    </button>

    {/* הודעות שגיאה/הצלחה */}
    {error && <p className="text-error text-sm mt-2">{error}</p>}
    {success && <p className="text-success text-sm mt-2">{success}</p>}
  </form>
</div>

  );
};
export default AddUniversity;
