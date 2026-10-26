import Image from "next/image";
import React from "react";
import logo from "@/assets/images/foot-logo.svg";
import abtechcare from "@/assets/images/abtechcare.png";
import call from "@/assets/images/call.svg";
import mail from "@/assets/images/mail.svg";
import pin from "@/assets/images/pin.svg";
import tecnurx from "@/assets/images/tecnurx.svg";
import Link from "next/link";
import "@/components/footer/footer.css";

const Footer = ({ newsPaperWrap }) => {
  return (
    <footer>
      <div className="footer-center-wrap">
        <div
          className={`newsletter-wrap ${
            newsPaperWrap
              ? "newsletter-wrap-true newletter-wrap-true"
              : "newsletter-wrap-false newletter-wrap-false"
          }`}
        >
          <div className="newsletter-card-wrapper">
            <svg
              className="curve-left"
              viewBox="0 0 36 36"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M 0,0 Q 36,0 36,36 L 36,0 Z"
                fill="var(--newsletter-bg-above, #ffffff)"
              />
            </svg>

            <div className="newsletter">
              <div className="newsletter-text">
                <h2>Newsletter</h2>
                <p>Sign up for our newsletter</p>
              </div>
              <div className="input-button">
                <input type="email" placeholder="Email address" />
                <button type="submit">Submit</button>
              </div>
            </div>

            <svg
              className="curve-right"
              viewBox="0 0 36 36"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M 0,36 Q 0,0 36,0 L 0,0 Z"
                fill="var(--newsletter-bg-above, #ffffff)"
              />
            </svg>
          </div>
        </div>

        <div className="footer-main">
          <div className="foot-brand-col">
            <div className="foot-logo-top">
              <Image src={logo} alt="TecNurx" className="foot-logo" />
            </div>
            <div className="foot-product-of">
              <Image
                src={abtechcare}
                alt="A digital product of: AbTechCare RC 8318381"
                className="abtechcare-logo"
              />
            </div>
          </div>

          <div className="foot-content-col">
            <div className="foot-sections-grid">
              <div className="foot-block">
                <h3>company</h3>
                <Link href="/terms-conditions">Terms & Conditions</Link>
                <Link href="/privacy-policy">Privacy Policy</Link>
              </div>

              <div className="foot-block">
                <h3>our services</h3>
                <Link href="/dashboard/book-repair">Gadget Repair</Link>
                <Link href="#">Gadget Sales</Link>
                <Link href="/insurance">Gadget Insurance</Link>
                <Link href="/track-repair">Track Repair</Link>
                <Link href="/#GetQuote">Get a Quote</Link>
              </div>

              <div className="foot-block foot-block-contact">
                <h3>contact us</h3>
                <div className="addy-block">
                  <h4>Nigeria</h4>
                  <p>
                    <Image src={pin} alt="location" />
                    21 Kodesho Street, Computer Village, Lagos State
                  </p>
                  <p>
                    <Image src={call} alt="telephone" />
                    +234 916 870 1802
                  </p>
                  <p>
                    <Image src={mail} alt="mail" />
                    contact@tecnurx.com
                  </p>
                </div>
                <div className="addy-block addy-block2">
                  <h4>china</h4>
                  <p>
                    <Image src={pin} alt="location" />
                    所在地区: 广东省佛山市南海区大沥镇 详细地址:
                    教育路与沙溪路交叉口东北方向90米一番街E座0722
                  </p>
                  <p>
                    <Image src={call} alt="telephone" />
                    +86 159 2016 5954
                  </p>
                  <p>
                    <Image src={mail} alt="mail" />
                    contact@tecnurx.com
                  </p>
                </div>
              </div>
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
        </div>

        <div className="copyright">
          <p>
            © AB Tech Care International Limited. All rights reserved,{" "}
            {new Date().getFullYear()}
          </p>
        </div>

        <div className="footer-imgtext">
          <Image src={tecnurx} alt="floor image" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
