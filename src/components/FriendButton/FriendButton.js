import React, {useState,useEffect} from 'react';
import {useAuth} from "../../context/AuthContext";
import {db} from "../../config/firebase";
import {collection, doc, getDoc} from "firebase/firestore";
import {Loading} from "../Loading/Loading";
import {useParams} from "react-router-dom";

const FriendButton = (user) => {
    const {currentUser} = useAuth();
    const [user, setUser] = useState (null);
    const [loading, setLoading] = useState (true);
    const {id} = useParams();
    //user
    const loadData = async () => {
        try {
            const userDoc = await getDoc (doc (db, "Users", id));
            if (userDoc.exists ()) {
                setUser ({id: userDoc.id, ...userDoc.data ()});
            } else {
            }
        } catch (error) {
            console.error ("Error getting user: ", error);
        }
        setLoading (false);
    };
    useEffect(() => {
        loadData(); // Charger les données une fois que le composant est monté
    }, [id]);

    // if(loading) return <Loading/>

    return (
        <>
            {!currentUser.uid === user.uid && (
               <button>הוספה לחברים</button>

                )}
        </>
    )
}

export default FriendButton;