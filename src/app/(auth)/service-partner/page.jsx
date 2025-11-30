import React from "react";
import "./service.css";
import hero from "@/assets/images/servpartner.svg";
import Image from "next/image";
import Navbar from "@/components/navbar/Navbar";
import Link from "next/link";

const ServicePartner = () => {
  return (
    <>
      <Navbar />
      <div className="service-partner">
        <div className="hero-section">
          <div className="hero-content">
            <h1>
              Become a<span> Service Partner</span>
            </h1>
            <p>
              Join TecNurx as a Service Center Engineer and be part of a growing
              network of top-tier technicians dedicated to providing premium
              repair solutions.
            </p>
            <Link href='/service-partner/signup'>Sign Up</Link>
          </div>
          <Image src={hero} alt="Hero Image" className="hero-image" />
        </div>
        <div className="requirements">
          <h1>Requirements</h1>
          <ul>
            <li>
              Minimum of 2 years experience in gadget repairs (mobile phones,
              tablets, laptops, etc.)
            </li>
            <li>
              Certified training in electronics repair or related fields
              (preferred but not mandatory)
            </li>
            <li>
              Proficiency in diagnosing and troubleshooting hardware and
              software issues
            </li>
            <li>Ability to handle modern repair tools and techniques</li>
            <li>Good communication skills and customer service orientation</li>
            <li>
              Must have a functional workspace or access to a service center
            </li>
            <li>
              Willingness to adhere to Abtechcare’s quality and service
              standards
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default ServicePartner;
