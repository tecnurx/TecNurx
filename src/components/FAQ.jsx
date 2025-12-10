"use client";
import { Minus, Plus } from "lucide-react";
import React, { useState } from "react";

const FAQ = () => {
  const [openId, setOpenId] = useState(null);

  const handleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  const faquestions = [
    {
      id: 1,
      question: "What is TecNurx?",
      answer:
        "TecNurx is a technology-enabled platform providing structured gadget repair, protection, and logistics services. We integrate professional repair expertise, flexible payments, and real-time tracking into a single, seamless experience.",
    },
    {
      id: 2,
      question: "How does the repair process work?",
      answer:
        " Customers initiate a repair via our website. Upon confirmation, TecNurx coordinates device pickup, assigns a certified repair expert, manages the repair process, and returns the device all with transparent status updates.",
    },
    {
      id: 3,
      question: "How does TecNurx ensure quality and security?",
      answer:
        " All repairs are carried out by vetted professionals following standardized quality checks. Devices are tracked end-to-end, ensuring accountability and security throughout the service cycle.",
    },
    {
      id: 4,
      question: "What is the typical repair timeline?",
      answer:
        " Timelines vary by device and issue. However, most standard repairs are completed within 24 to 72 hours. Customers receive real-time updates at each stage.",
    },
    {
      id: 5,
      question: "What payment options are available?",
      answer:
        "TecNurx offers flexible payment structures, including upfront payments, subscriptions, and installment plans through financial partners.",
    },
    {
      id: 6,
      question: "Do you offer device protection and insurance?",
      answer:
        "Yes. TecNurx provides device insurance plans designed to reduce unexpected repair costs and provide long-term device protection.",
    },
    {
      id: 7,
      question: "Can TecNurx support corporate and enterprise clients?",
      answer:
        "Absolutely. We offer dedicated solutions for businesses, including centralized dashboards, bulk device management, reporting, and service-level support.",
    },
    {
      id: 8,
      question: "What markets does TecNurx operate in?",
      answer:
        "TecNurx is launching in Nigeria, with a roadmap to expand across key African markets as we scale partnerships and operations.",
    },
  ];

  return (
    <div className="faq-wrap">
      <div className="faq-header">
        <div className="faq-top">
          <span>FAQs</span>
        </div>
        <h1>
          Answers <i>to your</i> <span>questions</span>
        </h1>
      </div>

      <div className="faq-questions">
        {faquestions.map((faq) => (
          <div
            className={`faq ${openId === faq.id ? "open" : ""}`}
            key={faq.id}
            onClick={() => handleFaq(faq.id)}
          >
            <div className="faq-question">
              <p>{faq.question}</p>
              {openId === faq.id ? (
                <Minus size={20} color="#9098a2" />
              ) : (
                <Plus size={20} color="#9098a2" />
              )}
            </div>

            {openId === faq.id && <p className="faq-answer">{faq.answer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
