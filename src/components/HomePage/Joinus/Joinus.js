import React from "react";
import cta from "../../../assets/images/joinus.png"
import { Link } from "react-router-dom";

const Joinus = () => {
  return (
    <div className="w-full bg-[#15CDCA13] py-24">
      <div className="md:max-w-[1480px] m-auto grid md:grid-cols-2 gap-8 max-w-[600px] items-center  px-4 md:px-0">
        <img src={cta} className="md:h-full mx-auto h-60" />

        <div>
          <h1 className="py-2 text-3xl font-semibold">
            הצטרפו ל<span className="text-[#15CDCA]">רשת החברתית</span> שתיקח את
            הקריירה שלכם לשלב הבא
          </h1>
          <p className="py-2 text-lg text-gray-600">
            חברו בין סטודנטים לחברות - פלטפורמה ייחודית להזדמנויות חדשות
          </p>
          <Link to={"/register"}>
            <button className="max-[780px]:w-full my-4 px-8 py-5 rounded-md bg-[#15CDCA] text-white font-bold">
              הירשמו עכשיו בחינם
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Joinus;
