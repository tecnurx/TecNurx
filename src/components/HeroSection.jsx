"use client";
import React from "react";
import Image from "next/image";
import hero from "@/assets/images/hero.svg";
import rate from "@/assets/images/rate.svg";
import hslide from "@/assets/images/hslide.svg"; // if still used elsewhere
import "@/app/home.css";
import Link from "next/link";
import CountUp from "react-countup";

const numberStat = [
  {
    id: 1,
    end: 2000,
    suffix: "+",
    title: "Successful Repairs",
  },
  {
    id: 2,
    end: 24,
    title: "Repair Time",
    suffix: " Hrs", // space before Hrs looks better
  },
  {
    id: 3,
    end: 10,
    suffix: "x",
    title: "Response Rate",
  },
  {
    id: 4,
    end: 20,
    suffix: "+",
    title: "Tech Partner Companies",
  },
];

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
              <Link href="/login">Sign In</Link>
            </div>
          </div>

          {/* NUMBERS */}
          <div className="numbers-wrap">
            {numberStat.map((stat) => (
              <div key={stat.id}>
                <h2>
                  <CountUp
                    start={0}
                    end={stat.end}
                    duration={2} // animation time in seconds
                    suffix={stat.suffix || ""} // "+" or "x" or " Hrs"
                    enableScrollSpy // only start when in view
                    scrollSpyOnce // animate only the first time
                    scrollSpyDelay={100} // small delay after entering view
                    useEasing // smooth easing
                  />
                </h2>
                <h3>{stat.title}</h3>
              </div>
            ))}
          </div>
        </div>

        <Image src={hero} alt="Hero Image" className="hero-image" />
      </main>
    </>
  );
};

export default HeroSection;
