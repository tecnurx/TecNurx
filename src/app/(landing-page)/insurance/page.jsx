import React from "react";
import "./insurance.css";
import Image from "next/image";
import point from "../../../assets/images/point.svg";
import save from "../../../assets/images/save.svg";
import Footer from "@/components/footer/Footer";

const Insurance = () => {
  const insurancePlans = [
    {
      id: 1,
      plan: "Compact",
      desc: "Best for mid-range phones & gadgets",
      price: "19,999",
      bullet: [
        "Covers damages up to ₦xxxxx",
        "Covers accidental damage",
        "Fast, local repair service",
        "One device covered per plan",
      ],
    },
    {
      id: 2,
      plan: "Plus",
      desc: "Best for smartphones, watches, and tablets",
      price: "39,999",
      bullet: [
        "Covers damages up to ₦xxxxx",
        "Covers accidental damage & theft",
        "Expedited service and express delivery",
        "Two devices covered per plan",
      ],
    },
    {
      id: 3,
      plan: "Premium",
      desc: "Best for laptops, computers, and cameras",
      price: "59,999",
      bullet: [
        "Covers damages up to ₦xxxxx",
        "Covers accidental damage, theft & loss",
        "Full device replacement coverage",
        "24/7 priority support",
      ],
    },
  ];
  return (
    <div>
      <div className="section-wrap">
        <div className="header">
          <h1>
            <span>Insure</span> your gadget
          </h1>
          <p>
            Get the peace of mind you deserve with flexible insurance plans that
            fit your budget
          </p>
        </div>
        <div className="switch-wrap">
          <h3>Monthly</h3>
          <label className="switch">
            <input type="checkbox" />
            <span className="slider round"></span>
          </label>
          <h3>Yearly</h3>
          <Image className="save15" src={save} alt="alt" />
        </div>
        <div className="insurance-plans">
          {insurancePlans.map((plan) => (
            <div className="plan" key={plan.id}>
              <div className="plan-head-wrap">
                <div className="plan-head">
                  <h2>{plan.plan}</h2>
                  <p>{plan.desc}</p>
                </div>
              </div>
              <h1 className="price">
                <span>₦</span>
                {plan.price}
                <span>/month</span>
              </h1>
              <div className="bullets">
                {plan.bullet.map((item, index) => (
                  <h4 key={index}>
                    <Image src={point} alt="bullet" /> {item}
                  </h4>
                ))}
              </div>
              <div className="plan-start">
                <button>
                  Get started with <span>{plan.plan}</span>
                </button>
                <p>Switch or cancel plan at anytime</p>
              </div>
            </div>
          ))}
        </div>
      </div>
       <Footer />
    </div>
  );
};

export default Insurance;
