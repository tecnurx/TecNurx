import React from 'react'
import './privacy.css'
import Footer from '@/components/footer/Footer';

const PrivacyPolicy = () => {
  return (
    <div>
      <div className="privacy-wrap">
        <h1>
          <span>Policy </span> Privacy
        </h1>
        <div className="write-up">
          <h2>1. Introduction</h2>
          <p>
            TecNurx values your privacy and is committed to protecting your
            personal information. This Privacy Policy outlines how we collect,
            use, and safeguard your data when you use our services.
          </p>
          <h2>2. Information We Collect</h2>
          <ul>
            <li>
              Personal Information (e.g., Name, Contact Information, Address)
            </li>
            <li>
              Device Information (e.g., Model, Serial Number, Issue Description)
            </li>
            <li>
              Payment Information (for transactions and installment payments)
            </li>
            <li>Usage Data (Website interactions, Cookies, IP Address)</li>
          </ul>
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To provide and improve our services</li>
            <li>To process repair orders and payments</li>
            <li>To communicate with you about your repairs</li>
            <li>To comply with legal obligations</li>
            <li>For marketing and promotional purposes (with your consent)</li>
          </ul>
          <h2>4. Data Protection & Security</h2>
          <p>
            We implement strong security measures to protect your data from
            unauthorized access, alteration, or disclosure. However, no method
            of transmission over the internet is 100% secure.
          </p>
          <h2>5. Sharing of Information</h2>
          <ul>
            <p>We do not sell your data. However, we may share it with:</p>
            <li>
              Service partners (technicians, logistics, payment processors)
            </li>
            <li>Legal authorities if required by law</li>
          </ul>
          <h2>6. Your Rights</h2>
          <ul>
            <li>Request access to your data</li>
            <li>Request correction or deletion of your data</li>
            <li>Opt out of marketing communications</li>
          </ul>
          <h2>7. Changes to the Privacy Policy</h2>
          <p>
            We may update this policy periodically. Please review it regularly.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PrivacyPolicy