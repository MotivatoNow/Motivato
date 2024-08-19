import React, { useState } from "react";
import "./MyPost.css";
import { postStatus } from "../../context/Firestore";
import ModalComponent from "../Modal/Modal";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";

const MyPost = () => {

  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState("");

  const sendStatus = async () => {
    let object={
      status:status,
      timeStamp:getCurrentTimeStamp("LLL")
    }
    await postStatus(object);
    await setModalOpen(false);
    await setStatus("");
  };

  return (
    <div className="post-status-main">
      <div className="post-status">
        <button className="open-post-modal" onClick={() => setModalOpen(true)}>
          {" "}
          Start a Post
        </button>
      </div>
      <ModalComponent
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        setStatus={setStatus}
        status={status}
        sendStatus={sendStatus}
      />
    </div>
  );
};

export default MyPost;
