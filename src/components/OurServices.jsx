import React from "react";
import repair from "../assets/images/repair.svg";
import repairMobile from "../assets/images/repair-mobile.png";
import deviceModels from "../assets/images/device-models.png";
import sale from "../assets/images/sale.svg";
import insure from "../assets/images/insure.svg";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const OurServices = () => {
  return (
    <div>
      <div className="our-services">
        <div className="services-header">
          <div className="services-top">
            <span>Our Services</span>
          </div>
          <h1>
            For <i>everything gadget,</i>{" "}
            <span className="services-muted">we got you</span>{" "}
            <span className="services-highlight">covered</span>
          </h1>
        </div>
        <div className="services-grid">
          {/* 1. Gadget Repairs */}
          <div className="sgrids sgrid1">
            <Image
              src={repair}
              alt="gadget repair"
              priority
              className="repair-img-desktop"
            />
            <Image
              src={repairMobile}
              alt="gadget repair"
              priority
              className="repair-img-mobile service-card-art"
            />
            <div className="service-card-content">
              <h2>Gadget Repairs</h2>
              <p>
                Get your devices repaired and pay later. We fix everything from
                cracked screens to software issues and more
              </p>

              {/* Supported Brand Device Models (Mobile Only) */}
              <div className="repairs-device-models" aria-label="Supported brands">
                <Image
                  src={deviceModels}
                  alt="Apple, Samsung, HP, Lenovo, TECNO"
                  className="device-models-img"
                  priority
                />
              </div>

              <Link href="/dashboard/book-repair">
                <span>Start a repair</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* 2. Gadget Insurance */}
          <div className="sgrids sgrid2 sgrid3 sgrid-insurance">
            <div className="service-card-content">
              <h2>Gadget Insurance</h2>
              <p>
                Protect your favorite devices from unexpected damage, theft, or
                loss. Get peace of mind with our flexible insurance plans
              </p>
              <Link href="/insurance">
                <span>Explore plans</span>
                <ArrowRight size={18} />
              </Link>
            </div>
            <Image src={insure} alt="gadget insurance" className="service-card-art" />
          </div>

          {/* 3. Gadget Sales */}
          <div className="sgrids sgrid2 sgrid-sales">
            <div className="service-card-content">
              <h2>Gadget Sales</h2>
              <p>
                Browse our wide selection of new and refurbished gadgets. Find
                the latest smartphones, laptops, and smart devices at great
                prices
              </p>
              <Link href="/buy-devices">
                <span>Explore gadgets</span>
                <ArrowRight size={18} />
              </Link>
            </div>
            <Image src={sale} alt="gadget sales" className="service-card-art" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurServices;
