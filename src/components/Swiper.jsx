import React from "react";
import testi from "@/assets/images/testi.svg";
import quote from "@/assets/images/quote.svg";
import Image from "next/image";
import "./swiper.css";
import { CircleUser } from "lucide-react";

const SwiperCard = () => {
  // Duplicate the array so the animation never has a gap
  const testimonials = [
    {
      id: 1,
      text: "TecNurx delivered exactly what they promised. From structured pickup to transparent progress updates and timely delivery, the process was efficient and reliable. This is how modern service platforms should operate.",
      title: "A seamless, end-to-end experience.",
      name: "Ayo O.",
      designation: "Senior Consultant, Lagos",
      image: testi,
    },
    {
      id: 2,
      text: "What stood out was the visibility. Knowing where my device was at every stage created a high level of confidence. TecNurx has clearly built trust into its operating model.",
      title: "Clarity, accountability, and trust.",
      name: " Halima S.",
      designation: "Operations Lead, Abuja",
      image: testi,
    },
    {
      id: 3,
      text: "When my laptop failed during a critical work period, TecNurx handled everything with minimal disruption. The experience was efficient, well-communicated, and professional.",
      title: "Designed for professionals who value time.",
      name: "Daniel K.",
      designation: "Product Manager",
      image: testi,
    },
    {
      id: 4,
      text: "TecNurx combines qualified technical experts with clear communication and defined processes. The service reflects strong operational discipline.",
      title: "Consistent quality and responsible execution",
      name: "Uche M.",
      designation: "Founder & CEO",
      image: testi,
    },
    {
      id: 5,
      text: "The installment option allowed me to move forward immediately while maintaining financial flexibility. It’s a thoughtful approach that reflects deep market understanding.",
      title: "Flexible payments without compromising service quality.",
      name: "Sadiq A.",
      designation: "Finance Professional",
      image: testi,
    },
    {
      id: 6,
      text: "Managing repairs across multiple devices used to be fragmented. TecNurx brought structure, reporting, and accountability into one platform highly valuable for business operations.",
      title: "A scalable solution for business device management.",
      name: "Zainab R.",
      designation: "Head of Operations",
      image: testi,
    },
  ];

  return (
    <div className="overflow-hidden bg-white py-12">
      <div className="marquee">
        <div className="marquee-track">
          {testimonials.map((item, index) => (
            <div className="swiper-card" key={`${item.id}-${index}`}>
              <Image src={quote} alt="quote" className="quote" />
              <div className="stext-wrap">
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>

              <div className="card-details">
                {/* <Image
                  src={item.image}
                  alt={item.name}
                  width={60}
                  height={60}
                  className="rounded-full object-cover"
                /> */}
                <CircleUser size={60} color="#bdbdbd" />
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
