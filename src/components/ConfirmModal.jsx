"use client";

import React from "react";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // 'danger' | 'warning' | 'info'
  isLoading = false,
  showCancel = true,
  zIndex = 25000,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: <AlertTriangle size={24} color="#dc2626" />,
      iconBg: "#fef2f2",
      confirmBtnBg: "#dc2626",
      confirmBtnHover: "#b91c1c",
      confirmBtnColor: "#ffffff",
    },
    warning: {
      icon: <AlertCircle size={24} color="#d97706" />,
      iconBg: "#fffbeb",
      confirmBtnBg: "#ffc400",
      confirmBtnHover: "#e6b000",
      confirmBtnColor: "#000000",
    },
    info: {
      icon: <Info size={24} color="#2563eb" />,
      iconBg: "#eff6ff",
      confirmBtnBg: "#2563eb",
      confirmBtnHover: "#1d4ed8",
      confirmBtnColor: "#ffffff",
    },
  };

  const config = typeConfig[type] || typeConfig.danger;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: zIndex || 25000,
        padding: "16px",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "440px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
          animation: "scaleIn 0.15s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "24px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: config.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {config.icon}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "17px", fontWeight: "700", color: "#111827" }}>
              {title}
            </h3>
            <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", lineHeight: "1.5" }}>
              {message}
            </p>
          </div>

          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              padding: "4px",
              borderRadius: "4px",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            padding: "14px 24px",
            backgroundColor: "#f9fafb",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              style={{
                padding: "9px 16px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                color: "#374151",
                fontSize: "14px",
                fontWeight: "500",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: "9px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: config.confirmBtnBg,
              color: config.confirmBtnColor,
              fontSize: "14px",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
