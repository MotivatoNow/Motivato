import React, { useEffect, useState } from "react";
import { getCurrentTimeStamp } from "../../../features/useMoment/useMoment";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { message } from "antd";
import ModalMission from "../ModalMission/ModalMission";

const ModalEditMission = ({ isOpen, onClose, missions, user }) => {
  const [place, setPlace] = useState(missions.place);
  const [title, setTitle] = useState(missions.title);
  const [post, setPost] = useState(missions.post);
  const [type, setType] = useState(missions.type);
  const [education, setEducation] = useState(missions.education);
  const [educations, setEducations] = useState([]);

  
  const sendMission = async () => {
    // Update the Firestore document
    const updatedMission = {
      user: {
        uid: user?.uid || "No UID",
        username: user?.userName || "Anonymous",
        userType: user?.userType || "Anonymous",
        profilePicture: user?.profilePicture || "",
      },
      post: post,
      timeStamp: getCurrentTimeStamp("LLL"),
      place: place,
      title: title,
      type: type,
      education: education,
    };

    try {
      await updateDoc(doc(db, "Missions", missions.id), updatedMission);
      onClose(); // Close the modal after submission
      setPost("");
      setPlace("");
      setTitle("");
      setType("");
      setEducation("");
      message.success("פוסט התעדכן בהצלחה");
    } catch (error) {
      console.error("Error posting status: ", error);
    }
  };
  useEffect(() => {
    onSnapshot(collection(db, "Categories"), (response) => {
      setEducations(
        response.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
  });
  return (
    <ModalMission
      modalOpen={isOpen}
      setModalOpen={onClose}
      setPost={setPost}
      post={post}
      sendMission={sendMission}
      title={title}
      setTitle={setTitle}
      place={place}
      setPlace={setPlace}
      type={type}
      setType={setType}
      userType={user.userType}
      educations={educations}
      education={education}
      setEducation={setEducation}
      setEducations={setEducations}
    />
  );
};

export default ModalEditMission;
