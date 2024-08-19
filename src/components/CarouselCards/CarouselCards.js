import React, { useState, useEffect } from "react";
import { db, docs } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import "./CarouselCards.css";


const CarouselCards = (props) => {
  const [index, setIndex] = useState(0);
  const [data, setData] = useState([]);
  const loadData = async () => {
    const snapShot = await getDocs(collection(db, props.collection));
    const dataList = snapShot.docs.map((doc) =>
      doc.data({ id: doc.id, ...doc.data() })
    );
    setData(dataList);
  };
  useEffect(() => {
    loadData();
  }, []); //data from Categories

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % data.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [data.length]); //timer

  return (
    <>
      {data.map((d) => (
        <div className="carousel card">
          <img className="card-img-top" src={d.imageURL} alt="Card image cap" />
          <div>
            <div className="card-body">
              <p className="card-text">{d.descriptionCategory}</p>
              <a href="#" className="btn">
                {d.nameCategory}
              </a>
            </div>
          </div>
        </div>
      ))}
      

      <a
        class="carousel-control-next"
        href="#carouselExampleControls"
        role="button"
        data-slide="next"
      >
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
      </a>
      <a
        class="carousel-control-prev"
        href="#carouselExampleControls"
        role="button"
        data-slide="prev"
      >
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      </a>
    </>
  );
};

export default CarouselCards;
