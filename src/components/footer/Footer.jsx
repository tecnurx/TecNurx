import Image from "next/image";
import React from "react";
import logo from "@/assets/images/foot-logo.svg";
import ig from "@/assets/images/ig.svg";
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
            newsPaperWrap ? "newletter-wrap-true" : "newletter-wrap-false"
          }`}
        >
          <div className="newsletter">
            <div>
              <h2>Newsletter</h2>
              <p>Sign up for our newsletter</p>
            </div>
            <div className="input-button">
              <input type="email" placeholder="Email address" />
              <button>Submit</button>
            </div>
          </div>
          <div className="shape"></div>
          <div className="shape2"></div>
        </div>
        <div className="footer-main">
          <div className="foot-block foot-block-img">
            <Image src={logo} alt="logo" />
          </div>
          <div>
            <div className="foot-block-wrap">
              <div className="foot-block foot-block-1">
                <h3>company</h3>
                <Link href="#">About Us</Link>
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
            <Link className="social-icon hide-ig" target="_blank" href="#">
              <Image src={ig} alt="Instagram" />
              Instagram
            </Link>
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
              <div className="social-wrap">
                <Link className="social-icon" target="_blank" href="#">
                  <Image src={fb} alt="Instagram" />
                  Facebook
                </Link>
                <Link className="social-icon show-ig" target="_blank" href="#">
                  <Image src={ig} alt="Instagram" />
                  Instagram
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="copyright">
          <p>© TecNurx All rights reserved, 2025 </p>
        </div>
        <div className="footer-imgtext">
          <Image src={tecnurx} alt="floor image" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
