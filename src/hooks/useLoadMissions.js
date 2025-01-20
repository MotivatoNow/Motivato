import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { message } from "antd";

const missionsCollection = collection(db, "Missions");

export const createMission = async (object) => {
  try {
    const mission = await addDoc(missionsCollection, object);
    message.success("Document added");
    return mission;
  } catch (error) {
    console.error(error);
  }
};

export const loadMissions = (setAllMissions) => {
  onSnapshot(missionsCollection, (snapshot) => {
    const missions = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setAllMissions(missions);
  });
};
