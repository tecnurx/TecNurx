"use client";

import React, { useRef, useState, useEffect } from "react";
import quote from "@/assets/images/quote.svg";
import testi from "@/assets/images/testi.svg";
import Image from "next/image";
import "./swiper.css";
import { CircleUser } from "lucide-react";

const SwiperCard = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const marqueeRef = useRef(null);
  const resumeTimeoutRef = useRef(null);

  const testimonials = [
    {
      id: 1,
      text: "Outstanding customer support! They went above and beyond to help me resolve my issue. I felt valued as a customer, and their commitment to ensuring my satisfaction left a lasting impression.",
      title: "Outstanding customer support!",
      name: "Ifeanyi Eze",
      designation: "Dog Trainer",
      avatar: testi,
    },
    {
      id: 2,
      text: "TecNurx delivered exactly what they promised. From structured pickup to transparent progress updates and timely delivery, the process was efficient and reliable. This is how modern service platforms should operate.",
      title: "A seamless, end-to-end experience.",
      name: "Ayo O.",
      designation: "Senior Consultant, Lagos",
    },
    {
      id: 3,
      text: "What stood out was the visibility. Knowing where my device was at every stage created a high level of confidence. TecNurx has clearly built trust into its operating model.",
      title: "Clarity, accountability, and trust.",
      name: "Halima S.",
      designation: "Operations Lead, Abuja",
    },
    {
      id: 4,
      text: "When my laptop failed during a critical work period, TecNurx handled everything with minimal disruption. The experience was efficient, well-communicated, and professional.",
      title: "Designed for professionals who value time.",
      name: "Daniel K.",
      designation: "Product Manager",
    },
    {
      id: 5,
      text: "TecNurx combines qualified technical experts with clear communication and defined processes. The service reflects strong operational discipline.",
      title: "Consistent quality and responsible execution",
      name: "Uche M.",
      designation: "Founder & CEO",
    },
    {
      id: 6,
      text: "The installment option allowed me to move forward immediately while maintaining financial flexibility. It’s a thoughtful approach that reflects deep market understanding.",
      title: "Flexible payments without compromising service quality.",
      name: "Sadiq A.",
      designation: "Finance Professional",
    },
    {
      id: 7,
      text: "Managing repairs across multiple devices used to be fragmented. TecNurx brought structure, reporting, and accountability into one platform highly valuable for business operations.",
      title: "A scalable solution for business device management.",
      name: "Zainab R.",
      designation: "Head of Operations",
    },
  ];

  // Duplicate exactly once for seamless desktop marquee loop
  const duplicatedTestimonials = [
    ...testimonials,
    ...testimonials,
  ];

  // Auto-move on mobile: smoothly advance to the next card every 3.5s
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      if (!marqueeRef.current) return;
      // Only auto-advance on mobile screens (where CSS continuous animation is disabled)
      if (window.innerWidth <= 600) {
        setActiveIndex((prev) => {
          const next = (prev + 1) % testimonials.length;
          const el = marqueeRef.current;
          if (el) {
            const firstCard = el.querySelector(".swiper-card");
            if (firstCard) {
              const cardWidth = firstCard.offsetWidth + 16;
              el.scrollTo({
                left: next * cardWidth,
                behavior: "smooth",
              });
            }
          }
          return next;
        });
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, testimonials.length]);

  const handleScroll = () => {
    if (!marqueeRef.current) return;
    const el = marqueeRef.current;
    const firstCard = el.querySelector(".swiper-card");
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth + 16;
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(0, index), testimonials.length - 1));
  };

  const scrollToCard = (index) => {
    if (!marqueeRef.current) return;
    const el = marqueeRef.current;
    const firstCard = el.querySelector(".swiper-card");
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth + 16;
    el.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  const handleUserInteractionStart = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    setIsPaused(true);
  };

  const handleUserInteractionEnd = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2500);
  };

  return (
    <section className="marquee-wrap">
      <div
        className="marquee"
        ref={marqueeRef}
        onScroll={handleScroll}
        onTouchStart={handleUserInteractionStart}
        onTouchEnd={handleUserInteractionEnd}
        onMouseEnter={handleUserInteractionStart}
        onMouseLeave={handleUserInteractionEnd}
      >
        <div className="marquee-track">
          {duplicatedTestimonials.map((item, index) => (
            <div
              className={`swiper-card ${
                index >= testimonials.length ? "desktop-only-card" : ""
              }`}
              key={`${item.id}-${index}`}
            >
              <Image src={quote} alt="Quote" className="quote" />

              <div className="stext-wrap">
                <p>{item.text}</p>
              </div>

              <div className="card-details">
                {item.avatar ? (
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="author-avatar"
                  />
                ) : (
                  <CircleUser size={48} color="#bdbdbd" className="author-avatar-icon" />
                )}
                <div>
                  <h3>{item.name}</h3>
                  <span>{item.designation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="testimonial-dots" aria-hidden="true">
        {testimonials.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`testimonial-dot ${activeIndex === i ? "active" : ""}`}
            onClick={() => {
              handleUserInteractionStart();
              scrollToCard(i);
              handleUserInteractionEnd();
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default SwiperCard;
