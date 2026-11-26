"use client";

import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageLightbox({
  images = [],
  currentIndex = null,
  onClose,
  onChangeIndex,
}) {
  const isOpen = currentIndex !== null && images.length > 0;
  const activeSrc = isOpen ? images[currentIndex] : null;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      } else if (e.key === "ArrowLeft" && images.length > 1) {
        onChangeIndex?.((currentIndex - 1 + images.length) % images.length);
      } else if (e.key === "ArrowRight" && images.length > 1) {
        onChangeIndex?.((currentIndex + 1) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onChangeIndex]);

  if (!isOpen || !activeSrc) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "24px",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.25)",
          background: "rgba(17, 24, 39, 0.85)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 2002,
        }}
      >
        <X size={20} />
      </button>

      {/* Previous Button */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChangeIndex?.((currentIndex - 1 + images.length) % images.length);
          }}
          aria-label="Previous image"
          style={{
            position: "fixed",
            left: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(17, 24, 39, 0.85)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 2002,
          }}
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Image Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <img
          src={activeSrc}
          alt={`Preview ${currentIndex + 1}`}
          style={{
            maxWidth: "90vw",
            maxHeight: "82vh",
            objectFit: "contain",
            borderRadius: "12px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            background: "#111827",
          }}
        />
        {images.length > 1 && (
          <span
            style={{
              color: "#e5e7eb",
              fontSize: "13px",
              fontWeight: 600,
              background: "rgba(17, 24, 39, 0.75)",
              padding: "4px 12px",
              borderRadius: "9999px",
            }}
          >
            {currentIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Next Button */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChangeIndex?.((currentIndex + 1) % images.length);
          }}
          aria-label="Next image"
          style={{
            position: "fixed",
            right: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(17, 24, 39, 0.85)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 2002,
          }}
        >
          <ChevronRight size={22} />
        </button>
      )}
    </div>
  );
}
