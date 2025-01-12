import React, { useState, useEffect } from "react";
import MyMission from "../../components/MyMission/MyMission";
import MissionCard from "../../components/MissionCard/MissionCard";
import { useAuth } from "../../context/AuthContext";
import { loadMissions } from "../../hooks/useLoadMissions";

const MissionFeed = () => {
  const { currentUser } = useAuth();
  const [allMissions, setAllMissions] = useState([]);

  useEffect(() => {
    loadMissions(setAllMissions);
  }, []);

  return (
    <div className="feed-page space-y-5">
      <div className="my-post">
        <MyMission />
      </div>
      <div className="feed-post space-y-6">
        {allMissions && allMissions.length > 0 ? (
          allMissions.map((mission) => (
            <div key={mission.id}>
              <MissionCard missions={mission} user={currentUser} />
            </div>
          ))
        ) : (
          <p>Not Found a Mission.</p>
        )}
      </div>
    </div>
  );
};

export default MissionFeed;
