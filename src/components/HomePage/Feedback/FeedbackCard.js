import React from "react";
import avatar from "../../../assets/images/profilepicture.png";
import { ImQuotesRight } from "react-icons/im";
const FeedbackCard = () => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl my-8 mx-2">
      <div className="flex justify-between">
      <ImQuotesRight />
        <div className="flex gap-4">
          <img src={avatar} className="w-10 h-10 order-last" />
          <div className="text-right">
            <h1>נתי סמדג'ה</h1>
            <p>מהנדס תוכנה</p>
          </div>
        </div>
       
      </div>

      <div className="py-8">
        <h3 className="text-lg text-right">
          נרשמתי לאתר וגיליתי פלטפורמה מדהימה! כסטודנט, סוף סוף יש לי מקום להציג
          את הכישורים שלי ולהתחבר לחברות שמחפשות בדיוק את מה שיש לי להציע. הממשק
          מאוד נוח לשימוש, והחיבור עם חברות ומעסיקים פוטנציאליים פשוט ויעיל. אני
          ממליץ בחום לכל סטודנט שרוצה להתחיל את הקריירה שלו ברגל ימין!.
        </h3>
      </div>
    </div>
  );
};

export default FeedbackCard;
