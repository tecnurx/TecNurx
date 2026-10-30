"use client";

import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import "./navbar.css";
import { ChevronDown, Menu, X } from "lucide-react";
import logo from "@/assets/images/logo.png";
import book from "@/assets/images/book.svg";
import track from "@/assets/images/track.svg";
import Image from "next/image";

// Waving vector SVG flags matching design
const WavingNigeriaFlag = () => (
  <svg
    width="21"
    height="21"
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <use href="#image0_3207_2907" xlinkHref="#image0_3207_2907" transform="scale(0.13125)" />
    <defs>
      <image
        id="image0_3207_2907"
        width="160"
        height="160"
        preserveAspectRatio="none"
        href="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

const WavingGhanaFlag = () => (
  <svg
    width="21"
    height="21"
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <use href="#image0_3207_2913" transform="scale(0.13125)" />
    <defs>
      <image
        id="image0_3207_2913"
        width="160"
        height="160"
        preserveAspectRatio="none"
        href="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

const countries = [
  { id: "NG", name: "Nigeria", Flag: WavingNigeriaFlag },
  { id: "GH", name: "Ghana", Flag: WavingGhanaFlag },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const countryDropdownRef = useRef(null);

  // Close country dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target)
      ) {
        setCountryDropdownOpen(false);
      }
    };
    if (countryDropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [countryDropdownOpen]);

  const toggleMobileDropdown = (e) => {
    e.stopPropagation();
    setMobileDropdownOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileDropdownOpen(false);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setCountryDropdownOpen(false);
  };

  const handleBookRepairClick = (e) => {
    const el = document.getElementById("GetQuote");
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
      if (window.location.hash !== "#GetQuote") {
        window.history.pushState(null, "", "#GetQuote");
      }
    }
  };

  return (
    <div className="navbar-wrap">
      <nav className="navbar">
        {/* Logo */}
        <Link href="/" className="navbar-logo" aria-label="TecNurx Home">
          <Image src={logo} alt="TecNurx" width={120} priority />
        </Link>

        {/* Center Nav Links */}
        <div className="nav-links">
          {/* Repairs Dropdown */}
          <div className="nav-repairs-container">
            <button
              type="button"
              className="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <span>Repairs</span>
              <ChevronDown size={15} color="#111111" />
            </button>
            <div className="dropdown-list">
              <Link href="/dashboard/book-repair">
                <Image src={book} alt="book" width={38} height={38} />
                <div>
                  <h4>Book Repair</h4>
                  <p>
                    Get a quote, then get your device fixed quickly and easily
                    by an expert
                  </p>
                </div>
              </Link>
              <Link href="/track-repair">
                <Image src={track} alt="track" width={38} height={38} />
                <div>
                  <h4>Track Repair</h4>
                  <p>
                    Stay up-to-date with real-time tracking of your
                    device&apos;s repair progress
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <Link href="/insurance">Insurance</Link>
          <Link href="/buy-devices">Buy a device</Link>
        </div>

        {/* Right Section: Sign In + Book a Repair + Country Selector */}
        <div className="nav-right-actions">
          <Link href="/login" className="nav-signin">
            Sign In
          </Link>

          <Link href="/dashboard/book-repair" className="nav-book-btn">
            Book a Repair
          </Link>

          {/* Country Selector */}
          <div className="country-selector-wrap" ref={countryDropdownRef}>
            <button
              type="button"
              className="country-btn"
              onClick={() => setCountryDropdownOpen((prev) => !prev)}
              aria-label={`Select Country, current is ${selectedCountry.name}`}
              aria-haspopup="true"
              aria-expanded={countryDropdownOpen}
            >
              <selectedCountry.Flag width={26} height={18} />
              <ChevronDown
                size={14}
                color="#111111"
                className={`country-chevron ${countryDropdownOpen ? "rotated" : ""}`}
              />
            </button>

            {/* Country Dropdown Card */}
            {countryDropdownOpen && (
              <div className="country-dropdown">
                {countries.map((country, idx) => {
                  const CountryFlag = country.Flag;
                  return (
                    <React.Fragment key={country.id}>
                      <button
                        type="button"
                        className={`country-option ${
                          selectedCountry.id === country.id ? "active" : ""
                        }`}
                        onClick={() => handleCountrySelect(country)}
                      >
                        <CountryFlag width={26} height={18} />
                        <span>{country.name}</span>
                      </button>
                      {idx < countries.length - 1 && (
                        <div className="country-divider" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Header Controls: Book a Repair + Hamburger */}
        <div className="mobile-header-controls">
          <Link
            href="/#GetQuote"
            onClick={handleBookRepairClick}
            className="mobile-nav-book-btn"
          >
            Book a Repair
          </Link>

          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={20} color="#111111" strokeWidth={2.2} />
          </button>
        </div>
      </nav>

      {/* Mobile Side Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <Image src={logo} alt="TecNurx" width={130} />
          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <X size={24} color="#111111" />
          </button>
        </div>

        {/* Region Selector in Drawer */}
        <div className="drawer-country-selector">
          <span className="drawer-country-title">Select Region</span>
          <div className="drawer-country-options">
            {countries.map((country) => {
              const CountryFlag = country.Flag;
              const isActive = selectedCountry.id === country.id;
              return (
                <button
                  key={country.id}
                  type="button"
                  className={`drawer-country-btn ${isActive ? "active" : ""}`}
                  onClick={() => handleCountrySelect(country)}
                >
                  <CountryFlag width={24} height={17} />
                  <span>{country.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="drawer-links">
          {/* Repairs Dropdown in Mobile */}
          <div className="mobile-repairs-section">
            <button
              type="button"
              className="mobile-repairs-toggle"
              onClick={toggleMobileDropdown}
            >
              <span>Repairs</span>
              <ChevronDown
                size={18}
                className={`chevron ${mobileDropdownOpen ? "rotated" : ""}`}
              />
            </button>

            <div
              className={`mobile-dropdown-content ${
                mobileDropdownOpen ? "open" : ""
              }`}
            >
              <Link
                href="/dashboard/book-repair"
                className="mobile-repair-item"
                onClick={closeMobileMenu}
              >
                <Image src={book} alt="book" width={30} height={30} />
                <div>
                  <h4>Book Repair</h4>
                  <p>
                    Get a quote, then get your device fixed quickly and easily
                    by an expert
                  </p>
                </div>
              </Link>

              <Link
                href="/track-repair"
                className="mobile-repair-item"
                onClick={closeMobileMenu}
              >
                <Image src={track} alt="track" width={30} height={30} />
                <div>
                  <h4>Track Repair</h4>
                  <p>
                    Stay up-to-date with real-time tracking of your
                    device&apos;s repair progress
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <Link href="/insurance" onClick={closeMobileMenu}>
            Insurance
          </Link>
          <Link href="/buy-devices" onClick={closeMobileMenu}>
            Buy a device
          </Link>
        </div>

        <div className="drawer-auth">
          <Link href="/login" onClick={closeMobileMenu}>
            Sign In
          </Link>
          <Link
            href="/#GetQuote"
            className="get-started-btn"
            onClick={(e) => {
              closeMobileMenu();
              handleBookRepairClick(e);
            }}
          >
            Book a Repair
          </Link>
        </div>
      </div>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div className="drawer-overlay" onClick={closeMobileMenu} />
      )}
    </div>
  );
};

export default Navbar;
