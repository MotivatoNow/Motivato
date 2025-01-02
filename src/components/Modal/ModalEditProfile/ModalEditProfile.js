import React, { useMemo, useState } from "react";
import { Button, Modal, Input, message, Divider, Row, Col } from "antd";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../config/firebase";
import "./ModalEditProfile.css";
import {
  getAuth,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { EmailAuthProvider } from "firebase/auth/cordova";
import { MdDeleteOutline } from "react-icons/md";
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
  
  {newProfilePicture && (
    <div className="relative flex items-center justify-center text-gray-500 bg-gray-100 py-2 px-4 rounded-[5px] border-none shadow-sm cursor-pointer">
      <img
        src={newProfilePicture instanceof File ? URL.createObjectURL(newProfilePicture) : ""}
        alt="Preview"
        className="h-10 w-10 object-cover rounded-lg"
      />
      <MdDeleteOutline
        className="absolute top-1 right-1 cursor-pointer"
        size={20}
        onClick={deleteImage}
      />
    </div>
  )}
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
            )}
          </Row>
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
          <Row>
            <Col span={12}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סיסמה נוכחית:
              </label>
              <Input.Password
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="סיסמה נוכחית"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סיסמה חדשה:
              </label>
              <Input.Password
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="סיסמה חדשה"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Col>
            <Col span={12}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                אישור סיסמה חדשה:
              </label>
              <Input.Password
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="אישור סיסמה חדשה"
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
