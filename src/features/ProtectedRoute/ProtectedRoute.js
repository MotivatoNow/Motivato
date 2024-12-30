import React from 'react';
import {Navigate, useParams} from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to="/" />;
    } 
    
    return children;
};

export default ProtectedRoute;
