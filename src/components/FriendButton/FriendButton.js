import React, {useEffect, useState} from "react";
import {useAuth} from "../../context/AuthContext";
import {
  deleteDoc,
  updateDoc,
  arrayRemove,
  query,
  collection,
  where,
  getDocs,
  doc,
  addDoc,
  getDoc, arrayUnion
} from "firebase/firestore";
import {db} from "../../firebase";

const FriendButton = ({user}) => {

    const {currentUser} = useAuth ();
    const [request, setRequest] = useState ([]);
    const [status, setStatus] = useState (null);
    const [isReceiver, setIsReceiver] = useState(false);

  // Accept friend request
    const handleAccept = async () => {
        try {
            const requestQuery = query(
                collection(db, "followerRequests"),
                where("senderId", "==", user.uid), //who send the request
                where("receiverId", "==", currentUser.uid) //who received the request
            );

            const requestSnapshot = await getDocs(requestQuery);

            if (!requestSnapshot.empty) {
                const requestDoc = requestSnapshot.docs[0].ref; 

                await updateDoc(requestDoc, { status: "accepted" });

                await updateDoc(doc(db, "Users", currentUser.uid), {
                    followers: arrayUnion(user.uid),
                });
                await updateDoc(doc(db, "Users", user.uid), {
                    followers: arrayUnion(currentUser.uid),
                });

                await newFollowerNotification(user.uid, currentUser);
            }
        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    };
    const newFollowerNotification = async (newFollowerId, acceptedUser) => {
        const notification = {
            postUser: newFollowerId, //Who send the request
            newFollowerId: acceptedUser.uid, //who accept the request
            newFollowerName: `${acceptedUser.userName}`, //the name of user accept
            type: "new follower",
        };

        try {
            await addDoc(collection(db, "Notifications"), notification);
            console.log("Notification sent successfully");
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    };

    // Reject friend request
    const handleReject = async (request) => {
        try {
            const requestQuery = query(
                collection(db, "followerRequests"),
                where("senderId", "==", user.uid),
                where("receiverId", "==", currentUser.uid)
            );

            const requestSnapshot = await getDocs(requestQuery);

            if (!requestSnapshot.empty) {
                const requestDoc = requestSnapshot.docs[0].ref;
                await updateDoc(requestDoc, { status: "rejected" });
            }
        } catch (error) {
            console.error("Error rejecting follower request:", error);
        }
    };







    const addFriend = async () => {
        try {
            console.log(1)
            await addDoc (collection (db, 'followerRequests'), {
                senderId: currentUser.uid, // The id of the sender
                senderUserName: currentUser.userName, // The username  of the sender
                senderPicture: currentUser.profilePicture, // The profile picture of the sender
                receiverId: user.uid, // The unique identifier of the receiver
                status: 'pending', // Initial status of the request (pending, accepted, declined)
                timestamp: new Date().toISOString() // The timestamp of the request was created
                
            });
            setStatus ('pending');
            console.log ('Follower request sent!');
        } catch (error) {
            console.log ('Error sending follower request:', error);
        }
    };


    const removeFriend = async () => {
        try {

            const q = query (
                collection (db, 'followerRequests'),
                where (
                    'senderId', 'in', [currentUser.uid, user.uid]
                ),
                where (
                    'receiverId', 'in', [currentUser.uid, user.uid]
                )
            );

            const querySnapshot = await getDocs (q);

            if (!querySnapshot.empty) {
                // מוחקים את המסמך של בקשת החברות
                const requestDoc = querySnapshot.docs[0].ref;
                await deleteDoc (requestDoc);

                // מסירים את החבר ממערך friends של המשתמש הנוכחי
                const currentUserDocRef = doc (db, 'Users', currentUser.uid);
                await updateDoc (currentUserDocRef, {
                    friends: arrayRemove (user.uid)
                });

                // מסירים את המשתמש הנוכחי ממערך friends של החבר
                const followerUserDocRef = doc (db, 'Users', user.uid);
                await updateDoc (followerUserDocRef, {
                    followers: arrayRemove (currentUser.uid)
                });

                setStatus (null); // מחזירים את הסטטוס ל-null
                console.log ("follower removed successfully!");
            }
        } catch (error) {
            console.log ("Error removing follower:", error);
        }
    };



    useEffect (() => {

        const friendRequest = async () => {
            try {
                const q = query (
                    collection (db, 'followerRequests'),
                    where ('senderId', '==', currentUser.uid),
                    where ('receiverId', '==', user.uid)
                )
                const querySnapshot = await getDocs (q);
                if (querySnapshot.empty) {
                    const q = query (
                        collection (db, 'followerRequests'),
                        where ('senderId', '==', user.uid),
                        where ('receiverId', '==', currentUser.uid)
                    )
                    const querySnapshot = await getDocs (q);
                    if (!querySnapshot.empty) {
                        const request = querySnapshot.docs[0].data ();
                        setStatus (request.status);

                      if (request.receiverId === currentUser.uid) {
                        setIsReceiver(true);
                      } else {
                        setIsReceiver(false);
                      } return;
                    } else {
                        setStatus (null); // אם אין בקשת חברות, נאפס את הסטטוס
                    }
                }
                if (!querySnapshot.empty) {
                    const request = querySnapshot.docs[0].data ();
                    setStatus (request.status);

                } else {
                    setStatus (null); // אם אין בקשת חברות, נאפס את הסטטוס
                }
            } catch (error) {
                console.error (error);
            }
        };

        if (user && currentUser) {
            friendRequest (); // קריאה לפונקציה רק אם המשתמשים קיימים

        }
    }, [user, currentUser]); // התלותות: אם המשתמשים משתנים

    return (
        <>
          {/* הצגת הכפתור בהתאם לסטטוס */}
          {!status && status !== 'accepted' && status !== 'pending' ? (
              <button onClick={addFriend}>
                הוספת חבר
              </button>
          ) : (
              <>
                {status === 'pending' && isReceiver && (
                    <>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            onClick={handleAccept}
                        >
                          אישור
                        </button>
                        <button
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            onClick={() => handleReject (request)}
                        >
                          דחייה
                        </button>
                      </div>
                    </>
                )}
                {status === 'pending' && !isReceiver && (
                    <button disabled>
                      בקשתכם נשלחה
                    </button>
                )}
                {status === 'accepted' && (
                    <button onClick={removeFriend}>
                      הסרת חבר
                    </button>
                )}
              </>
          )}
        </>
    );
};

export default FriendButton;
