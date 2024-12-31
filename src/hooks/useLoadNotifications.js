import { addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";

export const createNotification = async (notification) => {
    try {
        const notificationRef = await addDoc(collection(db, "Notifications"), notification);
        return notificationRef;
    } catch (error) {
        console.error("Error adding notification:", error);
        throw error;
    }
};
