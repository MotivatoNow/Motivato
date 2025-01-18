import React, { useState } from "react";
import logo from "../../assets/images/Icon.png";
import { CiUnlock } from "react-icons/ci";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

const NavBarLogout = () => {
  const [toggle, setToggle] = useState(false);
  const handleClick = () => setToggle(!toggle);

  return (
    <header className="w-full h-[80px] bg-white border-b fixed">
      <nav className="md:max-w-[1480px] max-w-[600px] m-auto w-full h-full flex justify-between items-center md:px-0 px-4">
        <Link to={"/"}>
          <img src={logo} className="h-[36px]" />
        </Link>

        <div className="hidden md:flex items-center ">
          <ul className="flex gap-4">
            <Link to={'/'}><li>דף הבית</li></Link>
          </ul>
        </div>

        <div className="hidden md:flex">
          <button className="flex justify-between items-center  bg-transparent  px-6 gap-2">
            <CiUnlock />
            <Link to={"/login"}>התחברות</Link>
          </button>
          <Link to={"/register"}>
            <button className="px-8 py-3 rounded-md bg-[#15CDCA] text-white font-bold">
              הרשמה בחינם
            </button>
          </Link>
        </div>

        <div className="md:hidden" onClick={() => setToggle(!toggle)}>
          {toggle ? <FaTimes size={24} /> : <FaBars size={24} />}
        </div>
      </nav>

      <div
        className={
          toggle
            ? "absolute z-10 p-4  bg-white w-full px-8 md:hidden border-b"
            : "hidden"
        }
      >
        <ul>
        <Link to={'/'}><li>דף הבית</li></Link>
          <div className="flex flex-col my-4 gap-4">
            <button className="border border-[20B486] flex justify-center items-center  bg-transparent  px-6 gap-2 py-4">
              <Link className="flex items-center" to={"/login"}>
                <CiUnlock />
                התחברות
              </Link>
            </button>
            <Link to={"/register"}>
              <button className="px-8 py-5 w-[95%] rounded-md bg-[#15CDCA] text-white font-bold">
                הרשמה בחינם
              </button>
            </Link>
          </div>
        </ul>
      </div>
    </header>
  );
};

export default NavBarLogout;
