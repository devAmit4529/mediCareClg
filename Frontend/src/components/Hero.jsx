import React from "react";

const Hero = ({ title, imageUrl }) => {
  return (
    <>
      <div className="hero container">
        <div className="banner">
          <h1>{title}</h1>
          <p>
          Medicare Hospital has been delivering compassionate care and medical excellence for [10+] years. Our dedicated team of professionals is committed to providing personalized treatment using state-of-the-art technology. From routine check-ups to specialized surgeries, we're here to support your health journey. Experience the Medicare Hospital difference – where compassion meets excellence !!
          </p>
        </div>
        <div className="banner">
          <img src={imageUrl} alt="hero" className="animated-image" />
          <span>
            <img src="/Vector.png" alt="vector" />
          </span>
        </div>
      </div>
    </>
  );
};

export default Hero;
