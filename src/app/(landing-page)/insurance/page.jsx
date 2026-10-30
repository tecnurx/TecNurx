"use client";
import React, { useState, useEffect, useRef } from "react";
import "./insurance.css";
import Image from "next/image";
import point from "@/assets/images/point.svg";
import save from "@/assets/images/save.svg";
import Footer from "@/components/footer/Footer";
import Link from "next/link";

const Insurance = () => {
  const [isYearly, setIsYearly] = useState(false);

  // Wizard State - starts empty before user selects device type
  const [step, setStep] = useState(1);
  const [deviceType, setDeviceType] = useState("");
  const [brand, setBrand] = useState("Apple");
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelInput, setCustomModelInput] = useState("");

  const brandDropdownRef = useRef(null);

  // Step 2 State
  const [acquisition, setAcquisition] = useState("uk-used");
  const [conditionTag, setConditionTag] = useState("UK used");
  const [damageStatus, setDamageStatus] = useState("None");

  // Step 3 State
  const [coverages, setCoverages] = useState([
    "Accidental damage",
    "Theft",
  ]);

  // Click outside listener for brand dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target)
      ) {
        setIsBrandDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Models catalog strictly categorized by Device Type AND Brand
  const modelsCatalog = {
    Phone: {
      Apple: [
        "iPhone 13",
        "iPhone 13 mini",
        "iPhone 13 Pro",
        "iPhone 13 Pro Max",
        "iPhone 14",
        "iPhone 14 Plus",
        "iPhone 14 Pro",
        "iPhone 14 Pro Max",
        "iPhone 15",
        "iPhone 15 Plus",
        "iPhone 15 Pro",
        "iPhone 15 Pro Max",
        "iPhone 16",
        "iPhone 16 Plus",
        "iPhone 16 Pro",
        "iPhone 16 Pro Max",
        "iPhone 12",
        "iPhone 12 Pro",
        "iPhone 11",
      ],
      Samsung: [
        "Galaxy S24 Ultra",
        "Galaxy S24+",
        "Galaxy S24",
        "Galaxy S23 Ultra",
        "Galaxy S23+",
        "Galaxy S23",
        "Galaxy Z Fold 5",
        "Galaxy Z Flip 5",
        "Galaxy Z Fold 6",
        "Galaxy Z Flip 6",
        "Galaxy A55 5G",
        "Galaxy A54 5G",
        "Galaxy A35 5G",
        "Galaxy S22 Ultra",
      ],
      Google: [
        "Pixel 9 Pro XL",
        "Pixel 9 Pro",
        "Pixel 9",
        "Pixel 8 Pro",
        "Pixel 8",
        "Pixel 8a",
        "Pixel 7 Pro",
        "Pixel 7",
        "Pixel 7a",
        "Pixel Fold",
      ],
      Xiaomi: [
        "Xiaomi 14 Ultra",
        "Xiaomi 14",
        "Xiaomi 13 Pro",
        "Redmi Note 13 Pro+",
        "Redmi Note 13",
        "POCO X6 Pro",
        "POCO F6 Pro",
      ],
      Tecno: [
        "Camon 30 Premier",
        "Camon 30 Pro",
        "Camon 30",
        "Phantom V Fold 2",
        "Phantom V Flip",
        "Spark 20 Pro+",
        "Spark 20",
      ],
      Infinix: [
        "Zero 30 5G",
        "Note 40 Pro+ 5G",
        "Note 40 Pro",
        "Note 30",
        "Hot 40 Pro",
        "GT 20 Pro",
      ],
      Other: [
        "Other Smartphone",
        "Nothing Phone (2)",
        "OnePlus 12",
        "Oppo Find X7",
        "Vivo X100 Pro",
      ],
    },
    Tablet: {
      Apple: [
        "iPad Pro 13-inch (M4)",
        "iPad Pro 11-inch (M4)",
        "iPad Pro 12.9-inch",
        "iPad Pro 11-inch",
        "iPad Air 13-inch (M2)",
        "iPad Air 11-inch (M2)",
        "iPad Air (5th Gen)",
        "iPad mini (6th Gen)",
        "iPad (10th Gen)",
        "iPad (9th Gen)",
      ],
      Samsung: [
        "Galaxy Tab S9 Ultra",
        "Galaxy Tab S9+",
        "Galaxy Tab S9",
        "Galaxy Tab S9 FE",
        "Galaxy Tab S8 Ultra",
        "Galaxy Tab A9+",
      ],
      Lenovo: [
        "Tab P12 Pro",
        "Tab P11 Pro",
        "Tab M11",
        "Yoga Tab 13",
      ],
      Microsoft: [
        "Surface Pro 10",
        "Surface Pro 9",
        "Surface Pro 8",
        "Surface Go 4",
        "Surface Go 3",
      ],
      Other: [
        "Other Tablet",
        "Xiaomi Pad 6",
        "OnePlus Pad",
        "Huawei MatePad",
      ],
    },
    Laptop: {
      Apple: [
        "MacBook Pro 16-inch (M3)",
        "MacBook Pro 14-inch (M3)",
        "MacBook Pro 16-inch (M2/M1)",
        "MacBook Pro 14-inch (M2/M1)",
        "MacBook Air 15-inch (M3/M2)",
        "MacBook Air 13-inch (M3/M2)",
        "MacBook Air (M1)",
      ],
      Dell: [
        "XPS 16",
        "XPS 14",
        "XPS 13 Plus",
        "XPS 15 (9530)",
        "Alienware m16 R2",
        "Latitude 7440",
        "Inspiron 16 Plus",
      ],
      HP: [
        "Spectre x360 14",
        "Spectre x360 16",
        "Envy 16",
        "Envy x360",
        "Pavilion Plus 14",
        "OMEN Transcend 16",
        "EliteBook 840 G10",
      ],
      Lenovo: [
        "ThinkPad X1 Carbon Gen 12",
        "ThinkPad T14s Gen 5",
        "Legion Pro 7i",
        "Yoga 9i Dual Screen",
        "IdeaPad Pro 5",
      ],
      Asus: [
        "ROG Zephyrus G16",
        "ROG Zephyrus G14",
        "Zenbook 14 OLED",
        "Zenbook Duo",
        "Vivobook Pro 15",
      ],
      Other: [
        "Other Laptop",
        "Acer Swift Go",
        "Razer Blade 16",
        "Microsoft Surface Laptop 6",
      ],
    },
    Camera: {
      Canon: [
        "EOS R5 Mark II",
        "EOS R5",
        "EOS R6 Mark II",
        "EOS R8",
        "EOS 90D",
        "EOS Rebel T7",
      ],
      Sony: [
        "Alpha a7 IV",
        "Alpha a7R V",
        "Alpha a7S III",
        "Alpha a6700",
        "FX3",
        "ZV-E10 II",
      ],
      Nikon: [
        "Z8",
        "Z6 III",
        "Zf",
        "Z50",
        "D850",
      ],
      Fujifilm: [
        "X100VI",
        "X-T5",
        "X-S20",
        "X-H2S",
        "GFX 100 II",
      ],
      Other: [
        "Other Camera",
        "Panasonic Lumix S5 II",
        "GoPro HERO12 Black",
        "Insta360 X4",
      ],
    },
    Other: {
      Apple: [
        "Apple Watch Ultra 2",
        "Apple Watch Series 9",
        "Apple Watch SE",
        "AirPods Max",
        "Apple TV 4K",
      ],
      Samsung: [
        "Galaxy Watch 6 Classic",
        "Galaxy Watch 6",
        "Galaxy Watch FE",
        "Galaxy Buds2 Pro",
      ],
      Sony: [
        "PlayStation 5 Slim",
        "PlayStation Portal",
        "WH-1000XM5",
        "WF-1000XM5",
      ],
      DJI: [
        "Mini 4 Pro",
        "Air 3",
        "Mavic 3 Pro",
        "Osmo Pocket 3",
      ],
      Other: [
        "Smartwatch",
        "Gaming Console",
        "Drone",
        "Headphones / Audio Gear",
      ],
    },
  };

  const deviceTypes = ["Phone", "Tablet", "Laptop", "Camera", "Other"];

  // Available brands for the currently selected device type
  const availableBrands = Object.keys(
    modelsCatalog[deviceType] || modelsCatalog.Phone
  );

  const handleDeviceTypeChange = (type) => {
    setDeviceType(type);
    const brandsForType = Object.keys(modelsCatalog[type] || {});
    const defaultBrand = brandsForType[0] || "Apple";
    setBrand(defaultBrand);
    setModelSearch("");
    setSelectedModel("");
    setIsCustomModel(false);
    setIsBrandDropdownOpen(false);
  };

  const handleBrandChange = (b) => {
    setBrand(b);
    setModelSearch("");
    setSelectedModel("");
    setIsCustomModel(false);
    setIsBrandDropdownOpen(false);
  };

  // Narrow model search strictly to the active Device Type AND Brand
  const deviceTypeModels =
    (modelsCatalog[deviceType] || modelsCatalog.Phone)[brand] || [];

  const filteredModels = deviceTypeModels.filter((m) =>
    m.toLowerCase().includes((modelSearch || "").toLowerCase())
  );

  const handleSelectModel = (m) => {
    setSelectedModel(m);
    setModelSearch(m);
    setIsCustomModel(false);
    setStep(2);
  };

  const toggleCoverage = (item) => {
    if (coverages.includes(item)) {
      setCoverages(coverages.filter((c) => c !== item));
    } else {
      setCoverages([...coverages, item]);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setDeviceType("");
    setBrand("Apple");
    setModelSearch("");
    setSelectedModel("");
    setIsCustomModel(false);
    setCustomModelInput("");
    setIsBrandDropdownOpen(false);
    setAcquisition("uk-used");
    setConditionTag("UK used");
    setDamageStatus("None");
    setCoverages(["Accidental damage", "Theft"]);
  };

  const scrollToPlan = (planName) => {
    const el = document.getElementById(`plan-${planName.toLowerCase()}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("plan-highlight-pulse");
      setTimeout(() => el.classList.remove("plan-highlight-pulse"), 2500);
    }
  };

  // Determine matched plan based on selections
  const getMatchedPlan = () => {
    if (damageStatus === "Cracked screen or other damage") {
      return null;
    }
    const hasTheft = coverages.includes("Theft") || coverages.includes("Loss");
    if (
      deviceType === "Laptop" ||
      deviceType === "Camera" ||
      (selectedModel && selectedModel.toLowerCase().includes("macbook"))
    ) {
      return "Premium";
    }
    if (hasTheft || deviceType === "Tablet") {
      return "Plus";
    }
    return "Compact";
  };

  const currentMatchedPlan = getMatchedPlan();

  const getCoverageSummaryText = () => {
    if (coverages.length === 0) return "Basic coverage";
    if (
      coverages.includes("Accidental damage") &&
      coverages.includes("Theft") &&
      coverages.length === 2
    ) {
      return "Damage and Theft";
    }
    if (coverages.length > 2) {
      return `${coverages[0]}, ${coverages[1]} +${coverages.length - 2}`;
    }
    return coverages.join(" and ");
  };

  const insurancePlans = [
    {
      id: 1,
      plan: "Compact",
      desc: "Best for mid-range phones & gadgets",
      monthlyPrice: "19,999",
      yearlyPrice: "16,999",
      yearlyTotal: "203,990",
      bullet: [
        "Covers damages up to ₦xxxxx",
        "Covers accidental damage",
        "Fast, local repair service",
        "One device covered per plan",
      ],
      whyPoints: [
        "It covers everyday mid-range phones & gadgets.",
        "Covers essential accidental drops and screen repairs.",
        "Most affordable coverage with fast local turnaround.",
      ],
    },
    {
      id: 2,
      plan: "Plus",
      badge: "Best value",
      desc: "Best for smartphones, watches, and tablets",
      monthlyPrice: "39,999",
      yearlyPrice: "33,999",
      yearlyTotal: "407,990",
      bullet: [
        "Covers damages up to ₦xxxxx",
        "Covers accidental damage & theft",
        "Expedited service and express delivery",
        "Two devices covered per plan",
      ],
      whyPoints: [
        "It covers smartphones.",
        "It includes theft cover, which Compact does not.",
        "It covers your one device, with room for a second.",
      ],
    },
    {
      id: 3,
      plan: "Premium",
      desc: "Best for laptops, computers, and cameras",
      monthlyPrice: "59,999",
      yearlyPrice: "50,999",
      yearlyTotal: "611,990",
      bullet: [
        "Covers damages up to ₦xxxxx",
        "Covers accidental damage, theft & loss",
        "Full device replacement coverage",
        "24/7 priority support",
      ],
      whyPoints: [
        "Covers laptops, professional cameras and high-end gear.",
        "Includes full theft and complete loss replacement.",
        "24/7 dedicated VIP priority dispatch and repairs.",
      ],
    },
  ];

  const matchedPlanDetails =
    insurancePlans.find((p) => p.plan === currentMatchedPlan) ||
    insurancePlans[1];

  const hasStarted = deviceType !== "" || step > 1;

  // Placeholder for model search input based on brand
  const getModelPlaceholder = () => {
    if (brand === "Apple") return "iPhone 13";
    if (brand === "Samsung") return "Galaxy S24";
    if (brand === "Google") return "Pixel 8";
    if (brand === "Dell") return "XPS 15";
    if (brand === "HP") return "Spectre x360";
    if (brand === "Canon") return "EOS R5";
    if (brand === "Sony") return "Alpha a7 IV";
    return "Enter device model";
  };

  return (
    <div className="insurance-page-root">
      <div className="insure-contain">
        <div className="section-wrapp">
          {/* Top Header */}
          <div className="header">
            <h1>
              <span>Insure</span> your gadget
            </h1>
            <p>
              Get the peace of mind you deserve with flexible insurance plans
              that fit your budget
            </p>
          </div>

          {/* Find the right plan interactive wizard container */}
          <div className="find-plan-section">
            <div className="find-plan-top">
              {/* Left Column */}
              <div className="find-plan-left">
                <h2>
                  Find the right <span className="plan-badge">plan</span> for
                  your gadget
                </h2>
                <p className="find-plan-desc">
                  Answer a few quick questions and we will match you to a plan.
                </p>
                <ul className="find-plan-features">
                  <li>
                    <span className="green-bullet"></span>
                    Four quick steps
                  </li>
                  <li>
                    <span className="green-bullet"></span>
                    No sign-up needed to see your match
                  </li>
                  <li>
                    <span className="green-bullet"></span>
                    Change your answers any time
                  </li>
                </ul>
              </div>

              {/* Right Column: Step Wizard Card */}
              <div className="find-plan-wizard-card">
                <div className="wizard-card-top-bar">
                  <div className="wizard-steps-header">
                    <span
                      className={`step-tab ${step === 1 ? "active" : ""}`}
                      onClick={() => setStep(1)}
                    >
                      1. Device
                    </span>
                    <span
                      className={`step-tab ${step === 2 ? "active" : ""}`}
                      onClick={() => selectedModel && setStep(2)}
                    >
                      2. Details
                    </span>
                    <span
                      className={`step-tab ${step === 3 ? "active" : ""}`}
                      onClick={() =>
                        selectedModel &&
                        damageStatus !== "Cracked screen or other damage" &&
                        setStep(3)
                      }
                    >
                      3. Cover
                    </span>
                    <span
                      className={`step-tab ${step === 4 ? "active" : ""}`}
                      onClick={() =>
                        selectedModel &&
                        damageStatus !== "Cracked screen or other damage" &&
                        setStep(4)
                      }
                    >
                      4. Match
                    </span>
                  </div>

                  {/* Reset button only appears once a user starts making selections */}
                  {hasStarted && (
                    <button
                      type="button"
                      className="wizard-reset-btn"
                      onClick={resetWizard}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="reset-icon-svg"
                      >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                      <span className="reset-text">Reset</span>
                    </button>
                  )}
                </div>

                {/* Wizard Body Steps */}
                <div className="wizard-body">
                  {/* STEP 1: DEVICE */}
                  {step === 1 && (
                    <div className="wizard-step-anim">
                      <span className="wizard-label">DEVICE TYPE</span>
                      <div className="device-pills">
                        {deviceTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            className={`pill-btn ${
                              deviceType === type ? "selected" : ""
                            }`}
                            onClick={() => handleDeviceTypeChange(type)}
                          >
                            {type}
                          </button>
                        ))}
                      </div>

                      {/* Before selecting a device type: show helper text only */}
                      {!deviceType ? (
                        <p className="wizard-helper-text">
                          Brand and model appear after you choose a device type.
                        </p>
                      ) : (
                        /* After selecting a device type: Brand & Model inputs appear */
                        <div className="wizard-expanded-step">
                          {/* Brand dropdown styled identical to search dropdown */}
                          <div className="wizard-form-group">
                            <span className="wizard-label">BRAND</span>
                            <div
                              className="custom-dropdown-wrapper"
                              ref={brandDropdownRef}
                            >
                              <button
                                type="button"
                                className={`custom-dropdown-trigger ${
                                  isBrandDropdownOpen ? "open" : ""
                                }`}
                                onClick={() =>
                                  setIsBrandDropdownOpen(!isBrandDropdownOpen)
                                }
                              >
                                <span>{brand}</span>
                                <svg
                                  className={`select-chevron-svg ${
                                    isBrandDropdownOpen ? "rotated" : ""
                                  }`}
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#080808"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </button>

                              {isBrandDropdownOpen && (
                                <div className="custom-dropdown-options-box">
                                  {availableBrands.map((b) => (
                                    <button
                                      key={b}
                                      type="button"
                                      className={`custom-dropdown-option ${
                                        brand === b ? "selected" : ""
                                      }`}
                                      onClick={() => handleBrandChange(b)}
                                    >
                                      <span>{b}</span>
                                      {brand === b && (
                                        <span className="option-check">✓</span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Model Search narrowed to selected Brand */}
                          <div className="wizard-form-group">
                            <span className="wizard-label">MODEL</span>
                            <div className="model-input-wrapper">
                              <svg
                                className="search-icon-svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#080808"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="11" cy="11" r="7" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                              </svg>
                              <input
                                type="text"
                                className="model-search-input"
                                placeholder={getModelPlaceholder()}
                                value={modelSearch}
                                onChange={(e) => {
                                  setModelSearch(e.target.value);
                                  setIsCustomModel(false);
                                }}
                              />
                            </div>

                            {/* Dropdown list ONLY appears when user types to search */}
                            {modelSearch.trim().length > 0 && !selectedModel && (
                              <div className="model-dropdown-list">
                                {filteredModels.length > 0 ? (
                                  filteredModels.slice(0, 4).map((m) => (
                                    <button
                                      key={m}
                                      type="button"
                                      className="model-dropdown-item"
                                      onClick={() => handleSelectModel(m)}
                                    >
                                      {m}
                                    </button>
                                  ))
                                ) : (
                                  <div className="model-dropdown-empty">
                                    No {brand} {deviceType?.toLowerCase()} match for "{modelSearch}"
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 'My model isn't listed' sits OUTSIDE the dropdown */}
                            <button
                              type="button"
                              className="my-model-not-listed-link"
                              onClick={() => {
                                setIsCustomModel(!isCustomModel);
                              }}
                            >
                              My model isn't listed
                            </button>

                            {isCustomModel && (
                              <div className="custom-model-box">
                                <input
                                  type="text"
                                  placeholder={`Enter your ${brand} model`}
                                  className="model-search-input custom-model-input"
                                  value={customModelInput}
                                  onChange={(e) =>
                                    setCustomModelInput(e.target.value)
                                  }
                                />
                                <button
                                  type="button"
                                  className="continue-yellow-btn custom-model-btn"
                                  disabled={!customModelInput.trim()}
                                  onClick={() =>
                                    handleSelectModel(customModelInput.trim())
                                  }
                                >
                                  Continue
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 2: DETAILS */}
                  {step === 2 && (
                    <div className="wizard-step-anim">
                      <span className="wizard-label">DEVICE</span>
                      <div className="selected-tags-row">
                        <span className="tag-pill">
                          {brand} · {selectedModel || "Device"}
                        </span>
                      </div>

                      <div className="wizard-form-group">
                        <span className="wizard-label">
                          HOW DID YOU GET THE DEVICE?
                        </span>
                        <div className="device-origin-cards">
                          {[
                            {
                              id: "new",
                              tag: "Brand new",
                              title: "New, with a manufacturer warranty",
                              desc: "Bought new from a store or brand",
                            },
                            {
                              id: "uk-used",
                              tag: "UK used",
                              title: "UK used (imported)",
                              desc: "No manufacturer warranty in Nigeria",
                            },
                            {
                              id: "used-ng",
                              tag: "Used in Nigeria",
                              title: "Used in Nigeria",
                              desc: "Second-hand, bought locally",
                            },
                          ].map((item) => (
                            <div
                              key={item.id}
                              className={`origin-radio-card ${
                                acquisition === item.id ? "selected" : ""
                              }`}
                              onClick={() => {
                                setAcquisition(item.id);
                                setConditionTag(item.tag);
                              }}
                            >
                              <div className="radio-circle">
                                {acquisition === item.id && (
                                  <div className="radio-dot" />
                                )}
                              </div>
                              <div className="radio-content">
                                <h4>{item.title}</h4>
                                <p>{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div
                        className="wizard-form-group"
                        style={{ marginTop: 18 }}
                      >
                        <span className="wizard-label">ANY EXISTING DAMAGE?</span>
                        <div className="device-pills">
                          <button
                            type="button"
                            className={`pill-btn ${
                              damageStatus === "None" ? "selected" : ""
                            }`}
                            onClick={() => setDamageStatus("None")}
                          >
                            None
                          </button>
                          <button
                            type="button"
                            className={`pill-btn ${
                              damageStatus === "Minor marks and scratches"
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              setDamageStatus("Minor marks and scratches")
                            }
                          >
                            Minor marks and scratches
                          </button>
                          <button
                            type="button"
                            className={`pill-btn ${
                              damageStatus === "Cracked screen or other damage"
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              setDamageStatus("Cracked screen or other damage")
                            }
                          >
                            Cracked screen or other damage
                          </button>
                        </div>

                        {damageStatus === "Cracked screen or other damage" && (
                          <p className="wizard-damage-notice">
                            <span className="info-icon">ⓘ</span> Devices with
                            existing damage can't be covered.
                          </p>
                        )}
                      </div>

                      {damageStatus !== "Cracked screen or other damage" && (
                        <button
                          type="button"
                          className="continue-yellow-btn"
                          onClick={() => setStep(3)}
                        >
                          Continue
                        </button>
                      )}
                    </div>
                  )}

                  {/* STEP 3: COVER */}
                  {step === 3 && (
                    <div className="wizard-step-anim">
                      <div className="selected-tags-row">
                        <span className="tag-pill">
                          {brand} · {selectedModel || "Device"}
                        </span>
                        <span className="tag-pill">{conditionTag}</span>
                        <span className="tag-pill">
                          {damageStatus === "None"
                            ? "No existing damage"
                            : damageStatus}
                        </span>
                      </div>

                      <div className="wizard-form-group">
                        <span className="wizard-label">
                          WHAT DO YOU WANT COVERED? CHOOSE ALL THAT APPLY
                        </span>
                        <div className="device-pills">
                          {[
                            "Accidental damage",
                            "Theft",
                            "Loss",
                            "Liquid damage",
                          ].map((cov) => (
                            <button
                              key={cov}
                              type="button"
                              className={`pill-btn ${
                                coverages.includes(cov) ? "selected" : ""
                              }`}
                              onClick={() => toggleCoverage(cov)}
                            >
                              {cov}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="continue-yellow-btn"
                        onClick={() => setStep(4)}
                      >
                        Continue
                      </button>
                    </div>
                  )}

                  {/* STEP 4: MATCH */}
                  {step === 4 && (
                    <div className="wizard-step-anim">
                      <div className="selected-tags-row">
                        <span className="tag-pill">
                          {brand} · {selectedModel || "Device"}
                        </span>
                        <span className="tag-pill">{conditionTag}</span>
                        <span className="tag-pill">
                          {damageStatus === "None"
                            ? "No existing damage"
                            : damageStatus}
                        </span>
                      </div>
                      <div
                        className="selected-tags-row"
                        style={{ marginTop: -8 }}
                      >
                        <span className="tag-pill">
                          {getCoverageSummaryText()}
                        </span>
                      </div>

                      <p className="matched-answers-text">
                        <span className="info-icon">ⓘ</span> We matched your
                        answers to the plan below.
                      </p>

                      <button
                        type="button"
                        className="change-answers-link"
                        onClick={() => setStep(1)}
                      >
                        Change my answers
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Card: YOUR MATCHED PLAN / ALERT */}
            <div className="matched-plan-card">
              {damageStatus === "Cracked screen or other damage" ? (
                /* Edge Case: Damaged Device Banner */
                <div className="damaged-device-alert">
                  <div className="alert-circle-icon">ⓘ</div>
                  <div className="alert-content">
                    <h3>We can't cover a damaged device yet</h3>
                    <p>
                      Get it repaired first, then come back and we will match
                      you to a plan.
                    </p>
                    <div className="alert-actions">
                      <Link
                        href="/dashboard/book-repair"
                        className="repair-estimate-btn"
                      >
                        Get a <span>repair estimate</span>
                      </Link>
                      <button
                        type="button"
                        className="see-plans-link"
                        onClick={() => {
                          const el = document.querySelector(".insurance-plans");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        See what each plan covers
                      </button>
                    </div>
                  </div>
                </div>
              ) : step < 4 ? (
                /* Initial / In-progress: Skeletons */
                <div>
                  <span className="matched-plan-header">YOUR MATCHED PLAN</span>
                  <div className="skeleton-grid">
                    <div className="skeleton-col">
                      <div className="skeleton-bar bar-1"></div>
                      <div className="skeleton-bar bar-2"></div>
                      <div className="skeleton-bar bar-3"></div>
                    </div>
                    <div className="skeleton-col">
                      <div className="skeleton-bar bar-1"></div>
                      <div className="skeleton-bar bar-2"></div>
                      <div className="skeleton-bar bar-3"></div>
                    </div>
                  </div>
                  <p className="matched-plan-hint">
                    Your recommended plan appears here once you have answered the
                    questions.
                  </p>
                </div>
              ) : (
                /* Step 4: Matched Plan Full Card */
                <div className="matched-plan-full-view">
                  <div className="matched-full-header">
                    <div className="matched-title-col">
                      <span className="best-match-pill">Best match</span>
                      <h2 className="matched-plan-name">
                        {matchedPlanDetails.plan}
                      </h2>
                      <p className="matched-plan-subdesc">
                        {matchedPlanDetails.desc}
                      </p>
                    </div>
                    <div className="matched-device-label">
                      Matched for your {selectedModel || "device"}
                    </div>
                  </div>

                  <div className="matched-full-body">
                    {/* Left Column: Price, Switch, CTA */}
                    <div className="matched-pricing-col">
                      <div className="matched-price-row">
                        <span className="matched-currency">₦</span>
                        <span className="matched-amount">
                          {isYearly
                            ? matchedPlanDetails.yearlyPrice
                            : matchedPlanDetails.monthlyPrice}
                        </span>
                        <span className="matched-period">/month</span>
                      </div>

                      <div className="matched-switch-row">
                        <div className="matched-pill-toggle">
                          <button
                            type="button"
                            className={`matched-toggle-btn ${
                              !isYearly ? "active" : ""
                            }`}
                            onClick={() => setIsYearly(false)}
                          >
                            Monthly
                          </button>
                          <button
                            type="button"
                            className={`matched-toggle-btn ${
                              isYearly ? "active" : ""
                            }`}
                            onClick={() => setIsYearly(true)}
                          >
                            Yearly
                          </button>
                        </div>
                        <span className="matched-save-badge">Save 15%</span>
                      </div>

                      <button
                        type="button"
                        className="matched-cta-btn"
                        onClick={() => scrollToPlan(matchedPlanDetails.plan)}
                      >
                        Get started with <span>{matchedPlanDetails.plan}</span>
                      </button>

                      <button
                        type="button"
                        className="compare-all-plans-link"
                        onClick={() => {
                          const el = document.querySelector(".insurance-plans");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        Compare all plans
                      </button>
                    </div>

                    {/* Right Column: Included & Why This Plan */}
                    <div className="matched-benefits-col">
                      <div className="benefits-block">
                        <h4>What's included</h4>
                        <ul className="benefits-list">
                          {matchedPlanDetails.bullet.slice(1, 4).map((b, i) => (
                            <li key={i}>
                              <span className="benefit-dot"></span>
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="benefits-block">
                        <h4>Why this plan</h4>
                        <ul className="benefits-list">
                          {matchedPlanDetails.whyPoints.map((w, i) => (
                            <li key={i}>
                              <span className="benefit-dot"></span>
                              {w}
                            </li>
                          ))}
                        </ul>
                        <p className="imei-notice">
                          <span className="info-icon">ⓘ</span> We will check
                          your device's IMEI after you sign up.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Toggle for Bottom Cards */}
          <div className="switch-wrap">
            <h3>Monthly</h3>
            <label className="switch">
              <input
                type="checkbox"
                checked={isYearly}
                onChange={() => setIsYearly(!isYearly)}
                aria-label="Toggle annual pricing"
              />
              <span className="slider round"></span>
            </label>
            <h3>Yearly</h3>
            <Image className="save15" src={save} alt="Save 15%" />
          </div>

          {/* Pricing Cards */}
          <div className="insurance-plans">
            {insurancePlans.map((plan) => (
              <div
                className={`plan ${
                  currentMatchedPlan === plan.plan ? "plan-matched-card" : ""
                }`}
                key={plan.id}
                id={`plan-${plan.plan.toLowerCase()}`}
              >
                <div className="plan-head-wrap">
                  <div className="plan-head">
                    {plan.badge && (
                      <span className="best-value-badge">{plan.badge}</span>
                    )}
                    <h2>{plan.plan}</h2>
                    <p>{plan.desc}</p>
                  </div>
                </div>
                <h1 className="price">
                  <span>₦</span>
                  {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  <span>/month</span>
                </h1>
                {isYearly && (
                  <p className="yearly-billed-text">
                    Billed annually at ₦{plan.yearlyTotal}/yr
                  </p>
                )}
                <div className="bullets">
                  {plan.bullet.map((item, index) => (
                    <h4 key={index}>
                      <Image src={point} alt="bullet" /> {item}
                    </h4>
                  ))}
                </div>
                <div className="plan-start">
                  <button type="button">
                    Get started with <span>{plan.plan}</span>
                  </button>
                  <p>Switch or cancel plan at anytime</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer newsPaperWrap={true} />
    </div>
  );
};

export default Insurance;
