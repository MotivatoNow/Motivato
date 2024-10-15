import React, {useEffect, useState} from "react";
import {Button, Modal, Input, message} from "antd"; // ייבוא של message מ-Ant Design
import {collection, doc, getDoc, updateDoc, query, where, onSnapshot} from "firebase/firestore";
import {db, storage} from "../../../config/firebase";
import './ModalLikes.css'
import {Link} from "react-router-dom";

const ModalLikes = ({modalOpen, setModalOpen, postsId}) => {
    const [users, setUsers] = useState ([]);
    useEffect (() => {
        const unsubscribe = onSnapshot (doc (db, "Likes", postsId), async (docS) => {
            if (docS.exists ()) {
                const data = docS.data ();
                const usersId = data.likedUsers;
                const fetchedUsers = [];
                for (const userId of usersId) {
                    const userDoc = await getDoc (doc (db, 'Users', userId));
                    if (userDoc.exists ()) {
                        fetchedUsers.push (userDoc.data ());
                    }
                }
                setUsers (fetchedUsers);
            }
        });

        // Cleanup the listener when the component is unmounted
        return () => unsubscribe ();
    }, [postsId]);


    return (
        <>
            <Modal
                title="לייקים"
                centered
                open={modalOpen}
                onCancel={() => setModalOpen (false)}
                footer={[]}
            >
                <div>
                    {users.map (user => (
                        <div key={user.id}>
                            <Link to={`/profile/${user.uid}`}>
                                <p>
                                    <img className="likeduser_picture" src={user.profilePicture}
                                         alt={`${user.firstName} ${user.lastName}`}/>
                                    <span>{user.firstName} {user.lastName}</span>
                                </p>
                            </Link>
                        </div>
                    ))}
                </div>
            </Modal>
        </>
    )
}

export default ModalLikes;