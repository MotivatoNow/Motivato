import React, {useEffect, useState} from "react";
import {missionsStatus} from "../../context/Firestore";
import ModalMission from "../Modal/ModalMission/ModalMission";
import {useAuth} from "../../context/AuthContext";
import {getCurrentTimeStamp} from "../../features/useMoment/useMoment";
import {collection, doc, getDoc} from "firebase/firestore";
import {db} from "../../config/firebase";

const MyPost = () => {

    const currentUser = useAuth ();
    const [modalOpen, setModalOpen] = useState (false);
    const [post, setPost] = useState ("");
    const [title,setTitle]=useState("");
    const [place,setPlace]=useState("")
    const [type,setType]=useState("")

    const sendMission = async () => {
    
        let object = {
            user: {
                uid: currentUser?.currentUser?.uid || "No UID",
                firstName: currentUser?.currentUser?.firstName || "Anonymous",
                lastName: currentUser?.currentUser?.lastName || "Anonymous",
            },
            post: post,
            timeStamp: getCurrentTimeStamp("LLL"),
            title:title,
            place:place,
            type:type
        };
    
        try {
            await missionsStatus(collection(db, "Missions"), object);
            setModalOpen(false);
            setPost("");
            setTitle("");
            setPlace("")
            setType("")
        } catch (error) {
            console.error("Error posting status: ", error); 
        }
    };
    
    return (
        <div className="post-status-main">
            <div className="post-status">
                <button className="open-post-modal" onClick={() => setModalOpen (true)}>
                    {" "}
                    Start a Mission
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
            />
        </div>
    );
};

export default MyPost;
