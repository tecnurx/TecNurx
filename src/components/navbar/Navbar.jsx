"use client";

import Link from "next/link";
import React, { useState } from "react";
import "./navbar.css";
import { ChevronDown, Menu, X } from "lucide-react";
import logo from "@/assets/images/logo.png";
import book from "@/assets/images/book.svg";
import track from "@/assets/images/track.svg";
import Image from "next/image";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const toggleMobileDropdown = (e) => {
    e.stopPropagation();
    setMobileDropdownOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileDropdownOpen(false);
  };

  return (
    <div className="navbar-wrap">
      <nav className="navbar">
        <Link href="/">
          <Image src={logo} alt="logo" width={120} />
        </Link>

        <nav className="nav-links">
          <Link href="#">About us</Link>

          <div className="test">
            <button className="dropdown">
              Repairs
              <ChevronDown size={18} color="black" />
            </button>
            <div className="dropdown-list">
              <Link href="/dashboard/book-repair">
                <Image src={book} alt="book" width={40} height={40} />
                <div>
                  <h4>Book Repair</h4>
                  <p>
                    Get a quote, then get your device fixed quickly and easily
                    by an expert
                  </p>
                </div>
              </Link>
              <Link href="/track-repair">
                <Image src={track} alt="track" width={40} height={40} />
                <div>
                  <h4>Track Repair</h4>
                  <p>
                    Stay up-to-date with real-time tracking of your device's
                    repair progress
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <Link href="/insurance">Insurance</Link>
        </nav>

        <div className="auth-btns">
          <Link href="/login">Sign In</Link>
          <Link href="/register">Get Started</Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={28} color="black" />
        </button>
      </nav>

      {/* Mobile Side Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <Image src={logo} alt="logo" width={140} />
          <button onClick={closeMobileMenu}>
            <X size={28} color="black" />
          </button>
        </div>

        <div className="drawer-links">
          <Link href="#" onClick={closeMobileMenu}>
            About us
          </Link>

          {/* Repairs Dropdown in Mobile */}
          <div className="mobile-repairs-section">
            <button
              className="mobile-repairs-toggle"
              onClick={toggleMobileDropdown}
            >
              Repairs
              <ChevronDown
                size={20}
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
                <Image src={book} alt="book" width={32} height={32} />
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
                <Image src={track} alt="track" width={32} height={32} />
                <div>
                  <h4>Track Repair</h4>
                  <p>
                    Stay up-to-date with real-time tracking of your device's
                    repair progress
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <Link href="/insurance" onClick={closeMobileMenu}>
            Insurance
          </Link>
        </div>

        <div className="drawer-auth">
          <Link href="/login" onClick={closeMobileMenu}>
            Sign In
          </Link>
          <Link
            href="/register"
            className="get-started-btn"
            onClick={closeMobileMenu}
          >
            Get Started
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
