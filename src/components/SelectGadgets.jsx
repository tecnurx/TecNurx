"use client";
import React, { useState } from "react";
import phone from "@/assets/images/phone.svg";
import cam from "@/assets/images/cam.svg";
import desk from "@/assets/images/desk.svg";
import laptop from "@/assets/images/laptop.svg";
import "./gadget.css";
import Image from "next/image";

const SelectGadgets = ({ selectedOptions, setSelectedOptions }) => {

  const handleSelect = (name) => {
    setSelectedOptions(
      (prev) =>
        prev.includes(name)
          ? prev.filter((item) => item !== name) // unselect if already selected
          : [...prev, name] // add to selected list
    );
  };

  const gadgetOptions = [
    {
      id: 1,
      name: "Phone",
      icon: phone,
    },
    {
      id: 2,
      name: "Laptop",
      icon: laptop,
    },
    {
      id: 3,
      name: "Camera",
      icon: cam,
    },
    {
      id: 4,
      name: "Desktop",
      icon: desk,
    },
  ];

  return (
    <div>
      <div className="gadget-options">
        {gadgetOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(option.name)}
            className={`option-btn ${
              selectedOptions.includes(option.name) ? "active-option" : ""
            }`}
          >
            <Image src={option.icon} alt={option.name} />
            <span>{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectGadgets;
