import React, {useMemo, useState} from "react";
import MissionCard from "../../components/MissionCard/MissionCard";
import {useParams} from "react-router-dom";
import {loadMissions} from "../../hooks/useLoadMissions";

const Post = () => {
    const { id } = useParams();
    const [allMissions, setAllMissions] = useState([])
    useMemo(() => {
        loadMissions(setAllMissions);
    }, []);

    const filteredMission = allMissions.find((mission) => mission.id === id);

    return (
        <>
            {filteredMission ? (
                <MissionCard missions={filteredMission} />
            ) : (
                <p>לא נמצאו משימות</p>
            )}
        </>
    );
};

export default Post;
