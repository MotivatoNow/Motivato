import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StudentProfile from "../../components/Profile/StudentProfile/StudentProfile";
import CompanyProfile from "../../components/Profile/CompanyProfile/CompanyProfile";
import { Loading } from "../../components/Loading/Loading";
import { loadData, loadFollowers } from "../../hooks/useLoadUsers";
import UserNotFound from "../../components/UserNotFound/UserNotFound";

const Profile = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false);
  const [followers, setFollowers] = useState([]);
  const { currentUser } = useAuth();

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
    return <Loading />;
  }

  if (userNotFound) {
    return <UserNotFound/>
  }

  return (
    <div className="min-h-screen">
      {userData && (
        <>
          {userData.userType === "Student" ? (
            <StudentProfile user={userData} currentUser={currentUser} />
          ) : (
            <CompanyProfile user={userData} currentUser={currentUser} />
          )}
        </>
      )}
    </div>
  );
};

export default Profile;
