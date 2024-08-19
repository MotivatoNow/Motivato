import React from "react";
import "../App.css";
import CarouselCards from "./CarouselCards";

const Main = () => {
  return (
    <>
      <header className="header_hero row p-5 ">
        <div className="col-8 d-flex flex-column p-5 ">
          <h1 className="header_hero-title">הצטרפו לקהילת הפרילנסרים</h1>
          <h2 className="header_hero-subtitle">
            התחברו לחברות, הציגו את הכישורים שלכם, ושתפו פעולה עם פרילנסרים
            נוספים.
          </h2>
          <div className="header_hero-buttons">
            <button className="btn header_hero-btn_join">
              <span>אני רוצה להצטרף!</span>
            </button>
            <button className="btn header_hero-btn_readmore">
              <span>קראו עוד</span>
            </button>
          </div>
        </div>

        <div className="col-4">12</div>
      </header>

      <section className="join-us__section row p-5 ">
        <div className="col-8">
          <h1>
            הצטרפו לקהילה שלנו <br />
            ושתפו את הניסיון שלכם
          </h1>
          <p>
            גלו פלטפורמת מדיה חברתית שבה פרילנסרים וחברות יכולים להתחבר,
            <br /> לפרסם ולשתף את חוויותיהם עם אנשים בעלי חשיבה דומה. הצטרפו
            לקהילה התוססת שלנו כבר היום!
          </p>

          <div className="flex-row d-flex section_post">
            <div className="d-flex flex-column section_post-desc">
              <h2>פוסט</h2>
              <p>
                שתפו את החוויות, התובנות וטיפים משלכם <br />
                עם פרילנסרים וסטודנטים אחרים.
              </p>
            </div>

            <div className="d-flex flex-column section_post-desc">
              <h2>התחברו</h2>
              <p>
                התחברו לפרילנסרים וסטודנטים אחרים
                <br />
                והרחיבו את הרשת המקצועית שלכם.
              </p>
            </div>
          </div>
          <div className="section-buttons">
            <button className="btn section-btn_readmore">
              <span>קראו עוד</span>
            </button>
            <a href="#" className="section-link_join">
              <span> הירשמו {">"} </span>
            </a>
          </div>
        </div>
        <div className="col-4">
          <h1>תמונה!</h1>
        </div>
      </section>

      <section className="card-categories__section row p-5 ">
        <h2>מה תמצאו אצלנו?</h2>
        <div className="categories">
        <CarouselCards collection="Categories" />
        </div>
      </section>
    </>
  );
};

export default Main;
