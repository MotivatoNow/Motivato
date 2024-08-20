import React, {useEffect, useState} from "react";
import "./MyPost.css";
import { useParams } from "react-router-dom";
import { postStatus } from "../../context/Firestore";
import ModalComponent from "../Modal/ModalPost/Modal";
import { useAuth } from "../../context/AuthContext";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";
import {doc, getDoc} from "firebase/firestore";
import {db} from "../../config/firebase";

const MyPost = () => {
  /*const {id} = useParams();
  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(true);
*/
  const currentUser = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [post, setPost] = useState("");


 /* const loadData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "Users", id));
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() });
      } else {
        console.log("No such user!");
      }
    } catch (error) {
      console.error("Error getting user: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return (
        <div className="loading-indicator">
          <div className="spinner"></div>
        </div>
    );
  }
*/

  const sendPost = async () => {
    let object = {
      user: {
        uid: currentUser?.currentUser?.uid || "No UID",
        firstName: currentUser?.currentUser?.firstName || "Anonymous",
        lastName: currentUser?.currentUser?.lastName || "Anonymous",
      },
      post: post,
      timeStamp: getCurrentTimeStamp("LLL"),
    };

    console.log(object.user);
    await postStatus(object);
    await setModalOpen(false);
    await setPost("");
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
        setPost={setPost}
        post={post}
        sendPost={sendPost}
      />
    </div>
  );
};

export default MyPost;
