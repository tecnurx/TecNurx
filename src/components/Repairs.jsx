"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import "./repairs.css";

// Brands list
const BRANDS = ["Apple", "Samsung", "Google", "Redmi", "Other"];

// Comprehensive dummy model catalog
const MODELS_BY_BRAND = {
  Apple: [
    "iPhone 16 Pro Max",
    "iPhone 16 Pro",
    "iPhone 16 Plus",
    "iPhone 16",
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15 Plus",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14 Plus",
    "iPhone 14",
    "iPhone 13 Pro Max",
    "iPhone 13 Pro",
    "iPhone 13",
    "iPhone 13 mini",
    "iPhone 12 Pro Max",
    "iPhone 12 Pro",
    "iPhone 12",
    "iPhone 12 mini",
    "iPhone 11 Pro Max",
    "iPhone 11 Pro",
    "iPhone 11",
    "iPhone XR",
    "iPhone XS Max",
    "iPhone X",
    "iPhone SE (3rd Gen)",
    'iPad Pro 12.9"',
    "iPad Air (M2)",
    "iPad 10th Gen",
    'MacBook Pro 14"',
    "MacBook Air M2",
  ],
  Samsung: [
    "Galaxy S24 Ultra",
    "Galaxy S24+",
    "Galaxy S24",
    "Galaxy S23 Ultra",
    "Galaxy S23+",
    "Galaxy S23",
    "Galaxy S22 Ultra",
    "Galaxy S22+",
    "Galaxy S22",
    "Galaxy Z Fold 5",
    "Galaxy Z Flip 5",
    "Galaxy A54 5G",
    "Galaxy A34 5G",
    "Galaxy A24",
    "Galaxy A14",
    "Galaxy Note 20 Ultra",
    "Galaxy Tab S9",
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
    "Pixel 6 Pro",
    "Pixel 6",
    "Pixel 6a",
  ],
  Redmi: [
    "Redmi Note 13 Pro+",
    "Redmi Note 13 Pro",
    "Redmi Note 13",
    "Redmi Note 12 Pro",
    "Redmi Note 12",
    "Redmi Note 11",
    "Redmi 13C",
    "Redmi 12",
    "Redmi 10C",
  ],
  Other: [
    "Tecno Camon 30 Premier",
    "Tecno Spark 20 Pro",
    "Infinix Note 40 Pro",
    "Infinix Hot 40",
    "OnePlus 12",
    "OnePlus 11",
    "Oppo Reno 11 Pro",
    "Vivo V30 Pro",
    "HP Pavilion 15",
    "Dell XPS 13",
    "Lenovo ThinkPad X1",
  ],
};

// 6 Closest Match options (when exact model is unlisted - Figma Image 2)
const CLOSEST_MATCHES = [
  {
    id: "budget_android",
    label: "Budget Android",
    minCost: 20000,
    maxCost: 45000,
    desc: "Based on a budget Android screen replacement. Prices updated 20 Oct 2026.",
  },
  {
    id: "mid_range_android",
    label: "Mid-range Android",
    minCost: 35000,
    maxCost: 90000,
    desc: "Based on a mid-range Android screen replacement. Prices updated 20 Oct 2026.",
  },
  {
    id: "flagship_android",
    label: "Flagship Android",
    minCost: 65000,
    maxCost: 155000,
    desc: "Based on a flagship Android screen replacement. Prices updated 20 Oct 2026.",
  },
  {
    id: "older_iphone",
    label: "Older iPhone",
    minCost: 25000,
    maxCost: 60000,
    desc: "Based on an older iPhone (X/11 series) screen replacement. Prices updated 20 Oct 2026.",
  },
  {
    id: "recent_iphone",
    label: "Recent iPhone",
    minCost: 70000,
    maxCost: 180000,
    desc: "Based on a recent iPhone (13-15 series) screen replacement. Prices updated 20 Oct 2026.",
  },
  {
    id: "tablet_laptop",
    label: "Tablet or Laptop",
    minCost: 45000,
    maxCost: 130000,
    desc: "Based on a tablet or laptop display repair. Prices updated 20 Oct 2026.",
  },
];

