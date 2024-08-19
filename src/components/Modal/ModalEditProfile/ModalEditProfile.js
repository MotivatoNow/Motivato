import React, { useState } from "react";
import { Button, Modal, Input } from "antd";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import "./ModalEditProfile.css";

const ModalEditProfileComponent = ({ modalOpen, setModalOpen, user, setUser }) => {
    const [bio, setBio] = useState(user.bio);
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [location, setLocation] = useState(user.location);
    const [profilePicture, setProfilePicture] = useState(user.profilePicture);

    const handleSave = async () => {
        try {
            // עדכון המסמך ב-Firestore עם הערכים החדשים
            const userRef = doc(db, "Users", user.uid);
            await updateDoc(userRef, {
                bio: bio,
                firstName: firstName,
                lastName: lastName,
            });

            // עדכון ה-state המקומי
            setUser((prevUser) => ({
                ...prevUser,
                bio: bio,
                firstName: firstName,
                lastName: lastName,
                location: location,
                profilePicture: profilePicture,
            }));

            setModalOpen(false); // סגירת המודל אחרי שמירה
        } catch (error) {
            console.error("Error updating user profile: ", error);
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
                    <Button key="submit" type="primary" onClick={handleSave}>
                        Save
                    </Button>,
                ]}
            >
                <label>עריכת תמונת פרופיל</label>
                <Input
                    type="text"
                    value={profilePicture}
                    onChange={(e) => setProfilePicture(e.target.value)}
                />

                <label>עריכת שם פרטי</label>
                <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />

                <label>עריכת שם משפחה</label>
                <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />

            </Modal>
        </>
    );
};

export default ModalEditProfileComponent;
