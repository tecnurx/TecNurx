// components/Graph.jsx
"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import './graph.css'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const AdminGraph = () => {
  const data = {
    labels: [
      "Jan 2026",
      "Feb 2026",
      "Mar 2026",
      "Apr 2026",
      "May 2026",
      "Jun 2026",
      "Jul 2026",
      "Aug 2026",
      "Sep 2026",
      "Oct 2026",
      "Nov 2026",
      "Dec 2026",
    ],
    datasets: [
      {
        label: "Transaction Flow",
        data: [
          200000, 400000, 600000, 700000, 750000, 850000, 0, 0,
          0, 0, 0, 0,
        ],
        backgroundColor: "#ffc400", // amber-500 (matches your yellow/orange theme)
        borderColor: "#f59e0b", // darker amber
        borderWidth: 1,
        borderRadius: 8,
        hoverBackgroundColor: "#d39e16", // lighter on hover    
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // hide legend since title is clear
      },
      title: {
        display: true,
        text: "Monthly Transaction Flow",
        font: {
          size: 18,
          weight: "bold",
        },
        color: "#1f2937",
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleFont: { size: 14 },
        bodyFont: { size: 14 },
        callbacks: {
          label: (context) => `₦${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#e5e7eb",
        },
        ticks: {
          color: "#6b7280",
          callback: (value) => `₦${value.toLocaleString()}`,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="graph-container">
      {/* Header */}
      <h2 className="graph-header">Transaction Flow</h2>

      {/* Chart Container */}
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default AdminGraph;
