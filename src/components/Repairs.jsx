"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, RotateCcw, ChevronDown } from "lucide-react";
import "./repairs.css";

// 5 Device Types (Matching Image 1 & 2)
const DEVICE_TYPES = ["Phone", "Tablet", "Laptop", "Camera", "Other"];

// Brands per device type
const BRANDS_BY_DEVICE_TYPE = {
  Phone: ["Apple", "Samsung", "Google", "Redmi", "Tecno", "Infinix", "Other"],
  Tablet: ["Apple", "Samsung", "Lenovo", "Microsoft", "Other"],
  Laptop: ["Apple", "HP", "Dell", "Lenovo", "Asus", "Acer", "Other"],
  Camera: ["Canon", "Nikon", "Sony", "Fujifilm", "Other"],
  Other: ["Apple", "Samsung", "Sony", "Nintendo", "Other"],
};

// Comprehensive dummy model catalog grouped by device type and brand
const MODELS_CATALOG = {
  Phone: {
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
    Tecno: [
      "Tecno Camon 30 Premier",
      "Tecno Camon 30 Pro",
      "Tecno Spark 20 Pro",
      "Tecno Spark 20",
      "Tecno Phantom V Fold",
      "Tecno Pova 6",
    ],
    Infinix: [
      "Infinix Note 40 Pro",
      "Infinix Note 40",
      "Infinix Hot 40 Pro",
      "Infinix Hot 40",
      "Infinix Zero 30",
    ],
    Other: [
      "OnePlus 12",
      "OnePlus 11",
      "Oppo Reno 11 Pro",
      "Vivo V30 Pro",
      "Xiaomi 14",
    ],
  },
  Tablet: {
    Apple: [
      'iPad Pro 12.9" (6th Gen)',
      'iPad Pro 11" (4th Gen)',
      "iPad Air (M2)",
      "iPad Air (5th Gen)",
      "iPad 10th Gen",
      "iPad 9th Gen",
      "iPad mini (6th Gen)",
    ],
    Samsung: [
      "Galaxy Tab S9 Ultra",
      "Galaxy Tab S9+",
      "Galaxy Tab S9",
      "Galaxy Tab S8",
      "Galaxy Tab A9+",
      "Galaxy Tab A9",
    ],
    Lenovo: ["Tab P12 Pro", "Tab P11 Pro", "Tab M10 Plus"],
    Microsoft: ["Surface Pro 9", "Surface Pro 8", "Surface Go 3"],
    Other: ["Xiaomi Pad 6", "Huawei MatePad Pro"],
  },
  Laptop: {
    Apple: [
      'MacBook Pro 16" (M3)',
      'MacBook Pro 14" (M3)',
      'MacBook Pro 16" (M1/M2)',
      'MacBook Pro 14" (M1/M2)',
      'MacBook Air 15" (M2/M3)',
      'MacBook Air 13" (M2/M3)',
      'MacBook Air 13" (M1)',
    ],
    HP: [
      "HP Spectre x360",
      "HP Envy 15",
      "HP Pavilion 15",
      "HP Omen 16",
      "HP EliteBook 840",
    ],
    Dell: [
      "Dell XPS 15",
      "Dell XPS 13 Plus",
      "Dell XPS 13",
      "Dell Inspiron 15",
      "Dell Latitude 5420",
      "Dell G15 Gaming",
    ],
    Lenovo: [
      "ThinkPad X1 Carbon",
      "ThinkPad T14",
      "ThinkPad E14",
      "Legion Pro 5",
      "IdeaPad 3",
      "Yoga 9i",
    ],
    Asus: [
      "ROG Zephyrus G14",
      "ZenBook 14 OLED",
      "VivoBook 15",
      "TUF Gaming A15",
    ],
    Acer: [
      "Acer Swift 3",
      "Acer Aspire 5",
      "Acer Nitro 5",
      "Predator Helios 300",
    ],
    Other: ["Microsoft Surface Laptop 5", "Razer Blade 15"],
  },
  Camera: {
    Canon: [
      "EOS R5",
      "EOS R6 Mark II",
      "EOS R8",
      "EOS 5D Mark IV",
      "EOS 90D",
      "EOS Rebel T7",
    ],
    Nikon: [
      "Nikon Z8",
      "Nikon Z6 II",
      "Nikon Z50",
      "Nikon D850",
      "Nikon D7500",
    ],
    Sony: [
      "Sony Alpha 7 IV",
      "Sony Alpha 7R V",
      "Sony FX3",
      "Sony ZV-E10",
      "Sony A6700",
    ],
    Fujifilm: [
      "Fujifilm X-T5",
      "Fujifilm X-H2",
      "Fujifilm X-S20",
      "Fujifilm X100V",
    ],
    Other: [
      "Panasonic Lumix S5 II",
      "GoPro HERO 12 Black",
      "DJI Osmo Pocket 3",
    ],
  },
  Other: {
    Apple: [
      "Apple Watch Series 9",
      "Apple Watch Ultra 2",
      "Apple Watch SE",
      "AirPods Pro (2nd Gen)",
      "AirPods Max",
    ],
    Samsung: [
      "Galaxy Watch 6 Classic",
      "Galaxy Watch 6",
      "Galaxy Buds2 Pro",
    ],
    Sony: ["PlayStation 5", "PlayStation 5 Digital", "Sony WH-1000XM5"],
    Nintendo: ["Nintendo Switch OLED", "Nintendo Switch Lite"],
    Other: ["Xbox Series X", "Xbox Series S", "Steam Deck OLED"],
  },
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

  // Step 1: Device states (Image 1: initially null so Device Type pills are displayed with hint)
  const [selectedDeviceType, setSelectedDeviceType] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState("Apple");
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
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
  const brandDropdownRef = useRef(null);

  // Available brands for selected device type
  const availableBrands = useMemo(() => {
    if (!selectedDeviceType) return [];
    return BRANDS_BY_DEVICE_TYPE[selectedDeviceType] || ["Other"];
  }, [selectedDeviceType]);

  // When device type changes (Image 1 -> Image 2)
  const handleSelectDeviceType = (type) => {
    setSelectedDeviceType(type);
    const brands = BRANDS_BY_DEVICE_TYPE[type] || ["Other"];
    const defaultBrand = brands.includes(selectedBrand) ? selectedBrand : brands[0];
    setSelectedBrand(defaultBrand);
    setSelectedModel("");
    setSearchQuery("");
    setIsDropdownOpen(false);
    setIsBrandDropdownOpen(false);
    setIsModelUnlisted(false);
  };

  // Stepper Reset handler (Image 2 Reset button)
  const handleReset = () => {
    setStep(1);
    setSelectedDeviceType(null);
    setSelectedBrand("Apple");
    setSelectedModel("");
    setSearchQuery("");
    setIsDropdownOpen(false);
    setIsBrandDropdownOpen(false);
    setIsModelUnlisted(false);
    setSelectedClosestMatch("mid_range_android");
    setCustomModelInput("");
    setSelectedProblem("");
    setSelectedQuality("oem");
    setIsPayOverTime(false);
  };

  // Check auth state on mount
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Handle navigation and scrolling to #GetQuote even if hash is already #GetQuote
  useEffect(() => {
    const scrollToQuote = () => {
      if (typeof window !== "undefined" && window.location.hash === "#GetQuote") {
        const el = document.getElementById("GetQuote");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    // Scroll on initial mount if hash matches
    const timer = setTimeout(scrollToQuote, 150);

    // Also handle hashchange
    window.addEventListener("hashchange", scrollToQuote);

    // Global click listener for any link pointing to #GetQuote or /#GetQuote
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (href === "#GetQuote" || href === "/#GetQuote") {
        const el = document.getElementById("GetQuote");
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth" });
          if (window.location.hash !== "#GetQuote") {
            window.history.pushState(null, "", "/#GetQuote");
          }
        }
      }
    };
    document.addEventListener("click", handleAnchorClick, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", scrollToQuote);
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(e.target)
      ) {
        setIsBrandDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered models for search dropdown
  const filteredModels = useMemo(() => {
    if (!selectedDeviceType) return [];
    const brandCatalog =
      MODELS_CATALOG[selectedDeviceType]?.[selectedBrand] || [];

    if (!searchQuery.trim()) {
      return brandCatalog;
    }
    const q = searchQuery.toLowerCase();
    const brandMatches = brandCatalog.filter((m) =>
      m.toLowerCase().includes(q)
    );
    if (brandMatches.length > 0) return brandMatches;

    // Search across all brands of this device type
    const allMatches = [];
    const allBrandsCatalog = MODELS_CATALOG[selectedDeviceType] || {};
    Object.values(allBrandsCatalog).forEach((arr) => {
      arr.forEach((m) => {
        if (m.toLowerCase().includes(q) && !allMatches.includes(m)) {
          allMatches.push(m);
        }
      });
    });
    return allMatches;
  }, [selectedDeviceType, selectedBrand, searchQuery]);

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
      if (selectedDeviceType) params.set("deviceType", selectedDeviceType.toLowerCase());
      if (effectiveDevice) params.set("device", effectiveDevice);
      if (isModelUnlisted) {
        params.set("category", selectedClosestMatch);
        if (customModelInput) params.set("customModel", customModelInput);
      }
    } else {
      params.set("type", "repair");
      if (selectedDeviceType) params.set("deviceType", selectedDeviceType.toLowerCase());
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
            deviceType: selectedDeviceType,
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
            {/* Stepper Navigation + Reset Button (Image 2) */}
            <div className="stepper-header-row">
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
                  className={`stepper-step ${
                    step === 2
                      ? "active"
                      : selectedModel
                      ? "completed"
                      : "disabled"
                  }`}
                  onClick={() => selectedModel && setStep(2)}
                  disabled={!selectedModel}
                >
                  2. Problem
                </button>

                <button
                  type="button"
                  className={`stepper-step ${
                    step === 3
                      ? "active"
                      : selectedProblem && selectedProblem !== "not_sure"
                      ? "completed"
                      : "disabled"
                  }`}
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

              <button
                type="button"
                className="btn-stepper-reset"
                onClick={handleReset}
                title="Reset selections"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            </div>

            {/* Selected Tags: Step 2 shows [Device Model], Step 3 shows BOTH as yellow badges */}
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

            {/* ================= STEP 1: DEVICE SELECTION (Matching Image 1 & Image 2) ================= */}
            {step === 1 && !isModelUnlisted && (
              <div key="step-1-exact" className="wizard-step-content">
                {/* DEVICE TYPE (Image 1 & 2) */}
                <div>
                  <div className="field-label">DEVICE TYPE</div>
                  <div className="pills-group">
                    {DEVICE_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`pill-btn ${
                          selectedDeviceType === type ? "active" : ""
                        }`}
                        style={
                          selectedDeviceType === type
                            ? {
                                backgroundColor: "#ffc200",
                                color: "#000000",
                                borderColor: "#ffc200",
                                fontWeight: 600,
                              }
                            : undefined
                        }
                        onClick={() => handleSelectDeviceType(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Helper text when no device type is chosen (Image 1) */}
                {!selectedDeviceType && (
                  <p className="device-type-hint">
                    Brand and model appear after you choose a device type.
                  </p>
                )}

                {/* Brand & Model appear after choosing device type (Image 2) */}
                {selectedDeviceType && (
                  <>
                    {/* BRAND DROPDOWN SELECT */}
                    <div ref={brandDropdownRef}>
                      <div className="field-label">BRAND</div>
                      <div className="custom-select-container">
                        <button
                          type="button"
                          className={`custom-select-trigger ${
                            isBrandDropdownOpen ? "open" : ""
                          }`}
                          onClick={() => setIsBrandDropdownOpen((prev) => !prev)}
                        >
                          <span>{selectedBrand || "Select brand"}</span>
                          <ChevronDown
                            size={18}
                            className={`select-chevron ${
                              isBrandDropdownOpen ? "open" : ""
                            }`}
                          />
                        </button>
                        {isBrandDropdownOpen && (
                          <div className="custom-select-dropdown">
                            {availableBrands.map((brand) => (
                              <div
                                key={brand}
                                className={`custom-select-option ${
                                  selectedBrand === brand ? "active" : ""
                                }`}
                                onClick={() => {
                                  setSelectedBrand(brand);
                                  setIsBrandDropdownOpen(false);
                                  setSearchQuery("");
                                  setSelectedModel("");
                                }}
                              >
                                <span>{brand}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* MODEL SEARCH */}
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

                        {/* Dropdown list with dividers matching Image 2 */}
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
                  </>
                )}
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
                  {/* <div className="estimate-section-label">SAVE YOUR ESTIMATE</div> */}
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
                    Sign Up
                  </button>

                  <button
                    type="button"
                    className="btn-guest-google"
                    onClick={() => handleSaveAndRedirect("/login")}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Google</span>
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
