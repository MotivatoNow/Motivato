import './assets/styles/App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';

import HomePage from './pages/Home/Home';
import LoginPage from './pages/Login/Login'; // רכיב התחברות
import RegisterPage from './pages/Register/Register';
import AddCategory from "./features/AddCategory/AddCategory";
import Profile from './pages/Profile/Profile';
import {AuthProvider, useAuth} from './context/AuthContext';
import React from 'react';
import Dashboard from "./pages/Dashboard/Dashboard";
import ForgetPassword from './pages/ForgetPassword/ForgetPassword';
import Feed from './pages/Feed/Feed';
import ProtectedRoute from "./features/ProtectedRoute/ProtectedRoute";
import Home from "./pages/Home/Home";
import Post from "./pages/Post/Post";


function App() {

    return (
        <>
            <AuthProvider>
                <Router>
                    <NavBar/>

                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/register" element={<RegisterPage/>}/>
                        <Route path="/addcategory" element={<AddCategory/>}/>
                        <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
                        <Route path="/profile/:id" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
                        <Route path="/admin-dashboard" element={<Dashboard/>}/>
                        <Route path="/reset" element={<ForgetPassword/>}/>
                        <Route path="/feed" element={<ProtectedRoute><Feed/></ProtectedRoute>}/>
                        <Route path="/post/:id" element={<Post/>}/>
                    </Routes>
                </Router>
            </AuthProvider>

        </>
    );
}

export default App;
