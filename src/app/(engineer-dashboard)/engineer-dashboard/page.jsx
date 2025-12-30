"use client";

import React, { useState, useEffect } from "react";
import "./engineer.css";

const EngineerDashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading your dashboard...</p>
        <div className="respinner"></div>
      </div>
    );
  }
  return (
    <div className="admin-dashboard">
      <h1>Welcome to Engineer Dashboard</h1>
    </div>
  );
};

export default EngineerDashboard;
