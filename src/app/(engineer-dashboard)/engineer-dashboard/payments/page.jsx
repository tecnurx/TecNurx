"use client";

import React, { useState, useEffect } from "react";
import "../engineer.css";
import { engService } from "../../../../../services/eng/eng";
import Link from "next/link";

const PaymentPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);

  // Fetch  data
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        const paymentResponse = await engService.getEngineerPayments();
        setPayments(paymentResponse.data.payments);
      } catch (err) {
        console.error("Failed to load repairs:", err);
        setError(err.message || "Failed to load your repairs.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="engcardd">
        <div className="table-split">
          <h3>My Payments ({payments.length}) </h3>
          <Link href="/engineer-dashboard/payments">View all</Link>
        </div>
        <div className="table-container">
          {payments.length === 0 ? (
            <p className="empty-state">No payments yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Fault Fixed</th>
                  <th>Date Initiated</th>
                  <th>Payment Status</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.transactionId}>
                    <td>#{payment.transactionId}</td>
                    <td>
                      {payment.repairId.device.brand}{" "}
                      {payment.repairId.device.model} -{" "}
                      {payment.repairId.issueCategory.replace(/_/g, " ")}
                    </td>
                    <td>{new Date(payment.dateInitiated).toLocaleString()}</td>
                    <td className={`payment-${payment.status}`}>
                      {payment.status}
                    </td>
                    <td>
                      ₦
                      {(
                        payment.repairId?.estimatedCost?.totalCost || 0
                      ).toLocaleString()}
                    </td>
                    <td>
                      <Link
                        href={`/engineer-dashboard/payments/${payment._id}`}
                        className="view-repair"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
