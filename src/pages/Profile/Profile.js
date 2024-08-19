import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Profile.css";
import { useAuth } from "../../context/AuthContext";
import ModalEditProfileComponent from "../../components/Modal/ModalEditProfile/ModalEditProfile";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false); // State to track if user is not found
  const { currentUser } = useAuth();
  const handleNavigation = (path) => {
    navigate (path);
  };
  const [modalOpen,setModalOpen]=useState(false)

  const loadData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "Users", id));
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() });
        setUserNotFound(false); // Reset the state if user is found
      } else {
        setUserNotFound(true); // Set the state if user is not found
      }
    } catch (error) {
      console.error("Error getting user: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    // If the user navigates to "/profile" without an ID, redirect to their own profile
    if (!id && currentUser) {
      navigate(`/profile/${currentUser.uid}`);
      return;
    }

    // Load user data if the id parameter exists
    if (id) {
      loadData();
    }
  }, [id, currentUser, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Display "User Not Found" if the user doesn't exist in the database
  if (userNotFound) {
    return <div className="not-found">User Not Found</div>;
  }

  const save=()=>{
    /*...*/
  }
  return (
      <div className="container">
        {user && (
            <>
              <div className="profile-header">
                <div className="profile-img">
                  <img src={user.profilePicture} alt="Profile"/>
                </div>
                <div className="profile-nav-info">
                  <h3 className="user-name">
                    {user.firstName} {user.lastName}
                  </h3>
                  <h4>Location</h4>
                </div>
                <button className="open-edit-modal" onClick={() => setModalOpen (true)}>
                  {" "}
                  הגדרות
                </button>
                <ModalEditProfileComponent
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    setUser={setUser}
                    user={currentUser}
                    save={save}
                />
              </div>
              <div className="profile-option">{/* notification */}</div>
              <div className="main-bd">
                <div className="right-side">
                  <div className="profile-side">
                    <p className="user-education">
                      {user.studentEducation}, {user.studentCollege}
                    </p>
                    <p className="user-mail">
                      <i className="fa fa-envelope"></i> {user.email}
                    </p>
                    <div className="user-bio">
                      <h3>About</h3>
                      <p className="bio">{user.bio}</p>
                    </div>
                    <div className="profile-btn">
                      <button className="chatbtn" id="chatBtn">
                        <i className="fa fa-comment"></i> Message
                      </button>
                      <button className="createbtn" id="Create-post">
                        <i className="fa fa-plus"></i> New Post
                      </button>
                    </div>
                  </div>
                </div>
                <div className="profile-body">
                  <div className="profile-post tab">
                    {/* Collection of posts
                      If no posts are found, display: "No posts yet" */}
                  </div>
                  <div className="profile-reviews tab">
                    {/* Collection of reviews */}
                  </div>
                  <div className="profile-settings tab">

                  </div>
                </div>
              </div>
            </>
        )}
      </div>
  );
};

export default Profile;
