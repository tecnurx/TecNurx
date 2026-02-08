"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import hero from "@/assets/images/hero.png";
import rate from "@/assets/images/rate.svg";
import "@/app/home.css";
import Link from "next/link";

const numberStat = [
  { id: 1, end: 2000, suffix: "+", title: "Successful Repairs" },
  { id: 2, end: 24, suffix: " Hrs", title: "Repair Time" },
  { id: 3, end: 10, suffix: "x", title: "Response Rate" },
  { id: 4, end: 20, suffix: "+", title: "Tech Partner Companies" },
];

function AnimatedNumber({ end, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quad for smoother feel
      const eased = 1 - (1 - progress) ** 4;

      const current = Math.floor(end * eased);
      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end); // ensure exact final value
      }
    };

    // Small delay so it starts after component is visible
    const timeout = setTimeout(() => {
      animationFrameId = requestAnimationFrame(animate);
    }, 300);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, [end, duration]);

  return (
    <>
      {count.toLocaleString()}
      {suffix}
    </>
  );
}

const HeroSection = () => {
  return (
    <main className="hero-section">
      <div className="hero-content">
        <div className="hero-texts">
          <Image src={rate} alt="Rating badge" priority />
          <h1>
            All your device needs, solved with{" "}
            <span>flexible payment plans</span>
          </h1>
          <p>
            Get professional repairs, protection plans, and new devices with
            free pickup and delivery
          </p>
          <div className="hero-btns">
            {/* <Link href="/login" className="btn-primary">
              Sign In
            </Link> */}
            <Link href="#GetQuote">
              Get Quote
            </Link>
          </div>
        </div>

        {/* Numbers */}
        <div className="numbers-wrap numbers-pc">
          {numberStat.map((stat) => (
            <div key={stat.id} className="stat-item">
              <h2 className="stat-value">
                <AnimatedNumber
                  end={stat.end}
                  suffix={stat.suffix}
                  duration={1800} // 1.8 seconds – feels nice
                />
              </h2>
              <h3>{stat.title}</h3>
            </div>
          ))}
        </div>
      </div>

      <Image
        src={hero}
        alt="Hero illustration – device repair service"
        className="hero-image"
        priority
      />

      {/* Numbers mobile */}
      <div className="numbers-wrap numbers-mobile">
        {numberStat.map((stat) => (
          <div key={stat.id} className="stat-item">
            <h2 className="stat-value">
              <AnimatedNumber
                end={stat.end}
                suffix={stat.suffix}
                duration={1800} // 1.8 seconds – feels nice
              />
            </h2>
            <h3>{stat.title}</h3>
          </div>
        ))}
      </div>
    </main>
  );
};

export default HeroSection;