// Problem issues (Exact layout & labels from Figma Image 3 & 4)
const PROBLEMS = [
  { id: "screen", label: "Screen", fullName: "Screen Replacement" },
  { id: "battery", label: "Battery", fullName: "Battery Replacement" },
  { id: "charging", label: "Charging port", fullName: "Charging Port Repair" },
  { id: "backglass", label: "Back glass", fullName: "Back Glass Replacement" },
  { id: "camera", label: "Camera", fullName: "Camera Problem" },
  { id: "water", label: "Water damage", fullName: "Water Damage Diagnostic" },
  { id: "not_sure", label: "Not sure", fullName: "Diagnostic Assessment" },
];

// Issue quality tiers & prices (Figma Part Selection Images 1, 2, 3)
const ISSUE_CONFIGS = {
  screen: {
    qualities: [
      {
        id: "aftermarket",
        name: "Aftermarket",
        min: 45000,
        max: 65000,
        turnaround: "1 to 2 days turnaround · 30-day warranty",
      },
      {
        id: "oem",
        name: "Original quality",
        min: 120000,
        max: 160000,
        turnaround: "2 to 3 days turnaround · 90-day warranty",
      },
    ],
    defaultQuality: "oem",
    desc: "Original quality screen. Includes parts, labour and testing.",
    changeFactor: "Hidden damage, a locked device or an earlier repair.",
  },
  battery: {
    qualities: [
      {
        id: "standard",
        name: "High Capacity Standard",
        min: 25000,
        max: 35000,
        turnaround: "1 to 2 days turnaround · 30-day warranty",
      },
      {
        id: "oem",
        name: "Original quality",
        min: 38000,
        max: 55000,
        turnaround: "Same day turnaround · 90-day warranty",
      },
    ],
    defaultQuality: "oem",
    desc: "High capacity replacement battery with full health calibration and testing.",
    changeFactor: "Swollen battery casing or board power circuit issues.",
  },
  charging: {
    qualities: [
      {
        id: "oem",
        name: "Original quality",
        min: 28000,
        max: 45000,
        turnaround: "Same day turnaround · 90-day warranty",
      },
    ],
    defaultQuality: "oem",
    desc: "Genuine dock connector, mic assembly and power flex repair.",
    changeFactor: "Liquid corrosion or damaged motherboard charging IC.",
  },
  backglass: {
    qualities: [
      {
        id: "laser",
        name: "Laser Removal OEM",
        min: 35000,
        max: 55000,
        turnaround: "1 to 2 days turnaround · 60-day warranty",
      },
      {
        id: "housing",
        name: "Full Chassis Swap",
        min: 65000,
        max: 95000,
        turnaround: "2 to 3 days turnaround · 90-day warranty",
      },
    ],
    defaultQuality: "laser",
    desc: "Precision laser back glass separation and adhesive seal.",
    changeFactor: "Bent or dented outer housing frame.",
  },
  camera: {
    qualities: [
      {
        id: "lens",
        name: "Lens Cover Only",
        min: 18000,
        max: 28000,
        turnaround: "Same day turnaround · 30-day warranty",
      },
      {
        id: "module",
        name: "Original quality",
        min: 55000,
        max: 85000,
        turnaround: "1 to 2 days turnaround · 90-day warranty",
      },
    ],
    defaultQuality: "module",
    desc: "OEM camera sensor and multi-lens optical assembly.",
    changeFactor: "Logic board image sensor filter failure.",
  },
  water: {
    qualities: [
      {
        id: "clean",
        name: "Ultrasonic Clean & Board Repair",
        min: 35000,
        max: 70000,
        turnaround: "2 to 4 days turnaround · 30-day warranty",
      },
    ],
    defaultQuality: "clean",
    desc: "Ultrasonic cleaning, corrosion removal and logic board recovery.",
    changeFactor: "Extensive component corrosion or burnt power rails.",
  },
};

