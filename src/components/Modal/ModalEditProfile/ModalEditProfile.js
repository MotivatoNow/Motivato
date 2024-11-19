import React, { useState } from "react";
import { Button, Modal, Input, message, Divider, Row,Col } from "antd";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // ייבוא של הפונקציות מ-Firebase Storage
import { db, storage } from "../../../config/firebase";
import "./ModalEditProfile.css";
const ModalEditProfileComponent = ({
  modalOpen,
  setModalOpen,
  user,
  setUser,
}) => {
  const [bio, setBio] = useState(user.bio);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [location, setLocation] = useState(user.location);
  const [profilePicture, setProfilePicture] = useState(user.profilePicture);
  const [uploading, setUploading] = useState(false);
  const [relationship, setRelationship] = useState(user.relationship);
  const [userGitHub, setUserGitHub] = useState(user.userGitHub);
  const [userWebsite, setUserWebsite] = useState(user.userWebsite);
  const [userLinkedin, setUserLinkedin] = useState(user.userLinkedin);

  const handleSave = async () => {
    try {
      // עדכון המסמך ב-Firestore עם הערכים החדשים
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        bio: bio || "",
        firstName: firstName || "",
        lastName: lastName || "",
        relationship: relationship || "",
        userGitHub: userGitHub || "",
        userWebsite: userWebsite || "",
        userLinkedin: userLinkedin || "",
        userName: `${firstName} ${lastName}`,
      });

      // עדכון ה-state המקומי
      setUser((prevUser) => ({
        ...prevUser,
        bio: bio,
        firstName: firstName,
        lastName: lastName,
        location: location,
        profilePicture: profilePicture,
        userGitHub: userGitHub,
        userName: `${firstName} ${lastName}`,
        userWebsite: userWebsite,
        userLinkedin: userLinkedin,
        relationship: relationship,
      }));
      setModalOpen(false); // סגירת המודל אחרי שמירה
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

  return (
    <>
      <Modal
        title="עריכת פרופיל"
        centered
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>
            ביטול
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            שמור שינויים
          </Button>,
        ]}
      >
        <div className="modal-content">
          <label>תמונת פרופיל:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files[0])}
          />
          <Divider />

          <Row gutter={16}>
            <Col span={12}>
              <label>שם פרטי:</label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Col>
            <Col span={12}>
              <label>שם משפחה:</label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Col>
          </Row>
          <Divider />

          <label>אודות:</label>
<textarea
  type="text"
  value={bio}
  className="bioText"
  onChange={(e) => setBio(e.target.value)}
/>
          <Divider />

          <label>מיקום:</label>
          <Input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Divider />

          <label>מין:</label>
          <select
            name="relation"
            id="inputRelation"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
          >
            <option value=""></option>
            <option value="רווק/ה">רווק/ה</option>
            <option value="נשוי/ה">נשוי/ה</option>
            <option value="גרוש/ה">גרוש/ה</option>
          </select>
          <Divider />

          <h3>קישורים ברשת</h3>
          <label>GitHub:</label>
          <Input
            type="text"
            value={userGitHub}
            onChange={(e) => setUserGitHub(e.target.value)}
          />
          <Divider />

          <label>אתר אישי:</label>
          <Input
            type="text"
            value={userWebsite}
            onChange={(e) => setUserWebsite(e.target.value)}
          />
          <Divider />

          <label>LinkedIn:</label>
          <Input
            type="text"
            value={userLinkedin}
            onChange={(e) => setUserLinkedin(e.target.value)}
          />
        </div>
      </Modal>
    </>
  );
};

export default ModalEditProfileComponent;
