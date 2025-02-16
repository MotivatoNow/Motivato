import React, { useState, useEffect } from "react";
import { Button, Divider, Row, Input, Modal, List, message } from "antd";
import {
  arrayUnion,
  arrayRemove,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../../config/firebase";

const ModalEditSkills = ({
  modalOpenEditSkills,
  setModalOpenEditSkills,
  user,
  setUserData
}) => {
  const [skills, setSkills] = useState([]); // רשימת המיומנויות הנוכחית
  const [newSkill, setNewSkill] = useState(""); // מיומנות חדשה
  const [errorMessage, setErrorMessage] = useState(""); // הודעת שגיאה
  const [isUpdating, setIsUpdating] = useState(false); // למנוע עדכון כפול

  // טעינת מיומנויות בזמן פתיחת ה-Modal
  useEffect(() => {
    const userRef = doc(db, "Users", user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const fetchedSkills = doc.data().skills || [];
        // בדוק האם המידע שונה לפני עדכון הסטייט
        if (JSON.stringify(fetchedSkills) !== JSON.stringify(skills)) {
          setSkills(fetchedSkills);
        }
      }
    });

    return () => unsubscribe();
  }, [user.uid, skills]);

  // פונקציה להוספת מיומנות חדשה
  const handleAddSkill = async () => {
    if (!newSkill.trim()) {
      setErrorMessage("אנא הכנס מיומנות תקפה");
      return;
    }
    if (skills.includes(newSkill)) {
      setErrorMessage("המיומנות כבר קיימת");
      return;
    }
    if (skills.length >= 12) {
      setErrorMessage("ניתן להוסיף עד 12 מיומנויות בלבד");
      return;
    }
  
    setIsUpdating(true);
    try {
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        skills: arrayUnion(newSkill),
      });
  

      setSkills((prevSkills) => [...prevSkills, newSkill]);
  
      setUserData((prevUser) => ({
        ...prevUser,
        skills: [...(prevUser.skills || []), newSkill],
      }));
  
      setNewSkill("");
      setErrorMessage("");
      message.success("מיומנות נוספה בהצלחה");
    } catch (error) {
      console.error("Error adding skill: ", error);
      message.error("שגיאה בעת הוספת מיומנות");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDeleteSkill = async (skill) => {
    setIsUpdating(true);
    try {
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        skills: arrayRemove(skill),
      });
 
      setSkills((prevSkills) => prevSkills.filter((s) => s !== skill));
      setUserData((prevUser) => ({
        ...prevUser,
        skills: prevUser.skills.filter((s) => s !== skill),
      }));
  
      message.success("מיומנות נמחקה בהצלחה");
    } catch (error) {
      console.error("Error removing skill: ", error);
      message.error("שגיאה בעת מחיקת מיומנות");
    } finally {
      setIsUpdating(false);
    }
  };
  

  return (
    <>
      <Modal
        title="עריכת מיומנויות"
        open={modalOpenEditSkills}
        onCancel={() => setModalOpenEditSkills(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalOpenEditSkills(false)}>
            ביטול
          </Button>,
        ]}
      >
        <Divider />
        <h4>הוספת מיומנות</h4>
        <Row gutter={16}>
          <Input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="לדוגמה: JavaScript"
            disabled={isUpdating} // למנוע קלט בזמן עדכון
          />
          <Button
            type="primary"
            onClick={handleAddSkill}
            style={{ marginLeft: "10px" }}
            disabled={isUpdating} // למנוע קליקים כפולים
          >
            הוסף
          </Button>
        </Row>
        {errorMessage && (
          <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>
        )}
        <Divider />
        <h4>רשימת מיומנויות</h4>
        <List
          dataSource={skills}
          renderItem={(skill) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  danger
                  onClick={() => handleDeleteSkill(skill)}
                  disabled={isUpdating} // למנוע קליקים כפולים
                >
                  מחק
                </Button>,
              ]}
            >
              {skill}
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
};

export default ModalEditSkills;
