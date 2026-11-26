"use client";

import React from "react";
import Image from "next/image";
import logo from "@/assets/images/logo.png";
import "./PrintableReceipt.css";

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

export default function PrintableReceipt({
  title = "Payment Receipt",
  reference = "—",
  date = "—",
  status = "Paid",
  totalAmount = 0,
  leftDetails = [],
  rightDetails = [],
  lineItems = [],
  footerNote = "This is an official TecNurx payment receipt.",
}) {
  return (
    <div className="tnx-print-receipt">
      <div className="tnx-receipt-header">
        <div>
          <Image
            src={logo}
            alt="TecNurx"
            width={130}
            height={32}
            priority
            loading="eager"
            style={{ width: "130px", height: "auto", marginBottom: "6px", display: "block" }}
          />
          <p className="tnx-receipt-brand-sub">Certified Device Repair &amp; Protection</p>
        </div>

        <div className="tnx-receipt-meta">
          <h2 className="tnx-receipt-doc-title">{title}</h2>
          <p className="tnx-receipt-doc-id">Ref: {reference}</p>
          <p className="tnx-receipt-doc-id">Date: {date}</p>
        </div>
      </div>

      <div className="tnx-receipt-amount-box">
        <div>
          <span className="tnx-receipt-amount-label">Amount Paid</span>
          <span className="tnx-receipt-amount-val">{formatNaira(totalAmount)}</span>
        </div>
        <span className="tnx-receipt-status-tag">{status}</span>
      </div>

      {(leftDetails.length > 0 || rightDetails.length > 0) && (
        <div className="tnx-receipt-two-col">
          {leftDetails.length > 0 && (
            <div>
              <h3 className="tnx-receipt-section-title">Repair &amp; Device</h3>
              {leftDetails.map((item, idx) => (
                <div key={idx} className="tnx-receipt-kv">
                  <span>{item.label}</span>
                  <strong>{item.value || "—"}</strong>
                </div>
              ))}
            </div>
          )}

          {rightDetails.length > 0 && (
            <div>
              <h3 className="tnx-receipt-section-title">Payment Details</h3>
              {rightDetails.map((item, idx) => (
                <div key={idx} className="tnx-receipt-kv">
                  <span>{item.label}</span>
                  <strong>{item.value || "—"}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {lineItems.length > 0 && (
        <table className="tnx-receipt-table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => (
              <tr key={idx}>
                <td>{item.label}</td>
                <td className="num">{formatNaira(item.amount)}</td>
              </tr>
            ))}
            <tr className="tnx-receipt-total-row">
              <td>Total Paid</td>
              <td className="num">{formatNaira(totalAmount)}</td>
            </tr>
          </tbody>
        </table>
      )}

      <div className="tnx-receipt-footer">
        {footerNote} Generated on {new Date().toLocaleDateString()}.
      </div>
    </div>
  );
}
