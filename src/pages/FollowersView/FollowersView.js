import React, { useEffect, useState } from 'react'
import {loadFollowers, loadUser } from "../../hooks/useLoadUsers";
import { useParams } from 'react-router-dom';




const FollowersView = ({}) => {
    const {id}=useParams()
    const [userData, setUserData] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const openLightbox = (imageUrl) => {
        setSelectedImage(imageUrl);
        document.body.style.overflow = "hidden"; // מניעת גלילה כש-Lighbox פתוח
      };
      const closeLightbox = () => {
        setSelectedImage(null);
        document.body.style.overflow = "auto"; // החזרת הגלילה
      };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await loadUser(id, setUserData);
        if (userData?.followers) {
          await loadFollowers(userData.followers, setFollowers);
        }
      } catch (error) {
        console.error(error);
      }
    };
    let unsubscribe;
    fetchData().then((cleanup) => (unsubscribe = cleanup));
    return () => {
      unsubscribe?.();
    };
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {followers.map((follower) => (
          <div
            key={follower.uid}
            className="bg-white shadow-md border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300"
          >
            <img
              src={follower.profilePicture}
              alt={follower.userName}
              className="w-24 h-24 object-cover rounded-full mb-3 cursor-pointer"
              onClick={() => openLightbox(follower.profilePicture)}
            />
            <a
              href={`/profile/${follower.uid}`}
              className="text-lg font-medium text-blue-600 hover:underline"
            >
              {follower.userName}
            </a>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeLightbox}
        >
          <div
            className="relative bg-white p-4 rounded-lg"
            onClick={(e) => e.stopPropagation()} // מניעת סגירה בעת לחיצה על התמונה
          >
            <img
              src={selectedImage}
              alt="Selected User"
              className="max-w-full max-h-[80vh] object-contain"
            />
            <button
              onClick={closeLightbox}
              className="absolute top-2 right-2 text-white bg-red-600 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default FollowersView