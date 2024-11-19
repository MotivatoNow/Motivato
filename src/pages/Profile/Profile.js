import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,

} from "firebase/firestore"; // הוספת getDocs לשליפת מידע מרובה
import "./Profile.css";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import StudentProfile from "../../components/Profile/StudentProfile/StudentProfile";
import CompanyProfile from "../../components/Profile/CompanyProfile/CompanyProfile";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false);
  const { currentUser } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);

// Friends
const loadFriends = async (friendIds) => {
  try {
    const friendPromises = friendIds.map((friendId) =>
      getDoc(doc(db, "Users", friendId))
    );
    const friendDocs = await Promise.all(friendPromises);

    const loadedFriends = friendDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setFollowers(loadedFriends); // שמירת החברים בסטייט
  } catch (error) {
    console.error("Error loading friends:", error);
  }
};

  //user
  const loadData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "Users", id));
      if (userDoc.exists()) {
        setUserData({ id: userDoc.id, ...userDoc.data() });
        setUserNotFound(false);
        if (userDoc.data().friends) {
          loadFriends(userDoc.data().friends);
        }
      } else {
        setUserNotFound(true);
      }
    } catch (error) {
      console.error("Error getting user: ", error);
    }
    setLoading(false);
  };


  

  

  useEffect(() => {
    if (!id && currentUser) {
      navigate(`/profile/${currentUser.uid}`);
      return;
    }

    if (id) {
      loadData();
    }
  }, [id, currentUser, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (userNotFound) {
    return (
      <div className="not-found-container">
        <div className="not-found-content">
          <h1>User Not Found</h1>
          <p>Sorry, we couldn’t find the user you’re looking for.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className=" bg-[#f2f4f7] ">
        {userData && (
          <>
        {userData.userType === "Student" ?(
            <StudentProfile user={userData} currentUser={currentUser}/>
        ):
        (
          <CompanyProfile user={userData} currentUser={currentUser}/>
        )}
                </>
                
           )};
      </div></>)
};

export default Profile;
