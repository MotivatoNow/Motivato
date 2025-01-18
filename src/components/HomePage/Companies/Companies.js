import React from "react";
import company from "../../../assets/images/Logo_PNG.png";
const Companies = () => {
  return (
    <>
      <div className="w-full bg-white py-[50px]">
        <div className="md:max-w-[1480px] max-w-[600px] m-auto">
            <h1 className="text-center text-2xl font-bold text-gray-800">יש אצלנו ברשת החברתית מעל ל 300 חברות</h1>
            <p className="text-center text-gray-600  text-xl ">החברות שמחפשות את הכישרון הבא נמצאות כאן.</p>
            <div className="flex justify-center md:gap-8 gap-1 py-8 ">
                <img src={company} className="h-16"/>
                <img src={company} className="h-16"/>
                <img src={company} className="h-16"/>
                <img src={company} className="h-16"/>
            </div>

        </div>
      </div>
    </>
  );
};

export default Companies;
