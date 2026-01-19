import React from "react";
import Image from "next/image";
import partner from "@/assets/images/partnerwith.png";
import pslide from "@/assets/images/pslide.svg";
import why1 from "@/assets/images/why1.svg";
import why2 from "@/assets/images/why2.svg";
import why3 from "@/assets/images/why3.svg";
import why4 from "@/assets/images/why4.svg";
import why5 from "@/assets/images/why5.svg";
import why6 from "@/assets/images/why6.svg";
import "./partner.css";
import Link from "next/link";
import Footer from "@/components/footer/Footer";

const Partner = () => {
  const whyPartner = [
    {
      id: 1,
      image: why1,
    },
    {
      id: 2,
      image: why2,
    },
    {
      id: 3,
      image: why3,
    },
    {
      id: 4,
      image: why4,
    },
    {
      id: 5,
      image: why5,
    },
    {
      id: 6,
      image: why6,
    },
  ];
  return (
    <div>
      <div className="partner-section">
        <div className="partner-content">
          <h1>
            Partner with
            <span> TecNurx</span>
          </h1>
          <p>
            Become a TecNurx partner and get a dedicated B2B platform to handle
            all your gadget repair needs. We offer businesses, organizations,
            and service providers end-to-end solutions for corporate devices,
            retail stock, and warranty services.
          </p>
          <button>Partner with us</button>
          <Image src={pslide} alt="Marquee" className="marqueee" />
        </div>
        <Image src={partner} alt="partner Image" className="partner-image" />
      </div>
      <div className="why-section">
        <div className="why-top">
          <span>Why partner with us?</span>
        </div>
        <div className="why-grid">
          {whyPartner.map((why) => (
            <Image src={why.image} alt={why.image} />
          ))}
        </div>
        <Link href="#">Partner with us</Link>
      </div>
      <Footer newsPaperWrap={true} />
    </div>
  );
};

export default Partner;
