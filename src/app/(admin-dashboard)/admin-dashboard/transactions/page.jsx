import React from "react";
import "./adtran.css";

const AdminTransactions = () => {
  const recentTransactions = [
    {
      orderNo: "#ORDER12345",
      reference: "100004250321004101294447195544",
      type: "Credit",
      amount: "₦15,000",
      date: "23/05/2025, 11:59:05",
      status: "Completed",
    },
    {
      orderNo: "#ORDER12348",
      reference: "REF2025052418302254639012",
      type: "Debit",
      amount: "₦8,450",
      date: "24/05/2025, 18:32:14",
      status: "Completed",
    },
    {
      orderNo: "#ORDER12352",
      reference: "FT258964123202505250942",
      type: "Credit",
      amount: "₦45,000",
      date: "25/05/2025, 09:42:33",
      status: "Completed",
    },
    {
      orderNo: "#ORDER12357",
      reference: "100009876543210987654321",
      type: "Debit",
      amount: "₦3,200",
      date: "25/05/2025, 14:17:09",
      status: "Completed",
    },
    {
      orderNo: "#ORDER12361",
      reference: "100009876543210987654321",
      type: "Debit",
      amount: "₦133,500",
      date: "26/05/2025, 08:13:22",
      status: "Completed",
    },
    {
      orderNo: "#ORDER12364",
      reference: "100009876543210987654321",
      type: "Debit",
      amount: "₦24,780",
      date: "26/05/2025, 11:42:55",
      status: "Completed",
    },
    {
      orderNo: "#ORDER12368",
      reference: "100009876543210987654321",
      type: "Credit",
      amount: "₦205,500",
      date: "27/05/2025, 17:45:19",
      status: "Completed",
    },
    {
      orderNo: "#ORDER12371",
      reference: "1000042505280098765432198765",
      type: "Debit",
      amount: "₦125,000",
      date: "28/05/2025, 10:08:44",
      status: "Completed",
    },
    {
      orderNo: "#ORDER12374",
      reference: "100009876543210987654321",
      type: "Debit",
      amount: "₦56,900",
      date: "29/05/2025, 13:04:30",
      status: "Completed",
    },
    {
      orderNo: "#ORDER12379",
      reference: "REFUND_ORD12345_PARTIAL",
      type: "Credit",
      amount: "₦93,200",
      date: "30/05/2025, 09:15:12",
      status: "Completed",
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Transactions</h1>
      </div>
      <div className="adcard">
        <div className="adtable-container">
          <table className="addata-table">
            <thead>
              <tr>
                <th>Order No.</th>
                <th>Reference</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{transaction.orderNo}</td>
                  <td>{transaction.reference}</td>
                  <td>{transaction.type}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.date}</td>
                  <td>{transaction.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;
