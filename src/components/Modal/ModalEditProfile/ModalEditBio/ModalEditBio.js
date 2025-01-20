import React, { useState } from "react";
import { Button, message, Input, Modal, Col } from "antd";
import {  doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../config/firebase";

const ModalEditBio = ({
  modalOpenEditBio,
  setModalOpenEditBio,
  user,
  setUser,
}) => {
  const [bio, setBio] = useState(user.bio);

  const handleSave = async () => {
    try {
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        bio: bio || "",
      });

      // עדכון ה-state המקומי
      setUser((prevUser) => ({
        ...prevUser,
        bio: bio,
      }));
      setModalOpenEditBio(false);
      message.success("נתונים נשמרו בהצלחה");
    } catch (error) {
      console.error("Error updating user profile: ", error);
      message.error(`בעיה בשמירת הנתונים ${error}`);
    }
  };

  return (
    <>
      <Modal
        title="עריכת אודות"
        open={modalOpenEditBio}
        onOk={handleSave}
        onCancel={() => setModalOpenEditBio(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalOpenEditBio(false)}>
            ביטול
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            שמור שינויים
          </Button>,
        ]}
      >
        <div></div>
        <label>אודות:</label>
        <textarea
  type="text"
  value={bio}
  className="w-full h-40 p-4 text-base border border-gray-300 rounded-md resize-none overflow-y-scroll focus:outline-none focus:ring-2 focus:ring-blue-500"
  onChange={(e) => {
    const value = e.target.value.replace(/\n{3,}/g, "\n\n"); // הגבלת רווחים לשתי שורות ריקות רצופות
    if (value.length <= 1000) {
      setBio(value);
    }
  }}
  maxLength="1000"
/>
<p className="text-sm text-gray-500 text-right">{bio.length}/1000</p>

      </Modal>
    </>
  );
};

export default ModalEditBio;
