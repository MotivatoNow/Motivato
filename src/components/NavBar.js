import React from "react";
import "../App.css";
import logo from '../logo192.png'
import { useNavigate } from "react-router-dom";

const NavBar = () => {

  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };



  return (

    <>
      <nav className="navbar  ">
        <div className="NavContainer">
          <img src={logo} alt="logo of the website" className="navbar_logo" />
          <ul className="navbar_nav">
            <li onClick={() => handleNavigation('/')}><a className="">דף הבית</a></li>
            <li><a className="" href="#">דף הבית</a></li>
            <li><a className="" href="#">דף הבית</a></li>
            <li><a className="" href="#">דף הבית</a></li>
          </ul>
          <form className="d-flex" role="search">
        <input className="form-control me-2" type="search" placeholder="חיפוש.." aria-label="Search"/>
        <button className="btn btn-outline-success" type="submit">חיפוש</button>
      </form>

          <div className="navbar_buttons">
            <button type="button" className="btn navbar__signin-button" onClick={() => handleNavigation('/Login')}>להתחבר</button>
            <button type="button" className="btn navbar__signup-button" onClick={() => handleNavigation('/register')}>אני רוצה להירשם</button>
          </div>
        </div>
      </nav>

    </>
  );
};

export default NavBar;