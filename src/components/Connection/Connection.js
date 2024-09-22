import React, {useEffect, useState} from 'react';
import {doc, getDoc} from "firebase/firestore";
import {db} from "../../config/firebase";

const Connection = () => {
    const [users, setUsers] = useState([]);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userDoc = await getDoc (doc (db, "Users"));
                if (userDoc.exists ()) {
                    setUsers (userDoc.data ());
                } else {
                    console.log ("No such user!");
                }
            } catch (error) {
                console.error ("Error fetching user data:", error);
            }
        }
    })
    return (<>
        <div> {users}</div>
    </>);

}
export default Connection;
