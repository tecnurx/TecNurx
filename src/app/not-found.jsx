// src/app/not-found.tsx
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/images/logo.png";
import "./not-found.css";

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <Link href="/" className="logo-link">
          <Image src={logo} alt="TecNurx Logo" width={150} />
        </Link>

        <div className="error-code">404</div>

        <h1>Page Not Found</h1>

        <p>
          Oops! The page you're looking for doesn't exist. It might have been
          moved or deleted.
        </p>

        <div className="actions">
          <Link href="/" className="home-btn">
            Back to Home
          </Link>
          <Link href="/dashboard/book-repair" className="secondary-btn">
            Book a Repair
          </Link>
        </div>

        {/* <div className="illustration">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="#FFC400"
              strokeWidth="8"
              fill="none"
              opacity="0.2"
            />
            <path
              d="M60 80 L80 100 L60 120"
              stroke="#999"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M140 80 L120 100 L140 120"
              stroke="#999"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="80" cy="90" r="8" fill="#999" />
            <circle cx="120" cy="90" r="8" fill="#999" />
            <path
              d="M70 130 Q100 150 130 130"
              stroke="#999"
              strokeWidth="6"
              fill="none"
            />
          </svg>
        </div> */}
      </div>
    </div>
  );
}
