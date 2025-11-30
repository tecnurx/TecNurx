import React from "react";
import testi from "@/assets/images/testi.svg";
import quote from "@/assets/images/quote.svg";
import Image from "next/image";
import "./swiper.css";

const SwiperCard = () => {
  // Duplicate the array so the animation never has a gap
  const testimonials = [
    {
      id: 1,
      text: "Outstanding customer support! They went above and beyond to help me resolve my issue. I felt valued as a customer, and their commitment to ensuring my satisfaction left a lasting impression.",
      name: "John Doe",
      designation: "Project Manager",
      image: testi,
    },
    {
      id: 2,
      text: "Reliable and trustworthy. They have earned my trust and loyalty. This company has consistently demonstrated reliability and trustworthiness.",
      name: "Jane Doe",
      designation: "Project Manager",
      image: testi,
    },
    {
      id: 3,
      text: "A game-changer for my business. Thank you for your expertise! The guidance and strategies provided by this team have transformed my business into a thriving success.",
      name: "John Holmes",
      designation: "Project Manager",
      image: testi,
    },
  ];

  // Duplicate for seamless loop (at least 2×, more if you want)
  const duplicatedTestimonials = [
    ...testimonials,
    ...testimonials,
    ...testimonials,
  ];

  return (
    <div className="overflow-hidden bg-white py-12">
      <div className="marquee">
        <div className="marquee-track">
          {duplicatedTestimonials.map((item, index) => (
            <div className="swiper-card" key={`${item.id}-${index}`}>
              <Image src={quote} alt="quote" className="quote" />
              <p>{item.text}</p>

              <div className="card-details">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={60}
                  height={60}
                  className="rounded-full object-cover"
                />
                <div>
                  <h3>{item.name}</h3>
                  <span>{item.designation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwiperCard;
