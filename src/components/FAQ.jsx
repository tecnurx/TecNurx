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
      question: "Lorem ipsum dolor, sit amet consectetur adipisicing elit.",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia in molestias ullam nulla facilis aperiam a quo animi minima illum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia in molestias ullam nulla facilis aperiam a quo animi minima illum.",
    },
    {
      id: 2,
      question: "Lorem ipsum dolor, sit amet consectetur adipisicing elit.",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia in molestias ullam nulla facilis aperiam a quo animi minima illum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia in molestias ullam nulla facilis aperiam a quo animi minima illum.",
    },
    {
      id: 3,
      question: "Lorem ipsum dolor, sit amet consectetur adipisicing elit.",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia in molestias ullam nulla facilis aperiam a quo animi minima illum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia in molestias ullam nulla facilis aperiam a quo animi minima illum.",
    },
    {
      id: 4,
      question: "Lorem ipsum dolor, sit amet consectetur adipisicing elit.",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia in molestias ullam nulla facilis aperiam a quo animi minima illum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia in molestias ullam nulla facilis aperiam a quo animi minima illum.",
    },
    {
      id: 5,
      question: "Lorem ipsum dolor, sit amet consectetur adipisicing elit.",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia in molestias ullam nulla facilis aperiam a quo animi minima illum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia in molestias ullam nulla facilis aperiam a quo animi minima illum.",
    },
    {
      id: 6,
      question: "Lorem ipsum dolor, sit amet consectetur adipisicing elit.",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia in molestias ullam nulla facilis aperiam a quo animi minima illum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia in molestias ullam nulla facilis aperiam a quo animi minima illum.",
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
