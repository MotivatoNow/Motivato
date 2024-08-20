import React, {useState, useEffect, useMemo} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Profile.css";
import { useAuth } from "../../context/AuthContext";
import ModalEditProfileComponent from "../../components/Modal/ModalEditProfile/ModalEditProfile";
import {getPosts} from "../../context/Firestore";

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
  const [allPosts, setAllPosts]=useState([])
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
      loadUserPosts();
    }
  }, [id, currentUser, navigate]);

  //post user
  const loadUserPosts = async () => {
    try {
      const allPosts = await getPosts(setAllPosts);
      const userPosts = allPosts.filter((post) => post.user.uid === user.uid);
      console.log(userPosts);
      setAllPosts(userPosts);
    } catch (error) {
      console.error("Error fetching posts: ", error);
    }
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  // Display "User Not Found" if the user doesn't exist in the database
  if (userNotFound) {
    return <div className="not-found">User Not Found</div>;
  }


  return (
      <div className="profile_container">
        {user && (
            <>
              <div className="profile-page">
                <div className="profile-layout">
                  {/* Sidebar */}
                  <aside className="profile-sidebar">
                    <div className="sidebar-content">
                        <div className="profile-picture">
                          <img src={user.profilePicture} alt="Profile"/>
                        </div>
                      </div>
                      <div className="profile-info">
                        <h2 className="profile-name">
                          {user.firstName} {user.lastName}
                        </h2>
                        <p className="profile-location">
                          <i className="fa fa-map-marker-alt"></i> {user.location || "Location"}
                        </p>
                      </div>
                      <div className="profile-details">
                        <div className="profile-section education-section">
                          <h4>Education</h4>
                          <p>{user.studentEducation || "No information"}, {user.studentCollege || "No college/university"}</p>
                        </div>
                        <div className="profile-section contact-section">
                          <h4>Contact</h4>
                          <p>
                            <i className="fa fa-envelope"></i> {user.email}
                          </p>
                        </div>
                        <button className="settings-btn" onClick={() => setModalOpen (true)}>
                          Settings
                        </button>
                    </div>
                  </aside>

                  {/* Main Profile Section */}
                  <main className="profile-main">
                    <header className="profile-header">
                      <div className="header-title">
                        <h2>Welcome, {user.firstName}</h2>
                      </div>
                      <nav className="profile-nav">
                        <ul>
                          <li className="active">Posts</li>
                          <li>About</li>
                          <li>Friends</li>
                          <li>Photos</li>
                        </ul>
                      </nav>
                    </header>

                    <section className="profile-content">
                      <div className="create-post">
                        <textarea placeholder="What's on your mind?"/>
                        <button className="post-btn">Post</button>
                      </div>
                      <section className="profile-posts">
                        <h3>Recent Posts</h3>
                        <div className="posts-grid">
                          {allPosts.map ((post) => (
                              <div key={post.id} className="post-card">
                                <h4>{post.post}</h4>
                                <p>{post.content}</p>
                              </div>
                          ))}
                        </div>
                      </section>
                    </section>
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


  );
};

export default Profile;
