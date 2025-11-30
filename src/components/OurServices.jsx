import React from "react";
import repair from "../assets/images/repair.svg";
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
            For <i>everything gadget, we got you</i> <span>covered</span>
          </h1>
        </div>
        <div className="services-grid">
          <div className="sgrids sgrid1">
            <Image src={repair} alt="gadget repair" />
            <div>
              <h2>Gadget Repairs</h2>
              <p>
                Get your devices repaired and pay later. We fix everything from
                cracked screens to software issues and more
              </p>
              <Link href="/book-repair">
                <span>Start a repair</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          {/* <div className="sgrids sgrid2">
            <div>
              <h2>Gadget Sales</h2>
              <p>
                Browse our wide selection of new and refurbished gadgets. Find
                the latest smartphones, laptops, and smart devices at great
                prices
              </p>
              <Link href="#">
                <span>Explore gadgets</span>
                <ArrowRight size={18} />
              </Link>
            </div>
            <Image src={sale} alt="gadget sales" />
          </div> */}
          <div className="sgrids sgrid2 sgrid3">
            <div>
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
            <Image src={insure} alt="gadget insure" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurServices;
