import React from "react";
import "../privacy-policy/privacy.css";
import Footer from "@/components/footer/Footer";

const TermsConditions = () => {
  return (
    <div>
      <div className="privacy-wrap">
        <h1>
          <span>Terms </span> & Conditions
        </h1>
        <div className="write-up">
          <h2>1. Introduction</h2>
          <p>
            By using TecNurx’s services, you agree to comply with these terms
            and conditions.
          </p>
          <h2>2. Services Offered</h2>
          <p>
            TecNurx provides gadget repair services, including pickup,
            diagnosis, repair, insurance, and installment payment options.
          </p>
          <h2>3. Service Process</h2>
          <ul>
            <li>Customers submit repair requests through our platform.</li>
            <li>Estimated costs are provided before repairs commence.</li>
            <li>Repairs are conducted by certified technicians.</li>
            <li>
              Customers must approve additional costs before extra work is
              performed.
            </li>
          </ul>
          <h2>4. Payment Terms</h2>
          <ul>
            <li>
              Payments must be made upfront, via installment plans, or upon
              completion of service.
            </li>
            <li>
              Unpaid balances may result in delays or withholding of repaired
              devices.
            </li>
          </ul>
          <h2>5. Warranty & Liability</h2>
          <ul>
            <li>
              Repairs come with a limited warranty (terms depend on the repair
              type).
            </li>
            <li>
              TecNurx is not liable for pre-existing damages or additional
              faults occurring post-repair.
            </li>
            <li>
              Data loss during repairs is not covered; customers should back up
              their data before service.
            </li>
          </ul>
          <h2>6. Pickup & Delivery</h2>
          <ul>
            <li>
              Pickup and delivery services are available based on location.
            </li>
            <li>
              Customers must ensure accurate pickup details to avoid delays.
            </li>
          </ul>
          <h2>7. Termination of Service</h2>
          <p>
            TecNurx reserves the right to refuse service due to non-compliance,
            fraudulent claims, or unpaid balances.
          </p>
          <h2>8. Governing Law</h2>
          <p>These terms are governed by the laws of Nigeria.</p>
          <h2>9. Contact Information</h2>
          <ul>
            <p>For inquiries, reach out to us at:</p>
            <li>support@tecnurx.com</li>
            <li>+234 916 870 1802</li>
            <li>www.tecnurx.com</li>
          </ul>
        </div>
      </div>
       <Footer />
    </div>
  );
};

export default TermsConditions;
