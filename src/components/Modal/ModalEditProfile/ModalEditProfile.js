import React, { useMemo, useState } from "react";
import { Button, Modal, Input, message, Divider, Row, Col } from "antd";
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
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [location, setLocation] = useState(user.location);
  const [profilePicture, setProfilePicture] = useState(user.profilePicture);
  const [originalProfilePicture, setOriginalProfilePicture] = useState(
    user.profilePicture
  );
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [email, setEmail] = useState(user.email)
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);

  const handleCancel = async () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setLocation(user.location);
    setEmail(user.email)
    setProfilePicture(originalProfilePicture);
    setModalOpenEditProfile(false);
  };

  const handleSave = async () => {
    try {
      // עדכון המסמך ב-Firestore עם הערכים החדשים
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        firstName: firstName || "",
        lastName: lastName || "",
        userName: `${firstName} ${lastName}` || "",
        email : email || "",
      });

      if (newProfilePicture) {
        let storageRef = "";
        if (user.userType === "Student") {
          storageRef = ref(
            storage,
            `StudentImages/${user.uid}/studentProfile/${newProfilePicture.name}`
          );
        } else {
        }
        await uploadBytes(storageRef, newProfilePicture);
        const downloadURL = await getDownloadURL(storageRef);
        await updateDoc(userRef, { profilePicture: downloadURL });

        setProfilePicture(downloadURL);
      }

      // עדכון ה-state המקומי
      setUser((prevUser) => ({
        ...prevUser,
        firstName: firstName,
        lastName: lastName,
        location: location,
        profilePicture: profilePicture,
        email:email,
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
        setNewProfilePicture(file);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      message.error("העלאת תמונה חדשה נכשלה.");
    } finally {
      setUploading(false);
    }
  };
  useMemo(() => {
    onSnapshot(collection(db, "Categories"), (response) => {
      setCategories(
        response.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
  });
  useMemo(() => {
    setOriginalProfilePicture(user.profilePicture);
  }, [modalOpenEditProfile]);

  return (
    <>
      <Modal
        title="עריכת פרופיל"
        centered
        open={modalOpenEditProfile}
        onOk={handleSave}
        onCancel={handleCancel}
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
          {user.userType === "Company" && (
            <>
              <h3>פרטי איש קשר</h3>
            </>
          )}
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
          <Row>
          {user.userType === "Student" && (
            <>
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
            </>
          )}</Row>
          <Divider />
          <Row>
          <Col span={12}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                דואר אלקטרוני
              </label>
              <Input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  );
};

export default ModalEditProfileComponent;
