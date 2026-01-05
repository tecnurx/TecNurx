"use client";
import React from "react";
import Image from "next/image";
import hero from "@/assets/images/hero.svg";
import rate from "@/assets/images/rate.svg";
import hslide from "@/assets/images/hslide.svg";
import "@/app/home.css";
import Link from "next/link";

const HeroSection = () => {
  return (
    <>
      <main className="hero-section">
        <div className="hero-content">
          <div className="hero-texts">
            <Image src={rate} alt="rate" />
            <h1>
              All your device needs, solved with{" "}
              <span>flexible payment plans</span>
            </h1>
            <p>
              Get professional repairs, protection plans, and new devices with
              free pickup and delivery
            </p>
            <div className="hero-btns">
              {/* <button
                onClick={() => {
                  document.getElementById("GetQuote")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                Get Quote
              </button> */}
              <Link href="/login">Sign In</Link>
            </div>
          </div>
          <Image src={hslide} alt="our partners" className="hero-partner" />
        </div>
        <Image src={hero} alt="Hero Image" className="hero-image" />
      </main>
    </>
  );
};

export default HeroSection;
