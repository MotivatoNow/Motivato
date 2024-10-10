import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore"; // הוספת getDocs לשליפת מידע מרובה
import "./Profile.css";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import ModalEditProfileComponent from "../../components/Modal/ModalEditProfile/ModalEditProfile";
import { getPosts, getPostsByID, postStatus } from "../../context/Firestore";
import { getCurrentTimeStamp } from "../../features/useMoment/useMoment";
import PostCard from "../../components/PostCard/PostCard";
import MyPost from "../../components/MyPost/MyPost";
import FriendButton from "../../components/FriendButton/FriendButton";
import ChatButton from '../../components/ChatButton/ChatButton'
import ChatPopup from "../../components/ChatPopup/ChatPopup";

const Profile = ( ) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false); // סטטוס של משתמש שלא נמצא
  const { currentUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [friends, setFriends] = useState([]); // סטייט לחברים
  const [photos, setPhotos] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);

  const fetchUserPosts = async () => {
    const q = query(collection(db, "Posts"), where("user.uid", "==", id));
    const querySnapshot = await getDocs(q);
    const postsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAllPosts(postsData);
    const photos = postsData.filter((post) => post.postImage);
    setPhotos(photos);
  };
  //user
  const loadData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "Users", id));
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() });
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

  // פונקציה לטעינת החברים של המשתמש
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
      setFriends(loadedFriends); // שמירת החברים בסטייט
    } catch (error) {
      console.error("Error loading friends:", error);
    }
  };

  useMemo(() => {
    fetchUserPosts();
  }, [id]);

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
  const createConversation = async (participants) => {
    const conversationRef = await addDoc(collection(db, "Conversations"), {
        participants:participants,
        lastMessage: "",
        lastMessageTimestamp: new Date(),
        isGroup: false, // Ou true, selon tes besoins
    });
    
    
    return conversationRef.id; // Retourne l'ID de la nouvelle conversation
  };
  const getExistingConversation = async (participants) => {
    const q = query(
        collection(db, "Conversations"),
        where("participants", "array-contains-any", participants)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id; // Retourne l'ID de la première conversation trouvée
    }

    return null; // Aucune conversation trouvée
};

const handleChatButtonClick = async () => {
  const participants = [currentUser.uid, user.uid];
  
  const existingConversationId = await getExistingConversation(participants);

  if (existingConversationId) {
      // Si une conversation existe déjà, utilise son ID
      setActiveChatUser(existingConversationId);
  } else {
      // Sinon, crée une nouvelle conversation
      const conversationId = await createConversation(participants);
      setActiveChatUser(conversationId);
  }
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
                      {currentUser.uid !== user.uid &&(<>
                        <ChatButton onClick={() => handleChatButtonClick(user.uid)} />
                      </>)}
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
                      <i className=""></i> {user.userGitHub || ""}
                    </p>
                    <p className="profile-website">
                      <i className=""></i> {user.userWebsite || ""}
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
                    </div>
                    {currentUser.uid === user.uid ? (
                      <button
                        className="settings-btn"
                        onClick={() => setModalOpen(true)}
                      >
                        Settings
                      </button>
                    ) : (
                      <FriendButton user={user} />
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
                          Friends({friends.length})
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
                        <div className="my-post">
                          <MyPost />
                        </div>
                      )}

                      <section className="profile-posts">
                        <h3>Recent Posts</h3>
                        <div className="feed-post">
                          {allPosts.map((post) => (
                            <div key={post.id}>
                              <PostCard posts={post} user={currentUser} />
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
                      <h3>Friends {friends.length}</h3>
                      {friends.length > 0 ? (
                        <div className="friend-list">
                          {friends.map((friend) => (
                            <div key={friend.id} className="friend-item">
                              <img
                                src={
                                  friend.profilePicture ||
                                  "/default-profile.png"
                                }
                                alt={friend.firstName}
                                className="friend-avatar"
                              />
                              <span>
                                {friend.firstName} {friend.lastName}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No friends found.</p>
                      )}
                    </section>
                  )}

                  {activeTab === "photos" && (
                    <section className="profile-content">
                      <h3>Photos</h3>
                      <div className="user-photos">
                        {photos.length > 0 ? (
                          photos.map((post) => (
                            
                              <img
                                key={post.id}
                                src={post.postImage}
                                alt={`Photo from ${user.firstName}`}
                                className="user-photo"
                              />
                            
                          ))
                        ) : (
                          <p>No photos found.</p>
                        )}
                      </div>
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
            {activeChatUser && (
              <>{activeChatUser}
                <ChatPopup conversationId={activeChatUser} closePopup={() => setActiveChatUser(null)} /></>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Profile;
