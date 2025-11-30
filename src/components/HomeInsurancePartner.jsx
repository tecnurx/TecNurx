import Image from "next/image";
import React from "react";
import pickup from "../assets/images/pickup.svg";
import partner from "../assets/images/partner.svg";
import cracked from "../assets/images/cracked.svg";
import shield from "../assets/images/shield.svg";
import gadg from "../assets/images/gadg.svg";
import Link from "next/link";

const HomeInsurancePartner = () => {
  return (
    <div>
      <div className="home-section-wrap">
        <div className="schedule-pickup">
          <div className="word-wrap">
            <h1>
              Got a broken phone? <span> We'll come to you</span>
            </h1>
            <p>
              We pick up, repair, and deliver your phone to save you time and
              hassle. Don't let a broken device slow you down
            </p>
            <Link href="#">Schedule a pickup</Link>
          </div>
          <Image src={pickup} alt="schedule a pickup" />
        </div>
        <div className="schedule-pickup">
          <div className="grid-images">
            <div>
              <Image src={cracked} alt="cracked screen" />
            </div>
            <div>
              <Image src={shield} alt="shield" />
            </div>
            <div>
              <Image src={gadg} alt="gadgets" />
            </div>
          </div>
          <div className="word-wrap">
            <h1>
              <span>Protect your </span> devices
            </h1>
            <p>
              Get peace of mind with our device protection plans. They cover
              repairs, replacements, and more, so you're ready for anything
            </p>
            <Link href="/insurance">See protection plans</Link>
          </div>
        </div>
        <div className="schedule-pickup">
          <div className="word-wrap">
            <h1>
              <span>Become a</span> Partner
            </h1>
            <p>
              Become a TecNurx partner and get a dedicated B2B platform to
              handle all your gadget repair needs. We offer businesses,
              organizations, and service providers end-to-end solutions for
              corporate devices, retail stock, and warranty services.
            </p>
            <Link href="/partner">Find out more</Link>
          </div>
          <Image src={partner} alt="become a partner" />
        </div>
      </div>
    </div>
  );
};

export default HomeInsurancePartner;
