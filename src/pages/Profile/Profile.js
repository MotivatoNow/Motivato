import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"; // הוספת query ו-where לשליפת מידע לפי slug
import "./Profile.css";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import StudentProfile from "../../components/Profile/StudentProfile/StudentProfile";
import CompanyProfile from "../../components/Profile/CompanyProfile/CompanyProfile";
import { Loading } from "../../components/Loading/Loading";

const Profile = () => {
  const { slug } = useParams(); // שימוש ב-slug במקום id
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUserBySlug = async () => {
      try {
        setLoading(true);

        // יצירת שאילתה לשליפת משתמש לפי slug
        const q = query(
          collection(db, "Users"),
          where("slug", "==", slug)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setUserNotFound(true);
        } else {
          const userDoc = querySnapshot.docs[0];
          setUserData({ id: userDoc.id, ...userDoc.data() });
        }
      } catch (error) {
        console.error("Error fetching user by slug:", error);
        setUserNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchUserBySlug();
    }
  }, [slug]);

  if (loading) {
    return <Loading />;
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
    <div className="profile-container">
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
