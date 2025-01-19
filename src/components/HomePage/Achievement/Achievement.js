import React, { useEffect, useState } from "react";
import achievement from "../../../assets/images/Jan-Success_1.jpg";
import { SlGraduation } from "react-icons/sl";
import { SiTheboringcompany } from "react-icons/si";
import { BiTask } from "react-icons/bi";
import { SlPeople } from "react-icons/sl";
import { db } from "../../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { loadMissions } from "../../../hooks/useLoadMissions";
import { loadUser } from "../../../hooks/useLoadUsers";
import { loadCategories } from "../../../hooks/useLoadCategories";

const Achievement = () => {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "Users"));
        setUsers(
          usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        loadMissions(setMissions);

        setLoading(false);
      } catch (error) {
        console.error("שגיאה במהלך שליפת הנתונים :", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div id="achievement" className="w-full bg-white py-24">
      <div className="md:max-w-[1480px] m-auto grid md:grid-cols-2 max-w-[600px]  px-4 md:px-0">
        <div className="flex flex-col justify-center ">
          <h1 className="md:leading-[72px] text-3xl font-bold">
            ההשגים <span className="text-[#15CDCA]">שלנו</span>
          </h1>
          <p className="text-lg text-gray-600">
            הדרך שלנו רצופה בהצלחות שהתגבשו לאורך השנים.
          </p>

          <div className="grid grid-cols-2 py-16">
            <div className="py-6 flex">
              <div className="p-4 bg-[#15cdca25] rounded-xl">
                <SiTheboringcompany size={30} style={{ color: "#15CDCA" }} />
              </div>
              <div className="px-3">
                <h1 className="text-2xl font-semibold">
                  {users.filter((user) => user.userType === "Company").length >
                  0
                    ? users.filter((user) => user.userType === "Company").length
                    : "0"}
                </h1>
                <p className="text-gray-800">חברות</p>
              </div>
            </div>
            <div className="py-6 flex">
              <div className="p-4 bg-[#3E54D325] rounded-xl">
                <BiTask size={30} style={{ color: "#3E54D3" }} />
              </div>
              <div className="px-3">
                <h1 className="text-2xl font-semibold">{missions.length}+</h1>
                <p className="text-[#6D737A]">משימות</p>
              </div>
            </div>
            <div className="py-6 flex">
              <div className="p-4 bg-[#FFEEF0] rounded-xl">
                <SlGraduation size={30} style={{ color: "#ED4459" }} />
              </div>
              <div className="px-3">
                <h1 className="text-2xl font-semibold">
                  {users.filter((user) => user.userType === "Student").length >
                  0
                    ? users.filter((user) => user.userType === "Student").length
                    : "0"}
                </h1>
                <p className="text-[#6D737A]">סטודנטים</p>
              </div>
            </div>
            <div className="py-6 flex">
              <div className="p-4 bg-[#F0F7FF] rounded-xl">
                <SlPeople size={30} style={{ color: "#0075FD" }} />
              </div>
              <div className="px-3">
                <h1 className="text-2xl font-semibold">{users.length}</h1>
                <p className="text-[#6D737A]">משתמשים</p>
              </div>
            </div>
          </div>
        </div>

        <img src={achievement} className="m-auto md:order-last  order-first" />
      </div>
    </div>
  );
};

export default Achievement;
