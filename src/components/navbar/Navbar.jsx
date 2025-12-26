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
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
              <Link href="/book-repair">
                <Image src={book} alt="book" />{" "}
                <div>
                  <h4>Book Repair</h4>
                  <p>
                    Get a quote,then get your device fixed quickly and easily by
                    an expert
                  </p>
                </div>
              </Link>
              <Link href="/track-repair">
                {" "}
                <Image src={track} alt="track" />{" "}
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
          {/* <Link href="#">Buy a device</Link> */}
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
          {" "}
          MENU
          <Menu size={28} color="black" />
        </button>
      </nav>

      {/* Mobile Side Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <Image src={logo} alt="logo" width={160} height={34} />
          <button onClick={() => setMobileMenuOpen(false)}>
            <X size={28} color="black" />
          </button>
        </div>

        <div className="drawer-links">
          <Link href="#" onClick={() => setMobileMenuOpen(false)}>
            About us
          </Link>
          <Link href="/insurance" onClick={() => setMobileMenuOpen(false)}>
            Insurance
          </Link>
          {/* <Link href="#" onClick={() => setMobileMenuOpen(false)}>
            Buy a device
          </Link> */}

          {/* Repairs Section in Mobile */}
          <div className="mobile-repairs-section">
            <span>Repairs</span>
            <Link
              href="/book-repair"
              className="mobile-repair-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              <h4>Book Repair</h4>
            </Link>
            <Link
              href="/track-repair"
              className="mobile-repair-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              <h4>Track Repair</h4>
            </Link>
          </div>
        </div>

        <div className="drawer-auth">
          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
            Sign In
          </Link>
          <Link
            href="/register"
            className="get-started-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="drawer-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Navbar;
