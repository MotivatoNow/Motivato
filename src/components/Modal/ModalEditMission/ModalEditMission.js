import React, { useState } from 'react'
import { getCurrentTimeStamp } from '../../../features/useMoment/useMoment';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { message } from 'antd';
import ModalMission from '../ModalMission/ModalMission';

const ModalEditMission = ({isOpen,onClose,missions,user}) => {
    const [place,setPlace]=useState(missions.place)
    const[title,setTitle]=useState(missions.title)
    const [post, setPost] = useState(missions.post);
    const [uploading,setUploading]=useState(false)
    const [type,setType]=useState(missions.type)

    const sendMission = async () => {
        // Update the Firestore document
        const updatedMission = {
            user: {
                uid: user?.uid || "No UID",
                username: user?.userName || "Anonymous",
            },
            post: post,
            timeStamp: getCurrentTimeStamp("LLL"),
            place:place,
            title:title,
            type:type
        };
    
        try {
            await updateDoc(doc(db, "Missions", missions.id), updatedMission);
            onClose(); // Close the modal after submission
            setPost("");
            setPlace("");
            setTitle("")
            setType("")
            message.success("פוסט התעדכן בהצלחה")
        } catch (error) {
            console.error("Error posting status: ", error);
        }
    };
    
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
        />
    );
}

export default ModalEditMission