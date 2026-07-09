"use client";

import React, { useState, useEffect, use } from "react";
import { adminService } from "../../../../../.././services/admin/admin";
import { 
  ArrowLeft, 
  Download, 
  CreditCard, 
  Calendar, 
  User, 
  FileText,
  CheckCircle2,
  Clock,
  Printer,
  Smartphone,
  Wrench,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import styles from './transaction.module.css';
import '../../../../../../src/app/globals.css'; // ensure spinner CSS is available if it relies on global

export default function PaymentDetailsPage({ params }) {
  const { transactionId } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAdminPaymentbyId(transactionId);
        // Handle variations in API response structure
        setPaymentDetails(
          response.data?.payment ||
            response.data ||
            response.payment ||
            response,
        );
      } catch (err) {
        console.error("Failed to load payment details:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load payment details.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      fetchPaymentDetails();
    }
  }, [transactionId]);

  if (loading) {
    return (
      <div
        className="resolve-wrap"
        style={{
          height: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <p>Loading payment details...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '40px' }}>
        <h2 style={{ color: '#ef4444' }}>Error Loading Payment</h2>
        <p>{error}</p>
        <Link href="/admin-dashboard/transactions" style={{ color: '#3b82f6', marginTop: '16px', display: 'inline-block' }}>Back to Transactions</Link>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Payment not found</h2>
        <Link href="/admin-dashboard/transactions" style={{ color: '#3b82f6', marginTop: '16px', display: 'inline-block' }}>Back to Transactions</Link>
      </div>
    );
  }

  const { repairId, userId, amount, status, dateInitiated, paystackReference, paymentId } = paymentDetails;
  const isCompleted = status === 'success' || status === 'completed' || status === 'paid';
  const isFailed = status === 'failed';
  
  const deviceName = repairId?.device ? `${repairId.device.brand} ${repairId.device.model}` : 'Unknown Device';
  const issue = repairId?.issueCategory ? repairId.issueCategory.replace(/_/g, " ") : 'Repair Service';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Link href="/admin-dashboard/transactions" className={styles.subtitle} style={{ marginBottom: '16px', display: 'inline-flex', color: '#3b82f6', fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Transactions
          </Link>
          <h1>Transaction #{paystackReference || transactionId}</h1>
          <div className={styles.subtitle}>
            <Calendar size={16} /> {dateInitiated ? new Date(dateInitiated).toLocaleString() : 'N/A'}
            <span style={{ margin: '0 8px' }}>•</span>
            <span className={`${styles.badge} ${isCompleted ? styles.badgeSuccess : isFailed ? styles.badgeFailed : styles.badgePending}`}>
              {isCompleted ? <CheckCircle2 size={14} /> : isFailed ? <AlertCircle size={14} /> : <Clock size={14} />}
              {status || 'Pending'}
            </span>
          </div>
        </div>
        {/* <div style={{ display: 'flex', gap: '12px' }}>
          <button className={styles.actionButton}>
            <Printer size={16} /> Print
          </button>
          <button className={`${styles.actionButton} ${styles.actionPrimary}`}>
            <Download size={16} /> Export
          </button>
        </div> */}
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconYellow}`}>
              <CreditCard size={24} />
            </div>
          </div>
          <div className={styles.cardLabel}>Total Amount</div>
          <div className={styles.cardValue}>₦{Number(amount || repairId?.estimatedCost?.totalCost || 0).toLocaleString()}</div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>Ref: {paymentId || 'N/A'}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconBlue}`}>
              <User size={24} />
            </div>
          </div>
          <div className={styles.cardLabel}>Customer Information</div>
          <div className={styles.profileFlex}>
            <img src={userId?.photo || '/default-avatar.png'} alt="Customer" className={styles.avatar} />
            <div>
              <div className={styles.profileName}>{userId?.fname} {userId?.lname}</div>
              <div className={styles.profileSub}>{userId?.email}</div>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px' }}>{userId?.phoneNumber}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconGreen}`}>
              <Wrench size={24} />
            </div>
          </div>
          <div className={styles.cardLabel}>Assigned Engineer</div>
          <div className={styles.profileFlex}>
            <img src={repairId?.engineer?.photo || '/default-avatar.png'} alt="Engineer" className={styles.avatar} />
            <div>
              <div className={styles.profileName}>{repairId?.engineer?.fname} {repairId?.engineer?.lname}</div>
              <div className={styles.profileSub}>{repairId?.engineer?.email}</div>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px' }}>{repairId?.engineer?.phoneNumber}</div>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.panel}>
          <h2 className={styles.sectionTitle}><Smartphone size={20} /> Repair & Device Details</h2>
          
          <div className={styles.kvGrid}>
            <div className={styles.kvItem}>
              <span className={styles.kvKey}>Device</span>
              <span className={styles.kvVal} style={{ textTransform: 'capitalize' }}>{deviceName}</span>
            </div>
            <div className={styles.kvItem}>
              <span className={styles.kvKey}>Serial Number</span>
              <span className={styles.kvVal}>{repairId?.device?.serialNumber || 'N/A'}</span>
            </div>
            <div className={styles.kvItem}>
              <span className={styles.kvKey}>Service Type</span>
              <span className={styles.kvVal} style={{ textTransform: 'capitalize' }}>{repairId?.serviceType?.replace(/_/g, " ") || 'N/A'}</span>
            </div>
            <div className={styles.kvItem}>
              <span className={styles.kvKey}>Repair Status</span>
              <span className={styles.kvVal} style={{ textTransform: 'capitalize' }}>{repairId?.status?.replace(/_/g, " ") || 'N/A'}</span>
            </div>
          </div>

          <h2 className={styles.sectionTitle} style={{ marginTop: '32px' }}><FileText size={20} /> Invoice Breakdown</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className={styles.itemName}>{issue}</div>
                    <div className={styles.itemDesc}>{repairId?.issueDescription || 'No description provided'}</div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>₦{Number(repairId?.estimatedCost?.laborCost || 0).toLocaleString()}</td>
                </tr>
                {repairId?.estimatedCost?.partsCost > 0 && (
                  <tr>
                    <td>
                      <div className={styles.itemName}>Replacement Parts</div>
                      <div className={styles.itemDesc}>Required hardware components</div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>₦{Number(repairId?.estimatedCost?.partsCost).toLocaleString()}</td>
                  </tr>
                )}
                <tr className={styles.totalRow}>
                  <td style={{ textAlign: 'right', paddingTop: '24px' }}>Total Amount</td>
                  <td style={{ textAlign: 'right', paddingTop: '24px' }}>₦{Number(amount || repairId?.estimatedCost?.totalCost || 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* <div className={styles.panel}>
          <h2 className={styles.sectionTitle}><Clock size={20} /> Transaction Timeline</h2>
          <div className={styles.timeline}>
            <div className={`${styles.timelineItem} ${styles.active}`}>
              <div className={styles.timelineIcon}>
                <CheckCircle2 size={20} />
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineTitle}>Payment Logged</div>
                <div className={styles.timelineDesc}>Status: <span style={{ textTransform: 'capitalize' }}>{status}</span></div>
                <div className={styles.timelineTime}>{dateInitiated ? new Date(dateInitiated).toLocaleString() : 'N/A'}</div>
              </div>
            </div>
            
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <Wrench size={20} />
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineTitle}>Repair Created</div>
                <div className={styles.timelineDesc}>Ticket opened for {deviceName}</div>
                <div className={styles.timelineTime}>{repairId?.createdAt ? new Date(repairId.createdAt).toLocaleString() : 'N/A'}</div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
