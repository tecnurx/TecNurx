import React from "react";
import "./privacy.css";
import Footer from "@/components/footer/Footer";

const PrivacyPolicy = () => {
  return (
    <div>
      <div className="privacy-wrap">
        <h1>
          <span>Policy </span> Privacy
        </h1>
        <div className="write-up">
          <h2>1. Who we are</h2>
          <p>
            TecNurx is a device-care platform operated by AB Tech Care
            International Limited (RC 8318381), at 21 Kodesho Street, Computer
            Village, Lagos State, Nigeria. We are responsible for personal
            information we collect for our platform and services, subject to any
            separate responsibilities of our service partners. This Policy
            applies when you browse our website, create an account, book a
            repair, register a device, make a payment, contact support or use an
            available device-care service. It also covers personal information
            from engineers, vendors, couriers and business representatives who
            work with us.
          </p>
          <h2>2. Information We Collect</h2>
          <ul>
            <li>
              <b>Account and contact details:</b> name, email, phone number,
              login and verification information, and pickup or delivery
              addresses.
            </li>
            <li>
              <b>Device and service details:</b> brand, model, serial number or
              IMEI where needed, photographs, proof of ownership, stated faults,
              diagnostic findings, quotations, repair status and service
              history.
            </li>
            <li>
              <b>Transaction and protection details:</b> amounts, payment
              references, receipts and refund records; where insurance is
              available, policy or claim information needed to support an
              application or claim.
            </li>
            <li>
              <b>Platform and communications data:</b> IP address, browser or
              device information, security logs, necessary cookies, messages,
              feedback and support records.
            </li>
            <li>
              <b> For engineers, suppliers and couriers: </b> business contacts,
              qualifications or verification details, service areas, job records
              and payment details as needed to manage the working relationship.
            </li>
          </ul>
          <h2>3. Why we use it</h2>
          <p>
            We process information to operate accounts, verify and manage
            devices, price and deliver repairs, coordinate engineers and
            pickups, process payments and refunds, respond to complaints,
            prevent fraud and meet legal obligations. Where an insurance service
            is lawfully available, relevant details may also be used to support
            applications or claims. Our lawful bases may include performance of
            a contract, legal obligations, legitimate interests where
            appropriate, and consent for activities that require it. We send
            optional marketing only where permitted, and you may opt out of it
            without losing essential service messages.
          </p>
          <h2>4. Who receives this information</h2>
          <p>
            We share only information reasonably needed with assigned engineers,
            parts suppliers, collection and delivery providers, authorised
            payment institutions, hosting or communications providers, and
            insurers or authorised insurance intermediaries where relevant. We
            may disclose information to regulators or other authorities when
            legally required. Partners may act on our instructions or, where
            they determine their own processing purposes (such as an insurer or
            bank), under their own privacy notices. We do not sell customer
            personal information to data brokers.
          </p>
          <h2>5. Privacy of information stored on your device</h2>
          <p>
            Repairs may involve brief technical access to your device. Our
            personnel and service partners must not browse, copy or disclose
            your personal files for unrelated purposes. We seek specific
            authorisation where a repair requires a reset, access to protected
            functions or another step with a material data-loss risk. Please
            back up important files and remove or secure sensitive accounts
            where practical. Never provide banking PINs, one-time passwords or
            recovery phrases. These precautions do not remove our legal
            responsibility to handle devices and information appropriately.
          </p>
          <h2>6. Security, storage and international services</h2>
          <p>
            We apply appropriate access, confidentiality, technical and
            organisational safeguards and investigate suspected personal-data
            incidents. Where the law requires, we notify the regulator or
            affected people of a qualifying breach. We keep data only as long as
            needed for the relevant service, warranty, accounts, fraud
            prevention, complaints or legal obligations, then delete or
            anonymise it when appropriate. Hosting or other providers may
            process data outside Nigeria only subject to applicable cross-border
            transfer safeguards.
          </p>
          <h2>7. Your choices and rights</h2>
          <p>
            Subject to the Nigeria Data Protection Act 2023, you may request
            access to or correction or deletion of eligible information, object
            to certain uses, request restriction or portability where
            applicable, and withdraw consent where consent is the lawful basis.
            Some records must be retained for legal, transaction or dispute
            purposes. You may also complain to the Nigeria Data Protection
            Commission (ndpc.gov.ng). The main account and transaction services
            are intended for adults aged 18 and over; an authorised adult may
            act for a minor where lawful. For website tracking choices, see our
            Cookie Notice.
          </p>
          <h2>8. Contact and changes</h2>
          <p>
            Send privacy requests to tecnurx@gmail.com or write to our
            registered address above. We may verify your identity before
            releasing information. We will update this notice when our practices
            materially change and seek any additional consent required by law.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
