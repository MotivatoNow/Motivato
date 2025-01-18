import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link } from "react-router-dom";
import { loadMissions } from "../../../hooks/useLoadMissions";
import {shuffleArray} from '../../../hooks/useLoadUsers'
const LeftSide = () => {
  const { currentUser } = useAuth();
  const [allMissions, setAllMissions] = useState([]);

  useEffect(() => {
    loadMissions(setAllMissions);
  }, []);
const arrayMissions=shuffleArray(allMissions).slice(0,5)
  return (
<div className="rounded-lg p-2 mt-5 bg-base-100 shadow-lg">
  <div className="flex flex-col gap-6">
    {/* בדיקה אם יש משימות להצגה */}
    {arrayMissions.filter(
      (mission) => mission.user?.uid !== currentUser?.uid
    ).length > 0 ? (
      <>
        {arrayMissions.map(
          (mission) =>
            mission.user?.uid !== currentUser?.uid && (
              <div
                key={mission.id}
                className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="card-body">
                  <div className="flex items-center gap-4">
                    {/* תמונה של המשתמש */}
                    <div className="avatar">
                      <div className="w-12 h-12 mask mask-squircle border border-primary">
                        <img
                          src={mission.user?.profilePicture || ""}
                          alt="Profile"
                        />
                      </div>
                    </div>
                    {/* פרטי המשתמש */}
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">
                        {mission.user?.userName}
                      </h4>
                      <span className="text-sm text-gray-600">
                        {mission.user?.userType === "Student"
                          ? "משימה מסטודנט"
                          : "משימה מחברה"}
                      </span>
                    </div>
                  </div>
                  {/* פרטי המשימה */}
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {mission.title}
                    </h3>
                    <p className="text-md text-gray-600">{mission.place}</p>
                  </div>
                  {/* לינק לפרטים נוספים */}
                  <div className="mt-4">
                    <Link
                      to={`/mission/${mission.id}`}
                      className="btn btn-sm  bg-[#3E54D3] text-white hover:bg-[#3E54D3]"
                    >
                      פרטים נוספים
                    </Link>
                  </div>
                </div>
              </div>
            )
        )}
      </>
    ) : (
      <p className="text-center text-gray-500 text-lg">אין משימות כרגע.</p>
    )}

    {/* כפתור לצפייה במעוד משימות */}
    {allMissions.filter((mission) => mission.user.uid !== currentUser.uid)
      .length > 5 && (
      <div className="flex justify-center">
        <Link to={`/missions`}>
          <button className="btn btn-primary btn-wide">הצג עוד</button>
        </Link>
      </div>
    )}
  </div>
</div>

  );
};

export default LeftSide;
