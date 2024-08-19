import React, {useEffect, useState} from "react";
import "../../assets/styles/App.css";
import './NavBar.css'
import {useNavigate, useParams} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
import {Link} from 'react-router-dom';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';


const NavBar = () => {
    const navigate = useNavigate ();
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(true);
    const {currentUser, logout} = useAuth ();
    const handleNavigation = (path) => {
        navigate (path);
    };


    const handleLogout = async () => {
        try {
            await logout ();
            navigate (`/`);
        } catch (error) {
            console.error ('Failed to logout', error);
        }
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
    if (loading) {
        return <div>Loading...</div>;
    }



    return (

        <>
            <nav className="navbar d-flex justify-content-evenly align-items-center navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <a className="navbar-brand fs-4" href="#">Offcanvas navbar</a>
                    {/*Toggler*/}
                    <button className="navbar-toggler shadow-none border-0;" type="button" data-bs-toggle="offcanvas"
                            data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar"
                            aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/*SideBar*/}
                    <div className="sidebar offcanvas offcanvas-start" tabIndex="-1" id="offcanvasNavbar"
                         aria-labelledby="offcanvasNavbarLabel">
                        {/*SideBar header*/}
                        <div className="offcanvas-header border-bottom">
                            <h5 className="offcanvas-title" id="offcanvasNavbarLabel">Motivato</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="offcanvas"
                                    aria-label="Close"></button>
                        </div>
                        {/*SideBar Body*/}
                        <div className="offcanvas-body">
                            {
                                currentUser && isVerified ?
                                    (
                                        <ul className="navbar-nav justify-content-start flex-grow-1 pe-3">
                                            <li className="nav-item">
                                                <a className="nav-link active" aria-current="page" href=""
                                                   onClick={() => handleNavigation ('/feed')}>דף הבית</a>
                                            </li>
                                        </ul>

                                    ): (
                                        <ul className="navbar-nav justify-content-start flex-grow-1 pe-3">
                                            <li className="nav-item">
                                                <a className="nav-link active" aria-current="page" href=""
                                                   onClick={() => handleNavigation ('/')}>דף הבית</a>
                                            </li>
                                            <li className="nav-item mx-2">
                                                <a className="nav-link" href="#">אודותינו</a>
                                            </li>
                                            <li className="nav-item mx-2">
                                                <a className="nav-link" href="#">דף נוסף</a>
                                            </li>
                                            <li className="nav-item mx-2">
                                                <a className="nav-link" href="#">דף נוסף</a>
                                            </li>
                                            <li className="nav-item mx-2">
                                                <a className="nav-link" href="#">דף נוסף</a>
                                            </li>


                                        </ul>
                                    )
                            }

                            {/* <form className="d-flex mt-3" role="search">
                              <input className="form-control me-2" type="search" placeholder="Search"
                                     aria-label="Search"/>
                              <button className="btn btn-outline-success" type="submit">Search</button>
                          </form>*/}
                            {
                                currentUser && isVerified ?
                                    (
                                        <div>
                                            <span>שלום {`${currentUser.firstName}`}</span>
                                            <button onClick={handleLogout}>התנתקות</button>
                                            <Link to={`/profile/${currentUser.uid}`}>לפרופיל</Link>
                                        </div>

                                    ) : (


                                        <div className="d-flex justify-content-center align-items-center gap-3">
                                        <button type="button" className="btn navbar__signin-button"
                                                    onClick={() => handleNavigation ('/login')}>להתחבר
                                            </button>
                                            <button type="button" className="btn navbar__signup-button"
                                                    onClick={() => handleNavigation ('/register')}>אני
                                                רוצה להירשם
                                            </button>
                                        </div>)

                            }

                        </div>
                    </div>
                </div>
            </nav>


        </>
    )
        ;
};

export default NavBar;
