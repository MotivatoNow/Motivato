import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Profile.css";

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
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

  return (
    <>
      {/* <div className="gradient-custom-2" style={{ backgroundColor: "#9de2ff" }}>
      <div
        className="rounded-top text-white d-flex flex-row"
        style={{ backgroundColor: "#000", height: "200px" }}
      >{/*background*/}
      {/*
        <div
          className="ms-4 mt-5 d-flex flex-column"
          style={{ width: "150px" }}
        >
          <img src={user.profilePicture} alt="Profile" />
          <button>Edit profile</button>
        </div>
        <div className="ms-3" style={{ marginTop: "130px" }}>
          <h3>
            {user.firstName} {user.lastName}
          </h3>
          <h4>מיקום</h4>
        </div>
      </div>
      <div className="mb-5">
        <p className="lead fw-normal mb-1">אודות</p>
        <div className="p-4">
          {user.bio === "" && <p>עדיין לא מילאת אודות</p>}
        </div>
      </div>
      <div className="mb-5">
        <p className="lead fw-normal mb-1">Education</p>
        <div>
          {user.studentEducation}
          <p>College:{user.studentCollege}</p>
        </div>
      </div>
    </div>*/}
      <div className="container">
        <div className="profile-header">
          <div className="profile-img">
            <img src={user.profilePicture} alt="Profile" />
          </div>
          <div className="profile-nav-info">
            <h3 className="user-name">
              {user.firstName} {user.lastName}
            </h3>
            <h4>מיקום</h4>
          </div>
        </div>
        <div className="profile-option">{/*notification*/}</div>
        <div className="main-bd">
          <div className="right-side">
            <div class="profile-side">
              <p class="user-education">
                {user.studentEducation},{" "}
                {user.studentCollege}
              </p>
              <p class="user-mail">
                <i class="fa fa-envelope"></i> {user.email}
              </p>
              <div class="user-bio">
                <h3>אודות</h3>
                <p class="bio">{user.bio}</p>
              </div>
              <div class="profile-btn">
                <button class="chatbtn" id="chatBtn">
                  <i class="fa fa-comment"></i> הודעה
                </button>
                <button class="createbtn" id="Create-post">
                  <i class="fa fa-plus"></i> פוסט חדש
                </button>
              </div>
            </div>
          </div>
          <div className="left-side">
            <div className="nav">
              <ul>
                <li className="user-post active">פוסטים</li>
                <li className="user-review">ביקורות</li>
                <li className="user-setting">הגדרות</li>
              </ul>
            </div>
            <div className="profile-body">
              <div className="profile-post tab">
                {/*collection post
                            אם אין פוסטים:
                             "אין פוסטים"
                        */}
              </div>
              <div className="profile-reviews tab">
                {/*collection reviews */}
              </div>
              <div className="profile-settings tab">
                <div className="account-setting">
                  <h1>הגדרות</h1>
                  <button>להעדכן בפרופיל</button>
                  <button> למחוק הפרופיל</button>
                  <button></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