const Repairs = () => {
  const router = useRouter();

  // Stepper state: 1: Device, 2: Problem, 3: Part Quality
  const [step, setStep] = useState(1);

  // Step 1: Device states
  const [selectedBrand, setSelectedBrand] = useState("Apple");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("iPhone 13 Pro");
  const [isModelUnlisted, setIsModelUnlisted] = useState(false);
  const [selectedClosestMatch, setSelectedClosestMatch] =
    useState("mid_range_android");
  const [customModelInput, setCustomModelInput] = useState("");

  // Step 2: Problem states
  const [selectedProblem, setSelectedProblem] = useState("");

  // Step 3: Part Quality states
  const [selectedQuality, setSelectedQuality] = useState("oem");

  // User auth state (Image 1: logged in vs Image 2: not logged in)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Pay over time mode (Image 3)
  const [isPayOverTime, setIsPayOverTime] = useState(false);
  const [paybackMonths, setPaybackMonths] = useState(6);

  const searchContainerRef = useRef(null);

  // Check auth state on mount
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered models for search dropdown
  const filteredModels = useMemo(() => {
    const list = MODELS_BY_BRAND[selectedBrand] || [];
    if (!searchQuery.trim()) {
      return list;
    }
    const q = searchQuery.toLowerCase();
    const brandMatches = list.filter((m) => m.toLowerCase().includes(q));
    if (brandMatches.length > 0) return brandMatches;

    const allMatches = [];
    Object.values(MODELS_BY_BRAND).forEach((arr) => {
      arr.forEach((m) => {
        if (m.toLowerCase().includes(q) && !allMatches.includes(m)) {
          allMatches.push(m);
        }
      });
    });
    return allMatches;
  }, [selectedBrand, searchQuery]);

  // Handle Model Selection
  const handleSelectModel = (model) => {
    setSelectedModel(model);
    setSearchQuery("");
    setIsDropdownOpen(false);
    setIsModelUnlisted(false);
    setSelectedProblem("");
    setStep(2); // Advance to Problem selection
  };

  // Handle Problem Selection
  const handleSelectProblem = (probId) => {
    setSelectedProblem(probId);
    if (probId === "not_sure") {
      // Diagnostic assessment: stays on Step 2 with "Needs inspection" estimate card
      return;
    }
    const config = ISSUE_CONFIGS[probId];
    if (config?.defaultQuality) {
      setSelectedQuality(config.defaultQuality);
    }
    setStep(3); // Advance to Part Quality
  };

  // Switch to Closest Match mode
  const handleSwitchToClosestMatch = () => {
    setIsModelUnlisted(true);
    setSelectedModel("");
    if (!selectedClosestMatch) {
      setSelectedClosestMatch("mid_range_android");
    }
  };

  // Switch back to exact model search
  const handleSwitchToExactModel = () => {
    setIsModelUnlisted(false);
    setSelectedModel("iPhone 13 Pro");
  };

  // Active items
  const currentClosestObj = CLOSEST_MATCHES.find(
    (item) => item.id === selectedClosestMatch,
  );

  const currentProblemObj = PROBLEMS.find((p) => p.id === selectedProblem);
  const currentProblemConfig = ISSUE_CONFIGS[selectedProblem];
  const currentQualityObj = currentProblemConfig?.qualities?.find(
    (q) => q.id === selectedQuality,
  );

  // Active price range
  let activeMin = null;
  let activeMax = null;

  if (isModelUnlisted && currentClosestObj) {
    activeMin = currentClosestObj.minCost;
    activeMax = currentClosestObj.maxCost;
  } else if (currentQualityObj) {
    activeMin = currentQualityObj.min;
    activeMax = currentQualityObj.max;
  }

  // Pay Over Time calculation matching exact Figma Image 3 numbers
  // For 120,000 - 160,000 at 6 months:
  // Setup fee: 3,000
  // Total: 123,000 - 163,000
  // Monthly: 20,500 - 27,167
  const payOverTimeData = useMemo(() => {
    if (!activeMin || !activeMax) return null;

    const setupFee = 3000;
    const totalMin = activeMin + setupFee;
    const totalMax = activeMax + setupFee;

    const monthlyMin = Math.round(totalMin / paybackMonths);
    const monthlyMax = Math.round(totalMax / paybackMonths);

    return {
      monthlyMin,
      monthlyMax,
      totalMin,
      totalMax,
      setupFee,
      eligibility: "valid ID and a working phone number",
    };
  }, [activeMin, activeMax, paybackMonths]);

  const effectiveDevice =
    selectedModel || customModelInput || currentClosestObj?.label || "";

  // Construct booking link with pre-selected params
  const getBookingLink = (type = "repair") => {
    const params = new URLSearchParams();

    if (
      type === "diagnostic" ||
      selectedProblem === "not_sure" ||
      isModelUnlisted
    ) {
      params.set("type", "diagnostic");
      if (effectiveDevice) params.set("device", effectiveDevice);
      if (isModelUnlisted) {
        params.set("category", selectedClosestMatch);
        if (customModelInput) params.set("customModel", customModelInput);
      }
    } else {
      params.set("type", "repair");
      if (effectiveDevice) params.set("device", effectiveDevice);
      if (selectedProblem) params.set("issue", selectedProblem);
      if (selectedQuality) params.set("quality", selectedQuality);
      if (isPayOverTime) params.set("payOverTime", `${paybackMonths}`);
    }
    return `/dashboard/book-repair?${params.toString()}`;
  };

  // Save current estimate to localStorage
  const savePendingEstimate = (type = "repair") => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "pendingRepairEstimate",
          JSON.stringify({
            device: effectiveDevice,
            problem: selectedProblem,
            quality: selectedQuality,
            payOverTime: isPayOverTime ? paybackMonths : null,
            minCost: activeMin,
            maxCost: activeMax,
            bookingUrl: getBookingLink(type),
          }),
        );
      } catch (e) {
        console.error("Failed to save pending estimate", e);
      }
    }
  };

  // Save current estimate choices to localStorage before auth redirect
  const handleSaveAndRedirect = (dest) => {
    const bookingUrl = getBookingLink(
      selectedProblem === "not_sure" || isModelUnlisted
        ? "diagnostic"
        : "repair"
    );
    savePendingEstimate(
      selectedProblem === "not_sure" || isModelUnlisted
        ? "diagnostic"
        : "repair"
    );
    const sep = dest.includes("?") ? "&" : "?";
    router.push(`${dest}${sep}redirect=${encodeURIComponent(bookingUrl)}`);
  };

  return (
    <section id="GetQuote" className="GetQuote">
      <div className="repairs-wrap">
        {/* Top dashed line with "Repairs" pill */}
        <div className="repairs-top">
          <div className="repairs-pill-badge">Repairs</div>
        </div>

        {/* Section Header */}
        <div className="repair-header">
          <h1>
            What does it <span className="highlight-yellow">cost?</span>
          </h1>
          <p>
            Get an idea of what it costs to fix your gadget using our{" "}
            <span className="highlight-action">fix now, pay later </span>system
          </p>
        </div>

        {/* 2-Column Calculator Container */}
        <div className="repair-calculator-container">
          {/* ================= LEFT WIZARD CARD ================= */}
          <div className="wizard-card">
            {/* Stepper Navigation (Matching Figma: spaced without arrows) */}
            <div className="stepper-nav">
              <button
                type="button"
                className={`stepper-step ${step === 1 ? "active" : ""}`}
                onClick={() => setStep(1)}
              >
                1. Device
              </button>

              <button
                type="button"
                className={`stepper-step ${step === 2 ? "active" : ""}`}
                onClick={() => selectedModel && setStep(2)}
                disabled={!selectedModel}
              >
                2. Problem
              </button>

              <button
                type="button"
                className={`stepper-step ${step === 3 ? "active" : ""}`}
                onClick={() =>
                  selectedProblem &&
                  selectedProblem !== "not_sure" &&
                  setStep(3)
                }
                disabled={!selectedProblem || selectedProblem === "not_sure"}
              >
                3. Part Quality
              </button>
            </div>

            {/* Selected Tags: Step 2 shows [iPhone 13 Pro], Step 3 shows BOTH as yellow badges */}
            {step === 2 && selectedModel && (
              <div className="selected-tags-row">
                <div
                  className="chip-tag primary"
                  onClick={() => {
                    setSelectedModel("");
                    setSelectedProblem("");
                    setStep(1);
                  }}
                  title="Click to remove or change device"
                >
                  <span>{selectedModel}</span>
                  <span className="chip-close-btn">
                    <X size={14} />
                  </span>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="selected-tags-row">
                {selectedModel && (
                  <div
                    className="chip-tag primary"
                    onClick={() => {
                      setSelectedModel("");
                      setSelectedProblem("");
                      setStep(1);
                    }}
                    title="Click to change device"
                  >
                    <span>{selectedModel}</span>
                    <span className="chip-close-btn">
                      <X size={14} />
                    </span>
                  </div>
                )}

                {currentProblemObj && (
                  <div
                    className="chip-tag primary"
                    onClick={() => {
                      setSelectedProblem("");
                      setStep(2);
                    }}
                    title="Click to change problem"
                  >
                    <span>{currentProblemObj.fullName}</span>
                    <span className="chip-close-btn">
                      <X size={14} />
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ================= STEP 1: DEVICE SELECTION ================= */}
            {step === 1 && !isModelUnlisted && (
              <div key="step-1-exact" className="wizard-step-content">
                {/* Brand Selection */}
                <div>
                  <div className="field-label">BRAND</div>
                  <div className="pills-group">
                    {BRANDS.map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        className={`pill-btn ${
                          selectedBrand === brand ? "active" : ""
                        }`}
                        style={
                          selectedBrand === brand
                            ? {
                                backgroundColor: "#ffc200",
                                color: "#000000",
                                borderColor: "#ffc200",
                                fontWeight: 600,
                              }
                            : undefined
                        }
                        onClick={() => {
                          setSelectedBrand(brand);
                          setSearchQuery("");
                        }}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model Search Input */}
                <div ref={searchContainerRef}>
                  <div className="field-label">MODEL</div>
                  <div className="search-input-wrap">
                    <Search size={18} className="search-icon-inside" />
                    <input
                      type="text"
                      className="search-input-field"
                      placeholder="Search your model"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                    />

                    {/* Autocomplete suggestions dropdown */}
                    {isDropdownOpen && (
                      <div className="model-dropdown">
                        {filteredModels.length > 0 ? (
                          filteredModels.map((model) => (
                            <div
                              key={model}
                              className={`model-dropdown-item ${
                                selectedModel === model ? "focused" : ""
                              }`}
                              onClick={() => handleSelectModel(model)}
                            >
                              <span>{model}</span>
                            </div>
                          ))
                        ) : (
                          <div className="model-dropdown-empty">
                            No models found matching &quot;{searchQuery}&quot;
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Model not listed link */}
                <div>
                  <button
                    type="button"
                    className="text-link-action"
                    onClick={handleSwitchToClosestMatch}
                  >
                    My model isn&apos;t listed
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 1 (B): CLOSEST MATCH (FIGMA IMAGE 2) ================= */}
            {step === 1 && isModelUnlisted && (
              <div key="step-1-unlisted" className="wizard-step-content">
                <div>
                  <div className="field-label">CHOOSE THE CLOSEST MATCH</div>
                  <div className="closest-match-grid">
                    {CLOSEST_MATCHES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`closest-match-pill ${
                          selectedClosestMatch === item.id ? "active" : ""
                        }`}
                        style={
                          selectedClosestMatch === item.id
                            ? {
                                backgroundColor: "#ffc200",
                                color: "#000000",
                                borderColor: "#ffc200",
                                fontWeight: 600,
                              }
                            : undefined
                        }
                        onClick={() => setSelectedClosestMatch(item.id)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="field-label">MODEL (Optional)</div>
                  <input
                    type="text"
                    className="search-input-field"
                    style={{ paddingLeft: "16px" }}
                    placeholder="Type your model if you know it"
                    value={customModelInput}
                    onChange={(e) => setCustomModelInput(e.target.value)}
                  />
                </div>

                <div>
                  <button
                    type="button"
                    className="text-link-action"
                    onClick={handleSwitchToExactModel}
                  >
                    Add my exact model
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: PROBLEM SELECTION (FIGMA IMAGES 3 & 4) ================= */}
            {step === 2 && (
              <div key="step-2" className="wizard-step-content">
                <div>
                  <div className="field-label">
                    {selectedProblem === "not_sure"
                      ? "WHAT IS WRONG, CHOOSE ALL THAT APPLY"
                      : "WHAT IS WRONG WITH THE DEVICE?"}
                  </div>
                  <div className="pills-group-problems">
                    <div className="problems-row">
                      {PROBLEMS.slice(0, 4).map((prob) => (
                        <button
                          key={prob.id}
                          type="button"
                          className={`pill-btn ${
                            selectedProblem === prob.id ? "active" : ""
                          }`}
                          style={
                            selectedProblem === prob.id
                              ? {
                                  backgroundColor: "#ffc200",
                                  color: "#000000",
                                  borderColor: "#ffc200",
                                  fontWeight: 600,
                                }
                              : undefined
                          }
                          onClick={() => handleSelectProblem(prob.id)}
                        >
                          {prob.label}
                        </button>
                      ))}
                    </div>
                    <div className="problems-row">
                      {PROBLEMS.slice(4).map((prob) => (
                        <button
                          key={prob.id}
                          type="button"
                          className={`pill-btn ${
                            selectedProblem === prob.id ? "active" : ""
                          }`}
                          style={
                            selectedProblem === prob.id
                              ? {
                                  backgroundColor: "#ffc200",
                                  color: "#000000",
                                  borderColor: "#ffc200",
                                  fontWeight: 600,
                                }
                              : undefined
                          }
                          onClick={() => handleSelectProblem(prob.id)}
                        >
                          {prob.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 3: PART QUALITY (FIGMA PART SELECTION) ================= */}
            {step === 3 && currentProblemConfig && (
              <div key="step-3" className="wizard-step-content">
                <div>
                  <div className="field-label">PART QUALITY</div>
                  <div className="quality-cards-stack">
                    {currentProblemConfig.qualities.map((qual) => (
                      <div
                        key={qual.id}
                        className={`quality-option-card ${
                          selectedQuality === qual.id ? "selected" : ""
                        }`}
                        onClick={() => setSelectedQuality(qual.id)}
                      >
                        <span className="quality-card-title">{qual.name}</span>
                        <span className="quality-card-price">
                          ₦{qual.min.toLocaleString()} – ₦
                          {qual.max.toLocaleString()}
                        </span>
                        <span className="quality-card-subtext">
                          {qual.turnaround}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= RIGHT ESTIMATE CARD ================= */}
          <div className="estimate-card">
            {/* Top Bar with subtle preview toggle */}
            <div className="estimate-card-top-bar">
              <h3 className="estimate-header-title">
                {step === 3 && !isLoggedIn && !isPayOverTime
                  ? "SAVE YOUR ESTIMATE"
                  : "YOUR ESTIMATE"}
              </h3>
              {step === 3 && (
                <button
                  type="button"
                  className="auth-preview-switch"
                  onClick={() => setIsLoggedIn((prev) => !prev)}
                  title="Click to toggle Logged In vs Guest view"
                >
                  {isLoggedIn ? "● Logged in" : "○ Guest (Not logged in)"}
                </button>
              )}
            </div>

            {/* STATE A: Empty Placeholder (Step 1) */}
            {step === 1 && !isModelUnlisted && (
              <div key="estimate-step-1" className="estimate-content-anim">
                <div className="estimate-skeleton-wrap">
                  <div className="skeleton-bar w-40" />
                  <div className="skeleton-bar w-95" />
                  <div className="skeleton-bar w-60" />
                </div>
                <p className="estimate-placeholder-hint">
                  Your price range appears here as you choose.
                </p>
                <button
                  type="button"
                  className="btn-estimate-action disabled"
                  disabled
                >
                  Request this repair
                </button>
              </div>
            )}

            {/* STATE B: Closest Match / Unlisted Model (Figma Image 2) */}
            {step === 1 && isModelUnlisted && currentClosestObj && (
              <div
                key={`estimate-step-1-unlisted-${selectedClosestMatch}`}
                className="estimate-content-anim"
              >
                <div className="rough-wrap">
                  <div className="estimate-badge-pill">Rough estimate</div>
                  <h2 className="estimate-price-large">
                    ₦{currentClosestObj.minCost.toLocaleString()} – ₦
                    {currentClosestObj.maxCost.toLocaleString()}
                  </h2>
                </div>
                <p className="estimate-scope-desc">
                  Confirmed after inspection. Add your exact model for a tighter
                  range.
                </p>
                <p className="estimate-subtext-note">
                  {currentClosestObj.desc}
                </p>

                <Link
                  href={getBookingLink("diagnostic")}
                  onClick={() => savePendingEstimate("diagnostic")}
                  className="btn-estimate-action primary"
                >
                  Book a diagnosis
                </Link>
              </div>
            )}

            {/* STATE C: Step 2 and Problem is "Not sure" (Figma Image 4) */}
            {step === 2 && selectedProblem === "not_sure" && (
              <div
                key="estimate-step-2-notsure"
                className="estimate-content-anim"
              >
                <div className="rough-wrap">
                  <div className="estimate-badge-pill">Needs inspection</div>
                  <div className="diagnostic-info-card">
                    <h4 className="diagnostic-title">
                      We need to look at it first
                    </h4>
                    <p className="estimate-scope-desc">
                      Some faults can&apos;t be priced from a description. Book
                      a diagnosis and an engineer will confirm the cost.
                    </p>
                    <p
                      className="estimate-subtext-note"
                      style={{ color: "#374151", fontWeight: "500" }}
                    >
                      Diagnosis fee: ₦5,000 · Result within 24 hours
                    </p>
                  </div>
                </div>

                <Link
                  href={getBookingLink("diagnostic")}
                  onClick={() => savePendingEstimate("diagnostic")}
                  className="btn-estimate-action primary"
                >
                  Book a diagnosis
                </Link>
              </div>
            )}

            {/* STATE D: Step 2 pending problem selection (Figma Image 3) */}
            {step === 2 && selectedProblem !== "not_sure" && (
              <div
                key="estimate-step-2-skeleton"
                className="estimate-content-anim"
              >
                <div className="estimate-skeleton-wrap">
                  <div className="skeleton-bar w-40" />
                  <div className="skeleton-bar w-95" />
                  <div className="skeleton-bar w-60" />
                </div>
                <p className="estimate-placeholder-hint">
                  Your price range appears here as you choose.
                </p>
                <button
                  type="button"
                  className="btn-estimate-action disabled"
                  disabled
                >
                  Request this repair
                </button>
              </div>
            )}

            {/* ================= STEP 3: PART QUALITY ESTIMATE (3 FIGMA VIEWS) ================= */}

            {/* --- VIEW 3: PAY OVER TIME (Figma Image 3) --- */}
            {step === 3 &&
              currentQualityObj &&
              isPayOverTime &&
              payOverTimeData && (
                <div
                  key={`estimate-pot-${paybackMonths}-${selectedQuality}`}
                  className="estimate-content-anim"
                >
                  <h2 className="estimate-price-large">
                    ₦{currentQualityObj.min.toLocaleString()} – ₦
                    {currentQualityObj.max.toLocaleString()}
                  </h2>

                  <div
                    className="estimate-section-label"
                    style={{ marginTop: "4px" }}
                  >
                    PAY OVER TIME
                  </div>

                  <div className="pay-over-time-tabs">
                    {[3, 6, 9, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`pay-tab-pill ${
                          paybackMonths === m ? "active" : ""
                        }`}
                        style={
                          paybackMonths === m
                            ? {
                                backgroundColor: "#ffc200",
                                color: "#000000",
                                borderColor: "#ffc200",
                                fontWeight: 600,
                              }
                            : undefined
                        }
                        onClick={() => setPaybackMonths(m)}
                      >
                        {m} months
                      </button>
                    ))}
                  </div>

                  {/* Calculation box matching Figma Image 3 */}
                  <div className="pay-pot-box">
                    <div className="pay-pot-row">
                      <span className="pay-pot-label">Monthly:</span>
                      <span className="pay-pot-val">
                        ₦{payOverTimeData.monthlyMin.toLocaleString()} – ₦
                        {payOverTimeData.monthlyMax.toLocaleString()}
                      </span>
                    </div>
                    <div className="pay-pot-row">
                      <span className="pay-pot-label">Total:</span>
                      <span className="pay-pot-val">
                        ₦{payOverTimeData.totalMin.toLocaleString()} – ₦
                        {payOverTimeData.totalMax.toLocaleString()}
                      </span>
                    </div>
                    <div className="pay-pot-row">
                      <span className="pay-pot-label">Setup fee:</span>
                      <span className="pay-pot-val">
                        ₦{payOverTimeData.setupFee.toLocaleString()}
                      </span>
                    </div>
                    <div className="pay-pot-eligibility">
                      Eligibility: {payOverTimeData.eligibility}
                    </div>
                  </div>

                  <Link
                    href={getBookingLink("repair")}
                    onClick={() => savePendingEstimate("repair")}
                    className="btn-estimate-action primary"
                  >
                    Request this repair
                  </Link>

                  <button
                    type="button"
                    className="btn-toggle-pay"
                    onClick={() => setIsPayOverTime(false)}
                  >
                    Pay upfront
                  </button>
                </div>
              )}

            {/* --- VIEW 1: USER IS LOGGED IN (Figma Image 1) --- */}
            {step === 3 &&
              currentQualityObj &&
              !isPayOverTime &&
              isLoggedIn && (
                <div
                  key={`estimate-logged-${selectedQuality}`}
                  className="estimate-content-anim"
                >
                  <h2 className="estimate-price-large">
                    ₦{currentQualityObj.min.toLocaleString()} – ₦
                    {currentQualityObj.max.toLocaleString()}
                  </h2>

                  <p className="estimate-scope-desc">
                    {currentProblemConfig.desc}
                  </p>

                  <div>
                    <div className="estimate-section-label">
                      WHAT CAN CHANGE THE PRICE
                    </div>
                    <p className="estimate-section-text">
                      {currentProblemConfig.changeFactor}
                    </p>
                  </div>

                  <p
                    className="estimate-subtext-note"
                    style={{ color: "#9ca3af" }}
                  >
                    Prices updated 20 Oct 2026.
                  </p>

                  <Link
                    href={getBookingLink("repair")}
                    onClick={() => savePendingEstimate("repair")}
                    className="btn-estimate-action primary"
                  >
                    Request this repair
                  </Link>

                  <button
                    type="button"
                    className="btn-toggle-pay"
                    onClick={() => setIsPayOverTime(true)}
                  >
                    Pay over time
                  </button>
                </div>
              )}

            {/* --- VIEW 2: USER IS NOT LOGGED IN AT THE MOMENT (Figma Image 2) --- */}
            {step === 3 &&
              currentQualityObj &&
              !isPayOverTime &&
              !isLoggedIn && (
                <div
                  key="estimate-guest"
                  className="estimate-content-anim guest-onestep-container"
                >
                  <h4 className="guest-onestep-title">One step left</h4>
                  <p className="guest-onestep-desc">
                    Create an account or log in to request this repair. Your
                    estimate and choices will be waiting for you.
                  </p>

                  <button
                    type="button"
                    className="btn-estimate-action primary"
                    onClick={() => handleSaveAndRedirect("/register")}
                  >
                    Create account
                  </button>

                  <button
                    type="button"
                    className="btn-guest-google"
                    onClick={() => handleSaveAndRedirect("/login")}
                  >
                    Continue with Google
                  </button>

                  <button
                    type="button"
                    className="btn-toggle-pay"
                    onClick={() => handleSaveAndRedirect("/login")}
                  >
                    I already have an account?
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Repairs;
