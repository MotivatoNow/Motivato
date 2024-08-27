import React, { useState } from "react";
import { Button, Modal, Input, message } from "antd"; // ייבוא של message מ-Ant Design
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // ייבוא של הפונקציות מ-Firebase Storage
import { db, storage } from "../../../config/firebase";
import "./ModalEditProfile.css";
const ModalEditProfileComponent = ({ modalOpen, setModalOpen, user, setUser }) => {
    const [bio, setBio] = useState(user.bio);
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [location, setLocation] = useState(user.location);
    const [profilePicture, setProfilePicture] = useState(user.profilePicture);
    const [uploading, setUploading] = useState(false);
    const [relationship, setRelationship] = useState (user.relationship);
    const [userGitHub, setUserGitHub] = useState(user.userGitHub);
    const [userWebsite, setUserWebsite] = useState(user.UserWebsite)

    const handleSave = async () => {
        try {
            // עדכון המסמך ב-Firestore עם הערכים החדשים
            const userRef = doc(db, "Users", user.uid);
            await updateDoc(userRef, {
                bio: bio,
                firstName: firstName,
                lastName: lastName,
                relationship: relationship,
                userGitHub: userGitHub,
                userWebsite: userWebsite,
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
                userWebsite: userWebsite,
                relationship: relationship,// The updated profile picture URL
            }));

            setModalOpen(false); // סגירת המודל אחרי שמירה
        } catch (error) {
            console.error("Error updating user profile: ", error);
            message.error("הנתונים נשמרו בהצלחה")
        }
    };


    const handleFileUpload = async (file) => {
        if (!file) return;

        try {
            setUploading(true);

            // Create a reference in Firebase Storage
            const storageRef = ref(storage, `StudentsImages/${user.uid}/studentProfile/${file.name}`);
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

            message.success("תמונת הפרופיל עודכנה בהצלחה");
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
                onCancel={() => setModalOpen (false)}
                footer={[
                    <Button key="submit" type="primary" onClick={handleSave}>
                        Save
                    </Button>,
                ]}
            >
                <label>עריכת תמונת פרופיל</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload (e.target.files[0])}
                />

                <label>עריכת שם פרטי</label>
                <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName (e.target.value)}
                />

                <label>עריכת שם משפחה</label>
                <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName (e.target.value)}
                />
                <label>אודות</label>
                <textarea
                    type="text"
                    value={bio}
                    className="bioText"
                    onChange={(e) => setBio (e.target.value)}
                />

                <label htmlFor="inputRelation">מין</label>

                <select name="relation" id="inputRelation"
                        onChange={(e) => setRelationship (e.target.value)}>
                    <option value=""></option>
                    <option value="רווק/ה">רווק/ה</option>
                    <option value="נשוי/אר">נשוי/אר</option>
                    <option value="גרוש/ה">גרוש/ה</option>
                </select>

                <label>גיטהאב</label>
                <Input
                    type="text"
                    value={userGitHub}
                    onChange={(e) => setUserGitHub (e.target.value)}
                />
                <label>כתובת אתר אינטרנט אישי</label>
                <Input
                    type="text"
                    value={userWebsite}
                    onChange={(e) => setUserWebsite (e.target.value)}
                />

            </Modal>
        </>
    );
};

export default ModalEditProfileComponent;
