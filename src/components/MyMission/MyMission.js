import React, { useEffect, useState } from "react";
import ModalMission from "../Modal/ModalMission/ModalMission";
import { useAuth } from "../../context/AuthContext";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";
import { createMission } from "../../hooks/useLoadMissions";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebase";

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
    <div className="flex items-center justify-center p-10 shadow-sm">
      <div className="bg-gray-50 rounded-[5px] w-full p-3  ">
        <button className="" onClick={() => setModalOpen(true)}>
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
