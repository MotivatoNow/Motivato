import React, {useEffect, useState} from "react";
import "./MyPost.css";
import {useParams} from "react-router-dom";
import {postStatus} from "../../context/Firestore";
import ModalComponent from "../Modal/ModalPost/Modal";
import {useAuth} from "../../context/AuthContext";
import {getCurrentTimeStamp} from "../../features/useMoment/useMoment";
import {collection, doc, getDoc} from "firebase/firestore";
import {db} from "../../config/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../firebase";

const MyPost = () => {

    const currentUser = useAuth ();
    const [modalOpen, setModalOpen] = useState (false);
    const [post, setPost] = useState ("");
    const [postImage, setPostImage] = useState(null)

    const sendPost = async () => {
        let imageURL = ''; // Variable pour stocker l'URL de l'image
        if (postImage) {
            try {
                imageURL = await uploadPostImage(postImage); // Téléchargez l'image et obtenez l'URL
            } catch (error) {
                console.error("Error uploading image: ", error);
                return; // Arrêtez l'exécution si une erreur se produit
            }
        }
    
        let object = {
            user: {
                uid: currentUser?.currentUser?.uid || "No UID",
                firstName: currentUser?.currentUser?.firstName || "Anonymous",
                lastName: currentUser?.currentUser?.lastName || "Anonymous",
            },
            post: post,
            timeStamp: getCurrentTimeStamp("LLL"),
            postImage: imageURL, // Utilisez l'URL de l'image ici
        };
    
        try {
            await postStatus(collection(db, "Posts"), object); // Enregistrez l'objet dans Firestore
            setModalOpen(false);
            setPost("");
            setPostImage(null);
        } catch (error) {
            console.error("Error posting status: ", error); // Gérer les erreurs lors de l'ajout à Firestore
        }
    };
    
    const uploadPostImage = async (file) => {
        const storageRef = ref(storage, `ImagePost/${currentUser.uid}/${file.name}`); // Chemin vers le stockage
        await uploadBytes(storageRef, file); // Téléchargez le fichier
        const url = await getDownloadURL(storageRef); // Obtenez l'URL de téléchargement
        return url; // Retournez l'URL de l'image
    };
    return (
        <div className="post-status-main">
            <div className="post-status">
                <button className="open-post-modal" onClick={() => setModalOpen (true)}>
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
                postImage={postImage}
                setPostImage={setPostImage}
            />
        </div>
    );
};

export default MyPost;
