import {
  getDoc,
  doc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import React, { useEffect } from "react";
import { db } from "../config/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";
import { getCurrentTimeStamp } from "../features/useMoment/useMoment";
import { createNotification } from "./useLoadNotifications";
import { message } from "antd";

export const getApplicationsData = async (applications) => {
  return Promise.all(
    applications.docs.map(async (docA) => {
      const applicationData = docA.data();
      const userDoc = await getDoc(doc(db, "Users", applicationData.userId));

      return {
        id: docA.id,
        ...applicationData,
        userName: userDoc.exists() ? userDoc.data().userName : "Unknown User",
        userProfilePicture: userDoc.exists()
          ? userDoc.data().profilePicture
          : "defaultProfilePictureURL",
      };
    })
  );
};
export const getApplications = async (missionId, setApplications) => {
  const applicationsRef = collection(db, "Applications");
  const q = query(applicationsRef, where("missionId", "==", missionId));

  const unsubscribe = onSnapshot(q, async (querySnapshot) => {
    const applicationsData = await getApplicationsData(querySnapshot);
    setApplications(applicationsData);
  });
  return () => unsubscribe();
};
export const handleFileChange = (e, setSelectedFile) => {
  const file = e.target.files[0];
  if (file && file.type !== "application/pdf") {
    console.error("Only PDF files are allowed.");
    message.error("Please select a valid PDF file.");
    setSelectedFile(null);
    return;
  }
  setSelectedFile(file);
};
export const handleApply = async (
  selectFile,
  missions,
  currentUser,
  setApply,
  setSelectedFile
) => {
  try {
    if (!selectFile) {
      console.error("No file selected.");
      return;
    }

    const fileRef = ref(
      storage,
      `Applications/${missions.id}/${currentUser.uid}/${selectFile.name}`
    );
    await uploadBytes(fileRef, selectFile);
    const fileUrl = await getDownloadURL(fileRef);

    if (!fileUrl) {
      throw new Error("Failed to retrieve the file URL after upload.");
    }
    message.success("...")

    setApply(false);
    setSelectedFile(null);

    await addDoc(collection(db, "Applications"), {
      missionId: missions.id,
      userId: currentUser.uid,
      fileUrl: fileUrl,
      fileName: selectFile.name,
      timeStamp: getCurrentTimeStamp("LLL"),
    });
    const notification = {
      type: "Application",
      user: currentUser.uid,
      missionTitle: missions.title,
      missionId: missions.id,
      postUser: missions.postUser,
      postUserName: missions.postUserName,
      timeStamp:getCurrentTimeStamp("LLL")
    };
    await createNotification(notification);
  } catch (error) {
    console.error("Error during the application process:", error);
  }
};
