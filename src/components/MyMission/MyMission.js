import React, { useEffect, useState } from "react";
import ModalMission from "../Modal/ModalMission/ModalMission";
import { useAuth } from "../../context/AuthContext";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";
import { createMission } from "../../hooks/useLoadMissions";
import { createNotification } from "../../hooks/useLoadNotifications";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const MyMission = () => {
  const { currentUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [post, setPost] = useState("");
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [educations, setEducations] = useState([]); //array
  const [education, setEducation] = useState("");
  const [type, setType] = useState("");

  const sendMission = async () => {
    let object = {
      user: {
        uid: currentUser?.uid || "No UID",
        userName: currentUser?.userName || "Anonymous",
        userType: currentUser?.userType || "Anonymous",
        profilePicture: currentUser?.profilePicture || "",
      },
      post: post,
      timeStamp: getCurrentTimeStamp("LLL"),
      title: title,
      place: place,
      type: type,
      education: education,
    };

    try {
      const missionRef = await createMission(object);
      setModalOpen(false);
      setPost("");
      setTitle("");
      setPlace("");
      setType("");
      setEducation("");

      const notification = {
        type: "new Mission",
        user: currentUser.uid,
        missionTitle: title,
        missionId: missionRef.id,
        postUser: currentUser.uid,
        postUserName: currentUser.userName,
      };

      await createNotification(notification);
    } catch (error) {
      console.error("Error posting mission or creating notification: ", error);
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
    <div className="post-status-main">
      <div className="post-status">
        <button className="open-post-modal" onClick={() => setModalOpen(true)}>
          {" "}
          כתיבת משימה חדשה
        </button>
      </div>
      <ModalMission
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        setPost={setPost}
        post={post}
        sendMission={sendMission}
        title={title}
        setTitle={setTitle}
        place={place}
        setPlace={setPlace}
        type={type}
        setType={setType}
        userType={currentUser.userType}
        educations={educations}
        education={education}
        setEducation={setEducation}
        setEducations={setEducations}
      />
    </div>
  );
};

export default MyMission;
