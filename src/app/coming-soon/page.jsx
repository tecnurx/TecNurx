"use client";

import React, { useState, useEffect } from "react";
import "./coming-soon.css";

// Official Launch: Thursday, 26th Nov 2026 13:00 WAT (UTC+1)
const LAUNCH_DATE_WAT = new Date("2026-11-26T13:00:00+01:00").getTime();
const REGISTER_URL = "https://bit.ly/tecnurx";

export default function ComingSoonPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: "07",
    hours: "00",
    minutes: "10",
    seconds: "00",
  });
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsPreview(document.cookie.includes("preview_mode=true"));
    }

    const calculateTime = () => {
      const now = Date.now();
      const diff = Math.max(0, LAUNCH_DATE_WAT - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
  };

  return (
    <div className="cs-page">
      {/* 1. Header */}
      <header className="cs-header">
        <div className="cs-header-content">
          <img
            src="/logo.png"
            alt="TecNurx"
            className="cs-header-logo"
          />

          {isPreview && (
            <div className="cs-preview-badge">
              <span>Preview Mode (Admin Bypass)</span>
              <a href="/?exit_preview=true">Exit</a>
            </div>
          )}
        </div>
      </header>

      {/* 2. Hero Section (Spreads Edge-to-Edge, Zero Box Grid, Zero Outer Padding) */}
      <section className="cs-hero-section">
        <div className="cs-hero-container">
          {/* Desktop Banner (1440x584) */}
          <div className="cs-desktop-hero-banner">
            <img
              src="/hero-pc.svg"
              alt="The Nurx Experience - Official Product Launch"
              className="cs-desktop-hero-img"
            />

            {/* Live Countdown Timer Grid inside Desktop Grey Container */}
            <div className="cs-desktop-timer-overlay">
              <div className="cs-pc-time-box">
                <span className="cs-pc-time-num">{timeLeft.days}</span>
                <span className="cs-pc-time-lbl">DAYS</span>
                <div className="cs-pc-time-bar" />
              </div>
              <div className="cs-pc-time-box">
                <span className="cs-pc-time-num">{timeLeft.hours}</span>
                <span className="cs-pc-time-lbl">HOURS</span>
                <div className="cs-pc-time-bar" />
              </div>
              <div className="cs-pc-time-box">
                <span className="cs-pc-time-num">{timeLeft.minutes}</span>
                <span className="cs-pc-time-lbl">MINUTES</span>
                <div className="cs-pc-time-bar" />
              </div>
              <div className="cs-pc-time-box">
                <span className="cs-pc-time-num">{timeLeft.seconds}</span>
                <span className="cs-pc-time-lbl">SECONDS</span>
                <div className="cs-pc-time-bar" />
              </div>
            </div>

            {/* Clickable Register Button Overlay on Desktop Black Pill */}
            <a
              href={REGISTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cs-desktop-register-overlay"
              aria-label="Register Here"
            />
          </div>

          {/* Mobile Banner (390x664) */}
          <div className="cs-mobile-hero-banner">
            <img
              src="/hero-mobile.svg"
              alt="The Nurx Experience - Official Product Launch"
              className="cs-mobile-hero-img"
            />

            {/* Live Countdown Timer Grid inside Mobile Grey Container */}
            <div className="cs-mobile-timer-overlay">
              <div className="cs-mob-time-box">
                <span className="cs-mob-time-num">{timeLeft.days}</span>
                <span className="cs-mob-time-lbl">DAYS</span>
                <div className="cs-mob-time-bar" />
              </div>
              <div className="cs-mob-time-box">
                <span className="cs-mob-time-num">{timeLeft.hours}</span>
                <span className="cs-mob-time-lbl">HOURS</span>
                <div className="cs-mob-time-bar" />
              </div>
              <div className="cs-mob-time-box">
                <span className="cs-mob-time-num">{timeLeft.minutes}</span>
                <span className="cs-mob-time-lbl">MINUTES</span>
                <div className="cs-mob-time-bar" />
              </div>
              <div className="cs-mob-time-box">
                <span className="cs-mob-time-num">{timeLeft.seconds}</span>
                <span className="cs-mob-time-lbl">SECONDS</span>
                <div className="cs-mob-time-bar" />
              </div>
            </div>

            {/* Clickable Register Button on Mobile Black Pill */}
            <a
              href={REGISTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cs-mobile-register-overlay"
            >
              Register Here
            </a>
          </div>
        </div>
      </section>

      {/* 3. Newsletter Section with Curved Wings (Per Footer.jsx Reference) */}
      <div className="newsletter-wrap newsletter-wrap-true newletter-wrap-true">
        <div className="newsletter-card-wrapper">
          <svg
            className="curve-left"
            viewBox="0 0 36 40"
            preserveAspectRatio="none"
            aria-hidden="true"
            shapeRendering="geometricPrecision"
          >
            <path
              d="M 0,0 L 36,0 L 36,40 Q 36,4 0,4 Z"
              fill="#ffffff"
            />
          </svg>

          <div className="newsletter">
            <div className="newsletter-text">
              <h2>Newsletter</h2>
              <p>Sign up for our newsletter</p>
            </div>

            <form onSubmit={handleSubscribe} className="input-button">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">
                {subscribed ? "Subscribed" : "Submit"}
              </button>
            </form>
          </div>

          <svg
            className="curve-right"
            viewBox="0 0 36 40"
            preserveAspectRatio="none"
            aria-hidden="true"
            shapeRendering="geometricPrecision"
          >
            <path
              d="M 0,0 L 36,0 L 36,4 Q 0,4 0,40 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </div>

      {/* 4. Footer Section (Per Footer.jsx Reference) */}
      <footer className="footer">
        <div className="footer-center-wrap">
          {/* Main Footer Row: Brand Col on Left, Social Col on Right */}
          <div className="cs-footer-row">
            <div className="cs-brand-col">
              <img
                src="/soon-logo.svg"
                alt="TecNurx"
                className="foot-logo"
              />
            </div>

            <div className="social-wrap">
              <a
                className="social-icon"
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.instagram.com/tecnurx/"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect width="24" height="24" rx="6" fill="white" />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7ZM9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12Z"
                    fill="#080808"
                  />
                  <circle cx="17.5" cy="6.5" r="1.2" fill="#080808" />
                </svg>
                <span>Instagram</span>
              </a>

              <a
                className="social-icon"
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.linkedin.com/company/tecnurx/"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect width="24" height="24" rx="5" fill="white" />
                  <path
                    d="M7 10H9.5V18H7V10ZM8.25 6C7.42 6 6.75 6.67 6.75 7.5C6.75 8.33 7.42 9 8.25 9C9.08 9 9.75 8.33 9.75 7.5C9.75 6.67 9.08 6 8.25 6ZM11 10H13.4V11.1H13.45C13.8 10.45 14.65 9.8 15.85 9.8C18.35 9.8 18.8 11.45 18.8 13.6V18H16.3V14.1C16.3 13.15 16.28 11.95 15 11.95C13.7 11.95 13.5 12.95 13.5 14.05V18H11V10Z"
                    fill="#080808"
                  />
                </svg>
                <span>LinkedIn</span>
              </a>

              <a
                className="social-icon"
                target="_blank"
                rel="noopener noreferrer"
                href="https://x.com/TecNurx"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect width="24" height="24" rx="5" fill="white" />
                  <path
                    d="M14.7 6.5H16.8L12.2 11.8L17.6 19H13.4L10.1 14.7L6.3 19H4.2L9.1 13.4L4 6.5H8.3L11.3 10.4L14.7 6.5ZM13.9 17.7H15.1L7.7 7.7H6.4L13.9 17.7Z"
                    fill="#080808"
                  />
                </svg>
                <span>X (Twitter)</span>
              </a>

              <a
                className="social-icon"
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.facebook.com/share/1YogVQf4Wf/?mibextid=wwXIfr"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect width="24" height="24" rx="5" fill="white" />
                  <path
                    d="M15 8.5H13.5C12.7 8.5 12.5 8.9 12.5 9.5V11H15L14.7 13.5H12.5V20H9.5V13.5H7.5V11H9.5V9.1C9.5 7.1 10.7 6 12.5 6C13.4 6 14.2 6.1 14.4 6.1V8.5H15Z"
                    fill="#080808"
                  />
                </svg>
                <span>Facebook</span>
              </a>

              <a
                className="social-icon"
                target="_blank"
                rel="noopener noreferrer"
                href="https://wa.me/2349132367306"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect width="24" height="24" rx="12" fill="white" />
                  <path
                    d="M12 5C8.13 5 5 8.13 5 12C5 13.38 5.4 14.67 6.1 15.77L5 19.5L8.87 18.45C9.83 18.96 10.89 19.25 12 19.25C15.87 19.25 19 16.12 19 12.25C19 8.38 15.87 5 12 5ZM15.5 14.8C15.35 15.22 14.75 15.55 14.3 15.65C14 15.72 13.6 15.77 12 15.1C10 14.25 8.7 12.2 8.6 12.07C8.5 11.94 7.8 11.01 7.8 10.05C7.8 9.09 8.3 8.62 8.5 8.42C8.7 8.22 8.9 8.17 9.1 8.17C9.2 8.17 9.3 8.17 9.4 8.18C9.6 8.18 9.7 8.19 9.8 8.45C9.95 8.82 10.3 9.7 10.35 9.79C10.4 9.88 10.42 9.98 10.36 10.1C10.3 10.22 10.25 10.29 10.16 10.4C10.07 10.51 9.98 10.6 9.89 10.72C9.79 10.82 9.68 10.93 9.8 11.13C9.92 11.33 10.33 12 10.94 12.54C11.72 13.23 12.36 13.45 12.58 13.54C12.8 13.63 12.92 13.61 13.05 13.46C13.18 13.31 13.6 12.82 13.73 12.63C13.86 12.44 14 12.47 14.18 12.53C14.36 12.59 15.32 13.06 15.52 13.16C15.72 13.26 15.85 13.31 15.9 13.4C15.95 13.49 15.95 13.96 15.5 14.8Z"
                    fill="#080808"
                  />
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Copyright Line */}
          <div className="copyright">
            <p>
              © AB Tech Care International Limited. All rights reserved, 2026
            </p>
          </div>

          {/* Floor Image (Desktop only per footer.css) */}
          <div className="footer-imgtext">
            <img src="/tecnurx.svg" alt="floor image" />
          </div>
        </div>
      </footer>
    </div>
  );
}
