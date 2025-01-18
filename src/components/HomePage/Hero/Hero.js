import React, { useEffect, useState } from "react";
import welcome from "../../../assets/images/welcome.jpg";
import { db } from "../../../config/firebase";
import { collection, getDocs } from "firebase/firestore";import { loadCategories } from "../../../hooks/useLoadCategories";
import { Loading } from "../../Loading/Loading";
const Hero = () => {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
       const usersSnapshot = await getDocs(collection(db, "Users"));
       setUsers(
        usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
       loadCategories(setCategories);
        setLoading(false);
      } catch (error) {
        console.error("שגיאה במהלך שליפת הנתונים :", error);
        
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full bg-white py-24 md:px-0 px-10 overflow-hidden">
      {/* Col 1 */}
      <div className="md:max-w-[1480px] max-w-[600px] m-auto grid md:grid-cols-2 gap-6">
        {/* Text */}
        <div className="flex justify-start flex-col gap-2">
          <p className="text-2xl text-[#15CDCA] font-medium ">
            הצעד הראשון להצלחה
          </p>
          <h1 className="md:leading-[72px] md:text-6xl text-4xl font-semibold py-2">
            החיבור בין סטודנטים לפרילנסרים וחברות מתחיל כאן
          </h1>
          <p className="text-lg text-gray-500">
            רשת חברתית ייחודית שמאפשרת לסטודנטים להפוך את הכישרון שלהם לקריירה.
            התחברו, שתפו, ועבדו עם החברות שמחפשות אתכם.
          </p>

          {/* Stats */}
          <div className="py-4 stats shadow stats-vertical lg:stats-horizontal">
            <div className="stat">
              <div className="stat-figure text-[#4F80E2]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block h-8 w-8 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <div className="stat-title">חברות רשומות</div>
              <div className="stat-value">
                {users.filter((user) => user.userType === "Company").length > 0
                  ? users.filter((user) => user.userType === "Company").length
                  : "0"}
              </div>
              <div className="stat-desc">1 ינואר - 2 פברואר</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-[#4F80E2]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block h-8 w-8 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  ></path>
                </svg>
              </div>
              <div className="stat-title">סה"כ משתמשים</div>
              <div className="stat-value">{users.length}</div>
              <div className="stat-desc">↗︎ 400 (22%)</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-[#4F80E2]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block h-8 w-8 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  ></path>
                </svg>
              </div>
              <div className="stat-title">סה"כ תחומים</div>
              <div className="stat-value">{categories.length}</div>
              <div className="stat-desc">↘︎ 90 (14%)</div>
            </div>
          </div>
        </div>
        {/* Col 2 */}
        <img src={welcome} className="md:order-last order-first " />
      </div>
    </div>
  );
};

export default Hero;
