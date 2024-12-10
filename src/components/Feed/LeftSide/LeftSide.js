import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getMissions } from "../../../context/Firestore";
import { Link } from "react-router-dom";

const LeftSide = () => {
  const { currentUser } = useAuth();
  const [allMissions, setAllMissions] = useState([]);

  useEffect(() => {
    getMissions(setAllMissions);
  }, []);

  return (
    <div className="rounded-lg p-2 mt-5 ml-4">
      <div className="rounded-lg bg-white p-2 items-center flex justify-center flex-col gap-1 space-x-4">
      {allMissions && allMissions.length > 0 ? (
          <>{allMissions.map((mission) => (
            <div key={mission.id}>
            <Link to={`/mission/${mission.id}`}>
              <p>{mission.user.userName}</p>
              <h3>{mission.title}</h3>
              <h4>{mission.place}</h4>
              <hr/>
              </Link>
            </div>
          )
          )}
          <Link to={`/missions`}>
          <button>
            View more
          </button>
          </Link>
          </>
          
        ) : (
          <p>Not Found a Mission.</p>
        )}
      </div>
    </div>
  );
};

export default LeftSide;
