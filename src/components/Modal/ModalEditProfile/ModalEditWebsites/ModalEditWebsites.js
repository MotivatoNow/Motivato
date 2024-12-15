import React,{useState} from 'react'
import {Button, Divider,Row,message,Input,Modal, Col} from 'antd';
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../../config/firebase";

const ModalEditWebsites = ({
  modalOpenEditWebsites,
  setModalEditWebsites,
  user,
  setUser,
}) => {
  const [userGitHub, setUserGitHub] = useState(user.userGitHub);
  const [userWebsite, setUserWebsite] = useState(user.userWebsite);
  const [userLinkedin, setUserLinkedin] = useState(user.userLinkedin);
  const [nameUserLinkedin, setNameUserLinkedin] = useState(user.nameUserLinkedin)

  const handleSave = async () => {
    try {
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        userGitHub: userGitHub || "",
        userWebsite: userWebsite || "",
        userLinkedin: userLinkedin || "",
        nameUserLinkedin : nameUserLinkedin || "",
      });

      // עדכון ה-state המקומי
      setUser((prevUser) => ({
        ...prevUser,
        userGitHub: userGitHub,
        userWebsite: userWebsite,
        userLinkedin: userLinkedin,
        nameUserLinkedin:nameUserLinkedin,
      }));
      setModalEditWebsites(false);
      message.success("נתונים נשמרו בהצלחה");
    } catch (error) {
      console.error("Error updating user profile: ", error);
      message.error(`בעיה בשמירת הנתונים ${error}`);
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
        <label>קישור ללינקדין:</label>
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
        <label>אתר אישי:</label>
          <Input
            type="text"
            value={userWebsite}
            onChange={(e) => setUserWebsite(e.target.value)}
          />
          </Row>
          <Divider />
        <Row gutter={16}>
        <label>גיטהאב:</label>
        <Input
            type="text"
            value={userGitHub}
            onChange={(e) => setUserGitHub(e.target.value)}
          />
          </Row>

        
      </Modal>
    </>

  )
}

export default ModalEditWebsites