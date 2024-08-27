import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../config/firebase";
import { collection, doc, getDoc } from "firebase/firestore";
import "./Profile.css";
import { useAuth } from "../../context/AuthContext";
import ModalEditProfileComponent from "../../components/Modal/ModalEditProfile/ModalEditProfile";
import { getPosts, getPostsByID, postStatus } from "../../context/Firestore";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";
import PostCard from "../../components/PostCard/PostCard";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false); // State to track if user is not found
  const { currentUser } = useAuth();
  const [post, setPost] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");

  //user
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

  // פונקציה לטעינת הפוסטים של המשתמש
  const loadUserPosts = () => {
    if (user && user.uid) {
      try {
        getPostsByID(user.uid, setAllPosts); // העברת ה-uid של המשתמש לפונקציה
      } catch (error) {
        console.error("Error fetching posts: ", error);
      }
    }
  };

  // הפעלת הפונקציה בכל פעם שה-uid משתנה
  useEffect(() => {
    if (user && user.uid) {
      loadUserPosts(); // טעינת הפוסטים ברגע שהפרופיל נטען
    }
  }, [user]); // שים לב שהפונקציה תלויה ב-user, לא רק ב-user.uid

  if (loading) {
    return <div>Loading...</div>;
  }

  // Display "User Not Found" if the user doesn't exist in the database
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
  const sendPost = async () => {
    let object = {
      user: {
        uid: user.uid || "No UID",
        firstName: user.firstName || "Anonymous",
        lastName: user.lastName || "Anonymous",
      },
      post: post,
      timeStamp: getCurrentTimeStamp("LLL"),
    };

    console.log(object.user);
    await postStatus(collection(db, "Posts"), object);
    await setPost("");
  };

  return (
    <>
      <div className="profile_container">
        {user && (
          <>
            <div className="profile-page">
              <div className="profile-layout">
                {/* Sidebar */}
                <aside className="profile-sidebar">
                  <div className="sidebar-content">
                    <div className="profile-picture">
                      <img src={user.profilePicture} alt="Profile" />
                    </div>
                  </div>
                  <div className="profile-info">
                    <h2 className="profile-name">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="profile-location">
                      <i className="fa fa-map-marker-alt"></i>{" "}
                      {user.location || "Location"}
                    </p>
                    <p className="profile-gander">
                      <i className="fa fa-solid fa-male"></i>{" "}
                      {user.userGender || ""}
                    </p>
                    <p className="profile-relationship">
                      <i className="fa fa-solid fa-heart"></i>{" "}
                      {user.relationship || ""}
                    </p>
                    <p className="profile-github">
                      <i className=""></i>{" "}
                      {user.userGitHub || ""}
                    </p>
                    <p className="profile-website">
                      <i className=""></i>{" "}
                      {user.userWebsite || ""}
                    </p>
                  </div>
                  <div className="profile-details">
                    <div className="profile-section education-section">
                      <h4>Education</h4>
                      <p>
                        {user.studentEducation || "No information"},{" "}
                        {user.studentCollege || "No college/university"}
                      </p>
                    </div>
                    <div className="profile-section contact-section">
                      <h4>Contact</h4>
                      <p>
                        <i className="fa fa-envelope"></i> {user.email}
                      </p>
                    </div>{" "}
                    {currentUser.uid === user.uid && (
                      <button
                        className="settings-btn"
                        onClick={() => setModalOpen(true)}
                      >
                        Settings
                      </button>
                    )}
                  </div>
                </aside>

                {/* Main Profile Section */}
                <main className="profile-main">
                  <header className="profile-header">
                    {currentUser.uid === user.uid ? (
                      <></>
                    ) : (
                      <div className="header-title">
                        <h2>
                          שלום {currentUser.firstName} {currentUser.lastName}
                        </h2>
                      </div>
                    )}
                    <nav className="profile-nav">
                      <ul>
                        <li
                          className={activeTab === "posts" ? "active" : ""}
                          onClick={() => setActiveTab("posts")}
                        >
                          Posts
                        </li>
                        <li
                          className={activeTab === "about" ? "active" : ""}
                          onClick={() => setActiveTab("about")}
                        >
                          About
                        </li>
                        <li
                          className={activeTab === "friends" ? "active" : ""}
                          onClick={() => setActiveTab("friends")}
                        >
                          Friends
                        </li>
                        <li
                          className={activeTab === "photos" ? "active" : ""}
                          onClick={() => setActiveTab("photos")}
                        >
                          Photos
                        </li>
                      </ul>
                    </nav>
                  </header>

                  {activeTab === "posts" && (
                    <section className="profile-content">
                      {currentUser.uid === user.uid && (
                        <div className="create-post">
                          <textarea
                            placeholder="What's on your mind?"
                            value={post}
                            onChange={(e) => setPost(e.target.value)}
                          />
                          <button className="post-btn" onClick={sendPost}>
                            Post
                          </button>
                        </div>
                      )}

                      <section className="profile-posts">
                        <h3>Recent Posts</h3>
                        <div className="posts-grid">
                          {allPosts.map((post) => (
                            <div key={post.id} className="post-card">
                                
                             <div className="post-header">
                                <div className="user-info">
                                  <img
                                    src={
                                      user.profilePicture ||
                                      "defaultProfilePictureURL"
                                    } // תמונת פרופיל
                                    alt="Profile"
                                    className="user-profile-image"
                                  />
                                  <div className="user-details">
                                    <h3 className="user-name">
                                      {user.firstName
                                        ? user.firstName
                                        : "Unknown User"}{" "}
                                      {user.lastName
                                        ? user.lastName
                                        : "Unknown User"}
                                    </h3>
                                    <p className="post-timestamp">
                                      {post.timeStamp}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="post-content">
                                <p className="status">{post.post}</p>
                              </div>
                              <div className="post-actions">
                                <button className="action-btn">Like</button>
                                <button className="action-btn">Comment</button>
                                <button className="action-btn">Share</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </section>
                  )}

                  {activeTab === "about" && (
                    <section className="profile-content">
                      <h3>About Me</h3>
                      <p>{user.bio}</p>
                    </section>
                  )}

                  {activeTab === "friends" && (
                    <section className="profile-content">
                      <h3>Friends</h3>
                      <p>This section will list the user's friends.</p>
                    </section>
                  )}

                  {activeTab === "photos" && (
                    <section className="profile-content">
                      <h3>Photos</h3>
                      <p>This section will display the user's photos.</p>
                    </section>
                  )}
                </main>

                {/* Modal Component */}
                <ModalEditProfileComponent
                  modalOpen={modalOpen}
                  setModalOpen={setModalOpen}
                  setUser={setUser}
                  user={currentUser}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Profile;
