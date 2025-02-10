import React, { useState, useEffect } from "react";
import MyMission from "../../components/MyMission/MyMission";
import MissionCard from "../../components/MissionCard/MissionCard";
import { useAuth } from "../../context/AuthContext";
import { loadMissions } from "../../hooks/useLoadMissions";
import { loadCategories } from "../../hooks/useLoadCategories";

const MissionFeed = () => {
  const { currentUser } = useAuth();
  const [allMissions, setAllMissions] = useState([]);
  const [filteredMissions, setFilteredMissions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadMissions(setAllMissions);
    loadCategories((fetchedCategories) => setCategories(fetchedCategories));
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredMissions(allMissions);
    } else {
      setFilteredMissions(allMissions.filter((mission) => mission.education === selectedCategory));
    }
  }, [selectedCategory, allMissions]);

  return (
    <div className="flex flex-col items-center w-full min-h-screen space-y-8">

      {/* רכיב משימה שלי */}
      <div className="w-full max-w-3xl rounded-2xl">
        <MyMission />
      </div>

      {/* קרוסלת קטגוריות */}
      <div className="w-full min-w-3xl p-4 flex justify-evenly items-center  bg-gray-50 rounded-xl">
        <div className="overflow-x-auto whitespace-nowrap gap-1 flex  py-4">
          {/* קטגוריה "הצג הכל" */}
          <div
            className={`cursor-pointer flex flex-col items-center justify-center w-32 h-32  rounded-xl  ${
              selectedCategory === "all" ? "border-blue-500" : "border-gray-300"
            }`}
            onClick={() => setSelectedCategory("all")}
          >
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-bold">הצג הכל</span>
            </div>
          </div>

          {/* קטגוריות נוספות */}
          {categories.map((category) => (
            <div
              key={category.id}
              className={`cursor-pointer flex flex-col items-center justify-center w-32 h-32 rounded-xl  ${
                selectedCategory === category.nameCategory ? "border-blue-500" : "border-gray-300"
              }`}
              onClick={() => setSelectedCategory(category.nameCategory)}
            >
              <img
                src={category.imageURL}
                alt={category.nameCategory}
                className="w-16 h-16 object-cover rounded-full"
              />
              <p className="mt-2 text-sm font-bold text-gray-700">{category.nameCategory}</p>
            </div>
          ))}
        </div>
      </div>

      {/* רשימת המשימות */}
      <div className="w-full max-w-3xl space-y-6">
        {filteredMissions.length > 0 ? (
          filteredMissions.map((mission) => (
            <div key={mission.id} className="p-6 rounded-2xl">
              <MissionCard missions={mission} user={currentUser} />
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">אין משימות כרגע</p>
        )}
      </div>
    </div>
  );
};

export default MissionFeed;
