import Image from "next/image";
import React from "react";
import logo from "@/assets/images/foot-logo.svg";
import ig from "@/assets/images/ig.svg";
import linkedin from "@/assets/images/linkedin.png";
import whatsapp from "@/assets/images/whatsapp.png";
import x from "@/assets/images/x.png";
import fb from "@/assets/images/fb.svg";
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
          <div className="foot-block foot-block-img">
            <Image src={logo} alt="logo" />
          </div>
          <div>
            <div className="foot-block-wrap">
              <div className="foot-block foot-block-1">
                <h3>company</h3>
                {/* <Link href="#">About Us</Link> */}
                <Link href="/terms-conditions">Terms & Conditions</Link>
                <Link href="/privacy-policy">Privacy Policy</Link>
              </div>
              <div className="foot-block  foot-block-1">
                <h3>our services</h3>
                <Link href="/dashboard/book-repair">Gadget Repair</Link>
                <Link href="#">Flexible Payment</Link>
                <Link href="/insurance">Gadget Insurance</Link>
                <Link href="#">Pickup & Delivery</Link>
                <Link href="track-repair/">Track Repair</Link>
                <Link href="/#GetQuote">Get a Quote</Link>
              </div>
            </div>
            {/* <Link className="social-icon hide-ig" target="_blank" href="#">
              <Image src={ig} alt="Instagram" />
              Instagram
            </Link> */}
          </div>
          <div className="foot-contact">
            <div>
              <div className="foot-block-addy">
                <h2>Contact us</h2>
                <div className="addy-block">
                  <h3>Nigeria</h3>
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
                  <h3>china</h3>
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
          </div>
        </div>

        <div className="social-master">
          <div className="social-wrap">
            <a
              className="social-icon"
              target="_blank"
              href="https://www.facebook.com/share/1YogVQf4Wf/?mibextid=wwXIfr"
            >
              <Image src={fb} alt="Facebook" />
              Facebook
            </a>
            <a
              className="social-icon"
              target="_blank"
              href="https://www.instagram.com/tecnurx/"
            >
              <Image src={ig} alt="Instagram" />
              Instagram
            </a>
            <a
              className="social-icon"
              target="_blank"
              href="https://x.com/TecNurx"
            >
              <Image src={x} alt="X" className="x-icon" />
              Twitter
            </a>
            <a
              className="social-icon"
              target="_blank"
              href="https://www.linkedin.com/company/tecnurx/"
            >
              <Image src={linkedin} alt="LinkedIn" />
              LinkedIn
            </a>
            <a
              className="social-icon"
              target="_blank"
              href="https://wa.me/2349132367306"
            >
              <Image src={whatsapp} alt="Whatsapp" />
              Whatsapp
            </a>
          </div>
        </div>

        <div className="copyright">
          <p>© TecNurx All rights reserved, {new Date().getFullYear()}</p>
        </div>

        <div className="footer-imgtext">
          <Image src={tecnurx} alt="floor image" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
