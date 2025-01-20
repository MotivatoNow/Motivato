import React, { useMemo, useState } from "react";
import { Button, Modal, Input, message, Divider, Row, Col } from "antd";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../config/firebase";
import {
  getAuth,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { EmailAuthProvider } from "firebase/auth/cordova";
import { MdDeleteOutline } from "react-icons/md";
import { CiCamera } from "react-icons/ci";
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
  const [email, setEmail] = useState(user.email);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async (currentPassword, newPassword) => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    try {
      
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
  
      await updatePassword(user, newPassword);
      return true
    } catch (error) {
      console.error( error);
  
      switch (error.code) {
        case "auth/wrong-password":
          message.error("הסיסמה הנוכחית שגויה");
          break;
        case "auth/weak-password":
          message.error("הסיסמה החדשה חלשה מדי");
          break;

          case "auth/invalid-credential":
            message.error(`שגיאה`);
            break;
        default:
          message.error(`שגיאה`);
      }
      return false
    }
  };
  
  const handleCancel = async () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setLocation(user.location);
    setEmail(user.email);
    setProfilePicture(originalProfilePicture);
    setModalOpenEditProfile(false);
  };

  const handleSave = async () => {
    if(newPassword&&newPassword!==confirmPassword){
      message.error("הסיסמאות החדשות לא תואמות");
      return;
    }

    if(newPassword){
      const passwordChangeSuccessful = await handleChangePassword(currentPassword, newPassword);
    if (!passwordChangeSuccessful) {return;}
    }
    try {
      // עדכון המסמך ב-Firestore עם הערכים החדשים
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        firstName: firstName || "",
        lastName: lastName || "",
        userName: `${firstName} ${lastName}` || "",
        email: email || "",
      });

      if (newProfilePicture) {
        let storageRef = "";
        if (user.userType === "Student") {
          storageRef = ref(
            storage,
            `StudentImages/${user.uid}/studentProfile/${newProfilePicture.name}`
          );
        } else {
          storageRef = ref(
            storage,
            `CompanyImages/${user.uid}/companyProfile/${newProfilePicture.name}`
          );
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
        email: email,
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

   const deleteImage = () => {
      setNewProfilePicture(null);
    };

  return (
    <>
     <Modal
      title={<h2 className="text-xl font-bold text-gray-800">עריכת פרופיל</h2>}
      centered
      open={modalOpenEditProfile}
      onOk={handleSave}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button
          key="cancel"
          onClick={() => setModalOpenEditProfile(false)}
          className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md px-4"
        >
          ביטול
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSave}
          className="bg-blue-500 text-white hover:bg-blue-600 rounded-md px-6"
        >
          שמור שינויים
        </Button>,
      ]}
    >
      <div className="modal-content space-y-6">
        {/* Profile Picture Upload */}
        <div className="flex flex-col gap-4">
          <label className="block text-sm font-medium text-gray-700">
            תמונת פרופיל:
          </label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-blue-600 transition"
            >
              <CiCamera size={20} />
              העלאת תמונה
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="hidden"
              />
            </label>
            {newProfilePicture && (
              <div className="relative flex items-center gap-4 bg-gray-100 p-2 rounded-md shadow-md">
                <img
                  src={
                    newProfilePicture instanceof File
                      ? URL.createObjectURL(newProfilePicture)
                      : ""
                  }
                  alt="Preview"
                  className="h-12 w-12 object-cover rounded-md"
                />
                <MdDeleteOutline
                  className="text-red-500 cursor-pointer hover:text-red-700"
                  size={24}
                  onClick={deleteImage}
                />
              </div>
            )}
          </div>
        </div>

        <Divider />

        {/* User Information */}
        <Row gutter={16}>
          <Col span={12}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שם פרטי:
            </label>
            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="שם פרטי"
              className="w-full p-2 border-gray-300 rounded-md"
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
              placeholder="שם משפחה"
              className="w-full p-2 border-gray-300 rounded-md"
            />
          </Col>
        </Row>

        {user.userType === "Student" && (
          <>
            <Divider />
            <label className="block text-sm font-medium text-gray-700 mb-2">
              מיקום:
            </label>
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="מיקום"
              className="w-full p-2 border-gray-300 rounded-md"
            />
          </>
        )}

        <Divider />

        {/* Email and Password */}
        <Row gutter={16}>
          <Col span={12}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              דואר אלקטרוני:
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="דואר אלקטרוני"
              className="w-full p-2 border-gray-300 rounded-md"
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סיסמה נוכחית:
            </label>
            <Input.Password
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="סיסמה נוכחית"
              className="w-full p-2 border-gray-300 rounded-md"
            />
          </Col>
          <Col span={12}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סיסמה חדשה:
            </label>
            <Input.Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="סיסמה חדשה"
              className="w-full p-2 border-gray-300 rounded-md"
            />
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              אישור סיסמה חדשה:
            </label>
            <Input.Password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="אישור סיסמה חדשה"
              className="w-full p-2 border-gray-300 rounded-md"
            />
          </Col>
        </Row>
      </div>
    </Modal>
    </>
  );
};

export default ModalEditProfileComponent;
