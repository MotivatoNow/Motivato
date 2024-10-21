import React, {useEffect, useState} from "react";
import {
    doc,
    getDoc,
    
} from "firebase/firestore";
import {db} from "../../config/firebase";
import {useAuth} from "../../context/AuthContext";

const MissionCard = ({missions,user}) => {
    const {currentUser} = useAuth ();
    const [userData, setUserData] = useState (null);
    const [loading, setLoading] = useState (true);


    useEffect (() => {
        if (missions && missions.user.uid) {
            const fetchUserData = async () => {
                try {
                    const userDoc = await getDoc (doc (db, "Users", missions.user.uid));
                    if (userDoc.exists ()) {
                        setUserData (userDoc.data ());
                    } else {
                        console.log ("No such user!");
                    }
                } catch (error) {
                    console.error ("Error fetching user data:", error);
                } finally {
                    setLoading (false);
                }
            };
            fetchUserData ();
        }
    }, [missions.user.uid]);



    if (loading) {
        return <div>Loading...</div>;
    }

    if (!userData) {
        return <div>User data not found</div>;
    }

    return (
        <div className="post-card">
            <div className="post-header">
                <div className="user-info">
                    <img
                        src={userData.profilePicture || "defaultProfilePictureURL"} // Image de profil
                        alt="Profile"
                        className="user-profile-image"
                    />
                    <div className="user-details">
                        <h3 className="user-name">
                            {userData.firstName ? userData.firstName : "Unknown User"}{" "}
                            {userData.lastName ? userData.lastName : "Unknown User"}
                        </h3>
                        <p className="post-timestamp">{missions.timeStamp}</p>
                    </div>
                </div>
            </div>

            <div className="post-content">
                <h2>{missions.title}</h2>
                <p className="status">{missions.post}</p> {/* Texte de la publication */}
                
            </div>

            <hr/>
            <button>Send a message</button>
            <button>Apply</button>
            
        </div>
    );
};

export default MissionCard;
