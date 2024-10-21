import React, { useState, useEffect } from "react";
import MyMission from "../../components/MyMission/MyMission";
import { getMissions } from "../../context/Firestore";
import MissionCard from "../../components/MissionCard/MissionCard";
import { useAuth } from "../../context/AuthContext";

const Mission = () => {
  const { currentUser } = useAuth();
  const [allMissions, setAllMissions] = useState([]);

  useEffect(() => {
    getMissions(setAllMissions);
  }, []);

  return (
    <div className="feed-page">
      <div className="my-post">
        <MyMission />
      </div>
      <div className="feed-post">
        {allMissions && allMissions.length > 0 ? (
          allMissions.map((mission) => (
            <div key={mission.id}>
              <MissionCard missions={mission} user={currentUser} />
              
            </div>
          ))
        ) : (
          <p>Aucune mission disponible pour le moment.</p>
        )}
      </div>
    </div>
  );
};

export default Mission;
