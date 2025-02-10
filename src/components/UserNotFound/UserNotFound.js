import React from "react";
import { useNavigate } from "react-router-dom";
import notFound from '../../assets/images/2953962.jpg'

const UserNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen p-6 gap-8 items-center">
      {/* Left section: Image */}
      <div className="flex justify-center">
        <img
          src={notFound}
          alt="Not Found "
          className="w-full max-w-sm object-contain"
        />
      </div>

      {/* Right section: Content */}
      <div className="text-right">
        <h1 className="text-4xl font-bold text-[#3E54D3] mb-4">משתמש לא נמצא</h1>
        <p className="text-lg text-base-content mb-8">
          מצטערים, לא הצלחנו למצוא את המשתמש שחיפשת. ייתכן שהוא אינו קיים או שהקישור שגוי.
        </p>
        <button
          onClick={() => navigate("/feed")}
          className="bg-[#3E54D3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-focus transition"
        >
          חזרה לפיד
        </button>
      </div>
    </div>
  );
};

export default UserNotFound;
