import React,{useState} from 'react'
import {Button, Divider,Row,message,Input,Modal, Col} from 'antd';
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../../config/firebase";

const ModalEditWebsites = ({
  modalOpenEditWebsites,
  setModalEditWebsites,
  user,
  setUser,
  setUserData
}) => {
  const [userGitHub, setUserGitHub] = useState(user.userGitHub);
  const [userWebsite, setUserWebsite] = useState(user.userWebsite);
  const [userLinkedin, setUserLinkedin] = useState(user.userLinkedin);
  const [nameUserLinkedin, setNameUserLinkedin] = useState(user.nameUserLinkedin)
  const [nameUserWebsite, setNameUserWebsite] = useState(user.nameUserWebsite)
  const [nameUserGithub, setNameUserGithub] = useState(user.nameUserGithub)

  const handleSave = async () => {
    try {
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        userGitHub: userGitHub || "",
        userWebsite: userWebsite || "",
        userLinkedin: userLinkedin || "",
        nameUserLinkedin: nameUserLinkedin || "",
        nameUserWebsite: nameUserWebsite || "",
        nameUserGithub: nameUserGithub || "",
      });

      // ✅ עדכון `setUserData` כדי לעדכן את הפרופיל הראשי
      setUserData((prevUser) => ({
        ...prevUser,
        userGitHub,
        userWebsite,
        userLinkedin,
        nameUserLinkedin,
        nameUserWebsite,
        nameUserGithub,
      }));

      setModalEditWebsites(false);
      message.success("הקישורים עודכנו בהצלחה!");
    } catch (error) {
      console.error("Error updating user profile: ", error);
      message.error("שגיאה בעת עדכון הקישורים.");
    }
  };


  return (
    <>
      <Modal
      title="עריכת קישורים ברשת"
      open={modalOpenEditWebsites}
      onOk={handleSave}
      onCancel={()=>setModalEditWebsites(false)}
      footer={[
        <Button key="cancel" onClick={()=>setModalEditWebsites(false)}>ביטול</Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
        שמור שינויים
      </Button>,
      ]}
      >
        <div></div>
        <Divider />
        <Row gutter={16}>
        <Col span={12}>
        <label>כתובת הלינקדין:</label>
          <Input
            type="text"
            value={userLinkedin}
            onChange={(e) => setUserLinkedin(e.target.value)}
          />
        </Col>

        <Col span={12}>
        <label>שם לינקדין</label>
          <Input
            type="text"
            value={nameUserLinkedin}
            onChange={(e) => setNameUserLinkedin(e.target.value)}
          />
        </Col>
          </Row>
          <Divider />
        <Row gutter={16}>
       <Col span={12}>
       <label>כתובת האתר:</label>
          <Input
            type="text"
            value={userWebsite}
            onChange={(e) => setUserWebsite(e.target.value)}
          />
       </Col>
       <Col span={12}>
       <label>שם האתר</label>
          <Input
            type="text"
            value={nameUserWebsite}
            onChange={(e) => setNameUserWebsite(e.target.value)}
          />
       </Col>
          </Row>
          <Divider />
{user.userType !== "Company" &&(
          <Row gutter={16}>
          <Col span={12}>
          <label>כתובת גיטהאב:</label>
           <Input
               type="text"
               value={userGitHub}
               onChange={(e) => setUserGitHub(e.target.value)}
             />
          </Col>
          <Col span={12}>
          <label>שם גיטהאב</label>
             <Input
               type="text"
               value={nameUserGithub}
               onChange={(e) => setNameUserGithub(e.target.value)}
             />
          </Col>
             </Row>
)}

        
      </Modal>
    </>

  )
}

export default ModalEditWebsites