import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../../../config/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { message, Modal, Input, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const ModalCategories = ({ isOpen, onClose, setCategories, categories }) => {
  const [editNameCategory, setEditNameCategory] = useState("");
  const [imageCategory, setImageCategory] = useState(null);
  const [descriptionCategory, setDescriptionCategory] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (categories) {
      setEditNameCategory(categories.nameCategory || "");
      setImageCategory(categories.imageCategory || null);
      setDescriptionCategory(categories.descriptionCategory || "");
    } else {
      // Reset states when no category is provided
      setEditNameCategory("");
      setImageCategory(null);
      setDescriptionCategory("");
    }
  }, [categories]);

  const uploadCategoryImage = async (file) => {
    if (!file) return null;
    try {
      setUploading(true);
      const storageRef = ref(storage, `categories/${file.name}`);
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

  const handleSaveCategory = async () => {
    if (!categories) {
      message.error("קטגוריה לא נבחרה");
      return;
    }
  
    let imageURL = "";
  
    if (imageCategory && typeof imageCategory !== "string") {
      try {
        imageURL = await uploadCategoryImage(imageCategory);
      } catch (error) {
        console.error("Error uploading image: ", error);
        return;
      }
    } else {
      imageURL = imageCategory;
    }
  
    const updatedCategory = {
      nameCategory: editNameCategory,
      descriptionCategory,
      imageCategory: imageURL,
    };
  
    try {
      await updateDoc(doc(db, "Categories", categories.id), updatedCategory);
  
      // Update the state in real time
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === categories.id ? { ...cat, ...updatedCategory } : cat
        )
      );
  
      message.success("קטגוריה התעדכנה בהצלחה");
      onClose();
    } catch (error) {
      console.error("Error updating category: ", error);
      message.error("שגיאה בעדכון קטגוריה");
    }
  };
  

  const handleFileChange = (info) => {
    if (info.file.status !== "uploading") {
      setImageCategory(info.file.originFileObj);
    }
  };

  return (
<Modal
  title="עריכת קטגוריה"
  visible={isOpen}
  onCancel={onClose}
  onOk={handleSaveCategory}
  okText="שמור"
  cancelText="ביטול"
>
  {categories ? (
    <div className="space-y-4">
      {/* שם הקטגוריה */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">שם קטגוריה</span>
        </label>
        <Input
          value={editNameCategory}
          onChange={(e) => setEditNameCategory(e.target.value)}
          placeholder="הכנס שם קטגוריה"
          className="input input-bordered"
        />
      </div>

      {/* תיאור הקטגוריה */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">תיאור קטגוריה</span>
        </label>
        <Input.TextArea
          value={descriptionCategory}
          onChange={(e) => setDescriptionCategory(e.target.value)}
          placeholder="הכנס תיאור קטגוריה"
          className="textarea textarea-bordered"
        />
      </div>

      {/* העלאת תמונה */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">תמונה</span>
        </label>
        <Upload
          beforeUpload={() => false}
          onChange={handleFileChange}
          accept="image/*"
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>בחר תמונה</Button>
        </Upload>
        {imageCategory && (
          <img
            src={
              typeof imageCategory === "string"
                ? imageCategory
                : URL.createObjectURL(imageCategory)
            }
            alt="Category"
            className="mt-4 w-32 h-32 rounded-lg object-cover"
          />
        )}
      </div>
    </div>
  ) : (
    <p className="text-gray-500">לא נבחרה קטגוריה לעריכה</p>
  )}
</Modal>

  );
};

export default ModalCategories;
