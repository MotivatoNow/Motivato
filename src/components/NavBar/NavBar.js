import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db, auth } from '../../config/firebase';
import { doc, getDoc, query, collection, where, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { signOut } from "firebase/auth";
import { FaBell, FaRegBell } from "react-icons/fa";
import './NavBar.css';
import {notification} from "antd";  // Import custom css

const NavBar = () => {
    const navigate = useNavigate();
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(true);
    const [friendRequests, setFriendRequests] = useState([]);
    const [notfications, setNotifcations] = useState([]);
    const { currentUser } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);  // Managing the dropdown state
    const [dropdownOpen2, setDropdownOpen2] = useState(false);  // Managing the dropdown state


    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleLogout = async () => {
        signOut(auth).then(() => {
            navigate("/login");
            console.log("Signed out successfully");
        }).catch((error) => {
            console.log("Error Sign Out");
        });
    };

    useEffect(() => {
        const checkVerification = async () => {
            if (currentUser) {
                const userDoc = await getDoc(doc(db, 'Users', currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setIsVerified(userData.isVerified);
                }
            }
            setLoading(false);
        };

        checkVerification();
    }, [currentUser]);

    // Listening for friend requests
    useEffect(() => {
        if (currentUser) {
            const q = query(
                collection(db, 'friendRequests'),
                where('receiverId', '==', currentUser.uid),
                where('status', '==', 'pending')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setFriendRequests(requests);
            });

            return () => unsubscribe();
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            const q=query(collection(db,"Notifications"), where("postUser","==",currentUser.uid))

            const unsubscribe = onSnapshot(q, (docSnapshot) => {
                const notification=docSnapshot.docs.map(doc=>({id:doc.id,...doc.data()}))
                setNotifcations(notification)
                console.log(notfications)
                });

            return () => unsubscribe(); // מסירים את ה-listener כשנסגרת הקומפוננטה
        }
    }, [currentUser]);


    // Accept friend request
    const handleAccept = async (request) => {
        try {
            const requestDocRef = doc(db, 'friendRequests', request.id);

            // Update the status in Firebase to "accepted"
            await updateDoc(requestDocRef, { status: 'accepted' });

            // Update the friends list for both users
            await updateDoc(doc(db, 'Users', currentUser.uid), {
                friends: arrayUnion(request.senderId)
            });
            await updateDoc(doc(db, 'Users', request.senderId), {
                friends: arrayUnion(currentUser.uid)
            });

            // Send a notification to the user who sent the friend request
            const senderUserDocRef = doc(db, 'Users', request.senderId);
            await updateDoc(senderUserDocRef, {
                notifications: arrayUnion({
                    message: `${currentUser.firstName} אישר את בקשת החברות שלך.`,
                    timestamp: new Date().toISOString()
                })
            });

        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    };

    // Reject friend request
    const handleReject = async (request) => {
        try {
            const requestDocRef = doc(db, 'friendRequests', request.id);
            await updateDoc(requestDocRef, { status: 'rejected' });
        } catch (error) {
            console.error("Error rejecting friend request:", error);
        }
    };

    // Toggle dropdown
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };
    // Toggle dropdown
    const toggleDropdown2 = () => {
        setDropdownOpen2(!dropdownOpen2);
    };

    if (loading) {
        return <div>Loading...</div>;
    }


    /*const clearNotifications = async () => {
        try {
            const userDocRef = doc(db, 'Users', currentUser.uid);
            await updateDoc(userDocRef, {
                notifications: [] // ריקון ההתראות במסד הנתונים
            });
            setNotifcations([]); // ריקון ההתראות ב-state המקומי
            console.log("Notifications cleared!");
        } catch (error) {
            console.error("Error clearing notifications:", error);
        }
    };*/

    const handleNotificationClick = () => {
        toggleDropdown2(); // פותח/סוגר את ה-dropdown
        /*if (notfications.length > 0 ) {
            clearNotifications(); // מנקה את ההתראות אם יש התראות לא נקראות
        }*/
    };


    return (
        <>
            <nav className="navbar navbar-fixed-top d-flex justify-content-evenly align-items-center navbar-expand-lg">
                <div className="container-fluid">
                    <img className="navbar_logo" src="/path/to/logo.png" alt="Logo" />
                    <button className="navbar-toggler shadow-none border-0;" type="button" data-bs-toggle="offcanvas"
                            data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar"
                            aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>



                    {/* Sidebar and logout */}
                    <div className="sidebar offcanvas offcanvas-start" tabIndex="-1" id="offcanvasNavbar"
                         aria-labelledby="offcanvasNavbarLabel">
                        {/* Sidebar header */}
                        <div className="offcanvas-header border-bottom">
                            <h5 className="offcanvas-title" id="offcanvasNavbarLabel">Motivato</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="offcanvas"
                                    aria-label="Close"></button>
                        </div>








                        {/* Sidebar body */}
                        <div className="offcanvas-body">
                            {currentUser && isVerified ? (
                                <>

                                    <ul className="navbar-nav justify-content-start flex-grow-1 pe-3">
                                        <li className="nav-item">
                                            <a className="nav-link active" aria-current="page" href=""
                                               onClick={() => handleNavigation ('/feed')}>דף הבית</a>
                                        </li>
                                    </ul>
                                    <div>
                                        <span>שלום {`${currentUser.firstName}`}</span>
                                        <button onClick={handleLogout}>התנתקות</button>
                                        <Link to={`/profile/${currentUser.uid}`}>לפרופיל</Link>
                                    </div>


                                    <div className="nav-item dropdown">
                                        <FaRegBell  className="friend-requests-icon" onClick={handleNotificationClick}/>
                                        {notfications.length > 0 && (
                                            <span className="notification-count">{notfications.length}</span>
                                        )}
                                        {dropdownOpen2 && (
                                            <div className="dropdown-menu show">
                                                {notfications.length > 0 ? (
                                                    notfications.map((notification, index) => (
                                                        <div key={index} className="dropdown-item">
                                                            {notification.type==="comment"&&(<>
                                                                <p>{`${notification.commentName} add comment in your post`}</p></>
                                                            )}
                                                            {notification.type==="like"&&(<>
                                                            <p>{`${notification.likeName} liked your post`}</p>
                                                            </>)}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="dropdown-item">אין התראות חדשות</div>
                                                )}
                                                
                                            </div>
                                        )}
                                    </div>


                                    <div className="nav-item dropdown">
                                        <FaBell className="friend-requests-icon" onClick={toggleDropdown}/>
                                        {friendRequests.length > 0 && (
                                            <span className="notification-count">{friendRequests.length}</span>
                                        )}
                                        {dropdownOpen && (
                                            <div
                                                className="dropdown-menu show"> {/* Using "show" to make sure dropdown is visible */}
                                                {friendRequests.length > 0 ? (
                                                    friendRequests.map (request => (
                                                        <div key={request.id} className="dropdown-item">
                                                            <p>
                                                                <span><img className="notiimage"
                                                                           src={request.senderPicture}/></span>
                                                                {request.senderFirstName} {request.senderLastName} שלח
                                                                לך
                                                                בקשת חברות</p>
                                                            <button className="btn btn-success me-2"
                                                                    onClick={() => handleAccept (request)}>אישור
                                                            </button>
                                                            <button className="btn btn-danger"
                                                                    onClick={() => handleReject (request)}>דחייה
                                                            </button>
                                                            .split('T')[0]
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="dropdown-item">אין בקשות חדשות</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="d-flex justify-content-center align-items-center gap-3">
                                    <button type="button" className="btn navbar__signin-button"
                                            onClick={() => handleNavigation ('/login')}>להתחבר
                                    </button>
                                    <button type="button" className="btn navbar__signup-button"
                                            onClick={() => handleNavigation ('/register')}>אני
                                        רוצה להירשם
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default NavBar;
