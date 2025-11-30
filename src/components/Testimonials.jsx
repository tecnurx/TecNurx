import React from "react";
import Swiper from "./Swiper";

const Testimonials = () => {
  return (
    <div>
      <div className="testimonial-wrap">
        <div className="faq-header testimonial-padding">
          <div className="faq-top">
            <span style={{ background: "white" }}>Testimonials</span>
          </div>
          <h1>
            People that <span>trust us</span> <i>are saying these...</i>
          </h1>
        </div>
        <Swiper />
      </div>
    </div>
  );
};

export default Testimonials;
