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
import { loadData, loadFollowers } from "../../hooks/useLoadUsers";

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




  useEffect(() => {
    if (!id && currentUser) {
      navigate(`/profile/${currentUser.uid}`);
      return;
    }

    if (id) {
      loadData(id,setUserData,setUserNotFound,loadFollowers,setLoading,setFollowers);
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
      <div className="">
        {userData && (
          <>
        {userData.userType === "Student" ?(
            <StudentProfile user={userData} id={id} currentUser={currentUser} />
        ):
        (
          <CompanyProfile user={userData} currentUser={currentUser}/>
        )}
                </>
                
           )};
      </div></>)
};

export default Profile;
