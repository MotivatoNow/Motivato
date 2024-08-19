// src/context/AuthContext.js
import React, {createContext, useContext, useEffect, useState} from 'react';
import {onAuthStateChanged, signOut} from 'firebase/auth';
import {auth, db} from '../config/firebase';
import {doc, getDoc} from 'firebase/firestore';

const AuthContext = createContext ();

export const useAuth = () => useContext (AuthContext);

export const AuthProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState (null);
    const [loading, setLoading] = useState (true);

    useEffect (() => {
        const unsubscribe = onAuthStateChanged (auth, async (user) => {
            if (user) {
                const userDoc = await getDoc (doc (db, 'Users', user.uid));
                setCurrentUser ({uid: user.uid, ...userDoc.data ()});
            } else {
                setCurrentUser (null);
            }
            setLoading (false);
        });

        return () => unsubscribe ();
    }, []);

    const logout = async () => {
        await signOut (auth);
    };

    const value = {
        currentUser,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
