import React,{useEffect, useMemo, useState} from 'react'
import ChatButton from "../../ChatButton/ChatButton"
import FriendButton from '../../FriendButton/FriendButton';
import MyPost from '../../MyPost/MyPost';
import PostCard from '../../PostCard/PostCard';
import ModalEditProfileComponent from '../../Modal/ModalEditProfile/ModalEditProfile';
import ChatPopup from '../../ChatPopup/ChatPopup';
import { addDoc, collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';

const CompanyProfile = ({user, currentUser}) => {
    const [userData,setUserData]=useState(null)
    const [modalOpen, setModalOpen] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [followers, setFollowers] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);


    // Chat

  const createConversation = async (participants) => {
    const conversationRef = await addDoc(collection(db, "Conversations"), {
      participants: participants,
      lastMessage: "",
      lastMessageTimestamp: new Date(),
      isGroup: false,
    });

    return conversationRef.id;
  };

  const getExistingConversation = async (participants) => {
    let user1=participants[0];
    
    if(user1!==currentUser.uid){
      user1=participants[1] 
    }
  const q = query(
     collection(db, "Conversations"),
    where("participants", "array-contains", user1)
  );

    const querySnapshot = await getDocs(q);
    console.log(querySnapshot);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }

    return null;
  };

  const handleChatButtonClick = async () => {
    const participants = [currentUser.uid, user.uid];
    
    const existingConversationId = await getExistingConversation(participants);
    
    if (existingConversationId) {
      setActiveChatUser(existingConversationId);
    } else {
      const conversationId = await createConversation(participants);
      setActiveChatUser(conversationId);
    }
  };

  
  // Posts

  const fetchUserPosts = async () => {
    const q = query(collection(db, "Posts"), where("user.uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const postsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAllPosts(postsData);
    const photos = postsData.filter((post) => post.postImage);
    setPhotos(photos);
  };

  useMemo(() => {
    fetchUserPosts();
  }, [user.uid]);

// useEffect
  useEffect(()=> {
    fetchUserPosts();   
  },user.uid)

  return (
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
                      {currentUser.uid !== user.uid && (
                        <>
                          <ChatButton
                            onClick={() => handleChatButtonClick(user.uid)}
                          />
                        </>
                      )}
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
                           שלום,
                        {
                          currentUser.userType === 'Student' ? (
                            <>
                              {currentUser.firstName} {currentUser.lastName} 
                             </>
                             ):(<> {currentUser.companyName} </>)
                        }
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
                          Followers({followers.length})
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

                  {activeTab === "followers" && (
                    <section className="profile-content">
                      <h3>Followers {followers.length}</h3>
                      {followers.length > 0 ? (
                        <div className="friend-list">
                          {followers.map((follower) => (
                            <div key={follower.id} className="follower-item">
                              <img
                                src={
                                    follower.profilePicture ||
                                  "/default-profile.png"
                                }
                                alt={follower.firstName}
                                className="follower-avatar"
                              />
                              <span>
                                {follower.userName}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No followers found.</p>
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
                              alt={`${userData.firstName} profile `}
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
                  setUser={setUserData}
                  user={currentUser}
                />
              </div>
            </div>
            {activeChatUser && (
              <>
                <ChatPopup
                  conversationId={activeChatUser}
                  closePopup={() => setActiveChatUser(null)}
                />
              </>
            )}
          </>
  )
}

export default CompanyProfile;  