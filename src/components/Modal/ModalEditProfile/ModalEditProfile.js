import React, { useMemo, useState } from "react";
import { Button, Modal, Input, message, Divider, Row,Col } from "antd";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // ייבוא של הפונקציות מ-Firebase Storage
import { db, storage } from "../../../config/firebase";
import "./ModalEditProfile.css";
const ModalEditProfileComponent = ({
  modalOpenEditProfile,
  setModalOpenEditProfile,
  user,
  setUser,
}) => {
  const [bio, setBio] = useState(user.bio);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [location, setLocation] = useState(user.location);
  const [profilePicture, setProfilePicture] = useState(user.profilePicture);
  const [uploading, setUploading] = useState(false);
const [categories,setCategories]=useState([])
  const handleSave = async () => {
    try {
      // עדכון המסמך ב-Firestore עם הערכים החדשים
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        firstName: firstName || "",
        lastName: lastName || "",
        userName: `${firstName} ${lastName}` || "",
      });

      // עדכון ה-state המקומי
      setUser((prevUser) => ({
        ...prevUser,
        firstName: firstName,
        lastName: lastName,
        location: location,
        profilePicture: profilePicture,
      }));
      setModalOpenEditProfile(false); // סגירת המודל אחרי שמירה
      message.success("נתונים נשמרו בהצלחה");
    } catch (error) {
      console.error("Error updating user profile: ", error);
      message.error(`בעיה בשמירת הנתונים ${error}`);
    }
  };

  //file
  const handleFileUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);

      // Create a reference in Firebase Storage
      const storageRef = ref(
        storage,
        `StudentsImages/${user.uid}/studentProfile/${file.name}`
      );
      await uploadBytes(storageRef, file); // Upload the file to Firebase Storage

      // Get the download URL of the uploaded image
      const downloadURL = await getDownloadURL(storageRef);

      // Update the profile picture URL in Firestore
      const userRef = doc(db, "Users", user.uid); // הקפד להשתמש ב-user.uid אם זה ה-ID שלך במסמך Firestore
      await updateDoc(userRef, { profilePicture: downloadURL });

      // Update the local state
      setProfilePicture(downloadURL);
      setUser((prevUser) => ({
        ...prevUser,
        profilePicture: downloadURL,
      }));
    } catch (error) {
      console.error("Error uploading file: ", error);
      message.error("העלאת תמונה חדשה נכשלה.");
    } finally {
      setUploading(false);
    }
  };
  useMemo(()=>{
    onSnapshot(collection(db,"Categories"),(response)=>{
      setCategories(
        response.docs.map((doc) => ({ id: doc.id, ...doc.data() })
      ))
    })
  })
  

  return (
    <>
<Modal
  title="עריכת פרופיל"
  centered
  open={modalOpenEditProfile}
  onOk={handleSave}
  onCancel={() => setModalOpenEditProfile(false)}
  footer={[
    <Button
      key="cancel"
      onClick={() => setModalOpenEditProfile(false)}
      className="bg-gray-200 text-gray-700 hover:bg-gray-300"
    >
      ביטול
    </Button>,
    <Button
      key="submit"
      type="primary"
      onClick={handleSave}
      className="bg-blue-500 text-white hover:bg-blue-600"
    >
      שמור שינויים
    </Button>,
  ]}
>
  <div className="modal-content space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        תמונת פרופיל:
      </label>
      <label className="inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-blue-600">
        העלאת תמונה
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          className="hidden"
        />
      </label>
    </div>
    <Divider />

    <Row gutter={16}>
      <Col span={12}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          שם פרטי:
        </label>
        <Input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Col>
      <Col span={12}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          שם משפחה:
        </label>
        <Input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Col>
    </Row>
    <Divider />

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        מיקום:
      </label>
      <Input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <Divider />
  </div>
</Modal>

    </>
  );
};

export default ModalEditProfileComponent;
