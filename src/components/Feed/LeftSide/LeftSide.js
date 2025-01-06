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
const arrayMissions=shuffleArray(allMissions).slice(0,7)
  return (
    <div className="rounded-lg p-2 mt-5 ml-4">
      <div className="rounded-lg bg-white p-2 flex justify-center flex-col gap-4 space-x-4">
        
            {arrayMissions.filter(
              (mission) => mission.user?.uid !== currentUser?.uid
            ).length > 0 ? (
              <>
                {arrayMissions.map(
                  (mission) =>
                    mission.user?.uid !== currentUser?.uid && (
                      <div className="flex gap-5" key={mission.id}>
                        <Link to={`/mission/${mission.id}`}>
                          <div className="flex flex-col w-72 items-start gap-1 p-3 bg-gray-50 rounded-lg shadow-sm">
                            <div className="flex items-center justify-evenly">
                              <img
                                src={mission.user?.profilePicture || ""}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover ml-1 border border-[#3E54D3]"
                              />
                              <span className="text-sm text-gray-500 font-medium">
                                {mission.user?.userName} -{" "}
                                {mission.user?.userType === "Student" ? (
                                  <span>משימה מסטודנט</span>
                                ) : (
                                  <span>משימה מחברה</span>
                                )}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {mission.title}
                            </h3>
                            <h4 className="text-md text-gray-600">
                              {mission.place}
                            </h4>
                          </div>
                          <hr />
                        </Link>
                      </div>
                    )
                )}
              </>
            ) : (<p>Not Found a Mission.</p>)}
          
            {allMissions.filter(
              (mission) => mission.user.uid !== currentUser.uid
            ).length > 5 && (
              <Link to={`/missions`}>
                <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                  View more
                </button>
              </Link>
            )}
        </div>
      </div>
  );
};

export default LeftSide;
