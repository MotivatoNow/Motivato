import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../../../config/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { message, Modal, Input, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const ModalUniversity = ({ isOpen, onClose, setUniversity, universities }) => {
  const [editNameUniversity, setEditNameUniversity] = useState("");
  const [imageUniversity, setImageUniversity] = useState(null);
  const [URLUniversity, setURLUniversity] = useState(null)
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (universities) {
        setEditNameUniversity(universities.nameUniversity || "");
        setURLUniversity(universities.URLUniversity || "");
        setImageUniversity(universities.logoUniversity || null);
    } else {
      // Reset states when no category is provided
      setEditNameUniversity("");
      setImageUniversity(null);
      setImageUniversity("");
    }
  }, [universities]);

  const uploadUniversityImage = async (file) => {
    if (!file) return null;
    try {
      setUploading(true);
      const storageRef = ref(storage, `universities/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Error uploading image: ", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSaveUniversity = async () => {
    if (!universities) {
      message.error("מוסד לימודי לא נבחר");
      return;
    }
  
    let imageURL = "";
  
    if (imageUniversity && typeof imageUniversity !== "string") {
      try {
        imageURL = await uploadUniversityImage(imageUniversity);
      } catch (error) {
        console.error("Error uploading image: ", error);
        return;
      }
    } else {
      imageURL = imageUniversity;
    }
  
    const updatedUniversity = {
      nameUniversity: editNameUniversity,
      URLUniversity: URLUniversity,
      logoUniversity: imageURL,
    };
  
    try {
      await updateDoc(doc(db, "Universities", universities.id), updatedUniversity);
  
      // Update the state in real time
      setUniversity((PredUniversities) =>
        PredUniversities.map((cat) =>
          cat.id === universities.id ? { ...cat, ...updatedUniversity } : cat
        )
      );
  
      message.success("מוסד לימודי התעדכנה בהצלחה");
      onClose();
    } catch (error) {
      console.error("Error updating university: ", error);
      message.error("שגיאה בעדכון מוסד לימודי");
    }
  };
  

  const handleFileChange = (info) => {
    if (info.file.status !== "uploading") {
      setImageUniversity(info.file.originFileObj);
    }
  };

  return (
    <Modal
      title="עריכת מוסד לימודי"
      visible={isOpen}
      onCancel={onClose}
      onOk={handleSaveUniversity}
      okText="שמור"
      cancelText="ביטול"
    >
      {universities ? (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">שם מוסד לימודי</label>
            <Input
              value={editNameUniversity}
              onChange={(e) => setEditNameUniversity(e.target.value)}
              placeholder="הכנס שם מוסד לימודי"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              כתובת אתר מוסד הלימודי
            </label>
            <Input
              value={URLUniversity}
              onChange={(e) => setURLUniversity(e.target.value)}
              placeholder="הכנס כתובת אתר מוסד לימודי "
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">תמונה</label>
            <Upload
              beforeUpload={() => false}
              onChange={handleFileChange}
              accept="image/*"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>בחר תמונה</Button>
            </Upload>
            {imageUniversity && (
              <img
                src={
                  typeof imageUniversity === "string"
                    ? imageUniversity
                    : URL.createObjectURL(imageUniversity)
                }
                alt="Category"
                className="mt-4 w-32 h-32 object-cover"
              />
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-500">לא נבחרה מוסד לימודי לעריכה</p>
      )}
    </Modal>
  );
};

export default ModalUniversity;
