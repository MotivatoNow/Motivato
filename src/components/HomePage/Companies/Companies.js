import React from "react";
import company2 from "../../../assets/images/company2.png";
import company3 from "../../../assets/images/company3.jpg";
import company4 from "../../../assets/images/copmany4.jpg";
const Companies = () => {
  return (
    <>
      <div className="w-full bg-white py-[50px]">
        <div className="md:max-w-[1480px] max-w-[600px] m-auto">
            <h1 className="text-center text-2xl font-bold text-gray-800">בפלטפורמה שלנו תמצאו חברות מוכרת</h1>
            <p className="text-center text-gray-600  text-xl ">החברות שמחפשות את הכישרון הבא נמצאות כאן.</p>
            <div className="flex justify-center md:gap-8 gap-1 py-8 ">
                <img src={company2} className="h-16 "/>
                <img src={company3} className="h-16"/>
                <img src={company4} className="h-16"/>
            </div>

        </div>
      </div>
    </>
  );
};

export default Companies;
