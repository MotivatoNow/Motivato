import React from "react";

const AboutUs = () => {
  return (
    <div id="aboutus" className="w-full  bg-[#15CDCA13] py-24">
      <div className="md:max-w-[1480px] m-auto max-w-[600px]  px-4 md:px-0">
        <div className="flex flex-col items-center gap-12">
          {/* Content Section */}
          <div className="text-center">
            <h2 className="text-5xl font-extrabold text-[#15CDCA] mb-6">מי אנחנו?</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              אנו פלטפורמה חברתית ייחודית המחברת בין סטודנטים לחברות ומציעה מרחב
              להזדמנויות חדשות. המטרה שלנו היא לבנות קהילה תומכת ומקצועית, שתסייע
              לכם לקחת את הקריירה שלכם לשלב הבא.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              הצטרפו אלינו וגלו עולם של אפשרויות, פרויקטים, וחיבורים מקצועיים
              שייקחו אתכם רחוק יותר.
            </p>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;