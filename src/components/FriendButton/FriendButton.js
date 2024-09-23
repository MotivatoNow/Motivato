import React, {useEffect, useState} from "react";
import { useAuth } from "../../context/AuthContext";
import  { deleteDoc, updateDoc, arrayRemove, query, collection, where, getDocs, doc,addDoc } from "firebase/firestore";
import { db } from "../../firebase";
const FriendButton = ({ user }) => {

  const { currentUser } = useAuth();
  const [request,setRequest] = useState([]);
  const [status, setStatus] = useState (null);

  const addFriend = async () => {
    try {
      await addDoc(collection(db, 'friendRequests'), {
        senderId: currentUser.uid, // מזהה המשתמש השולח
        senderFirstName: currentUser.firstName, // שם פרטי של השולח
        senderLastName: currentUser.lastName, // שם משפחה של השולח
        senderPicture: currentUser.profilePicture,
        receiverId: user.uid, // מזהה המשתמש המקבל
        status: 'pending', // סטטוס ראשוני של הבקשה
        timestamp: new Date().toISOString() // תאריך הבקשה
      });
      setStatus('pending');
      console.log('Friend request sent!');
    } catch (error) {
      console.log('Error sending friend request:', error);
    }
  };



  const removeFriend = async () => {
    try {
      // מחפשים את בקשת החברות באוסף friendRequests
      const q = query(
          collection(db, 'friendRequests'),
          where('senderId', '==', currentUser.uid),
          where('receiverId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // מוחקים את המסמך של בקשת החברות
        const requestDoc = querySnapshot.docs[0].ref;
        await deleteDoc(requestDoc);

        // מסירים את החבר ממערך friends של המשתמש הנוכחי
        const currentUserDocRef = doc(db, 'Users', currentUser.uid);
        await updateDoc(currentUserDocRef, {
          friends: arrayRemove(user.uid)
        });

        // מסירים את המשתמש הנוכחי ממערך friends של החבר
        const friendUserDocRef = doc(db, 'Users', user.uid);
        await updateDoc(friendUserDocRef, {
          friends: arrayRemove(currentUser.uid)
        });

        setStatus(null); // מחזירים את הסטטוס ל-null
        console.log("Friend removed successfully!");
      }
    } catch (error) {
      console.log("Error removing friend:", error);
    }
  };



  // const loadRequests = async () => {
  //   try{
  //     const requestDoc=await getDoc(doc(db,"friendRequests"))
  //     if(requestDoc.exists()) {
  //       const requestData = requestDoc.data()
  //       if(requestData.status === "pending" && requestData.receiverId === user.uid){
  //           setRequest(requestData)
  //       }
  //     }
  //   }
  //   catch (error){
  //     console.log(error);
  //   }
  //
  //
  // }

  useEffect(() => {
    const friendRequest = async () => {
      try {
        const q = query(
            collection(db, 'friendRequests'),
            where('senderId', '==', currentUser.uid),
            where('receiverId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const request = querySnapshot.docs[0].data();
          setStatus(request.status);
          console.log(request.status)// עדכון הסטטוס בסטייט
        } else {
          setStatus(null); // אם אין בקשת חברות, נאפס את הסטטוס
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (user && currentUser) {
      friendRequest(); // קריאה לפונקציה רק אם המשתמשים קיימים
    }
  }, [user, currentUser]); // התלותות: אם המשתמשים משתנים


  return (
      <>
        {/* הצגת הכפתור בהתאם לסטטוס */}
        {!status && (
            <button onClick={addFriend}>
              הוספת חבר
            </button>
        )}
        {status === 'pending' &&(
            <button disabled>
              בקשתכם נשלחה
            </button>
        )}
        {status === 'accepted' && (<>

            <button onClick={removeFriend}>
              הסרת חבר
            </button>
            </>
        )}


      </>
  );
};

export default FriendButton;
