import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Loading } from "../components/Loading/Loading";
import { Navigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeSnapshot; // משתנה כדי לוודא שההאזנה לא מתנתקת לפני הזמן

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userRef = doc(db, 'Users', user.uid);

                unsubscribeSnapshot = onSnapshot(userRef, (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        setCurrentUser({ uid: user.uid, ...docSnapshot.data() });
                    } else {
                        setCurrentUser(null);
                    }

                    // מסיימים את מצב הטעינה אחרי קבלת המידע
                    setLoading(false);
                });
            } else {
                setCurrentUser(null);
                setLoading(false); // מסיימים את מצב הטעינה גם כשאין משתמש מחובר
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    const value = {
        currentUser,
        logout,
        loading,
    };

    if (loading) return <Loading />;

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const AuthWrapper = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return currentUser ? <Navigate to="/feed" /> : children;
};
