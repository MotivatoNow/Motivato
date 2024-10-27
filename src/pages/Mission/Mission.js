import React, {useMemo, useState} from "react";
import MissionCard from "../../components/MissionCard/MissionCard";
import {useParams} from "react-router-dom";
import {getMissions} from "../../context/Firestore";

const Post = () => {
    const { id } = useParams();
    const [allMissions, setAllMissions] = useState([])
    useMemo(() => {
        getMissions(setAllMissions);
    }, []);

    const filteredMission = allMissions.find((mission) => mission.id === id);

    return (
        <>
            {filteredMission ? (
                <MissionCard missions={filteredMission} />
            ) : (
                <p>Mission not found</p>
            )}
        </>
    );
};

export default Post;
