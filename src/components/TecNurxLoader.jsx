"use client";

import React, { useRef, useEffect } from "react";
import "./tecnurx-loader.css";

/**
 * TecNurxLoader - Brand animated logo loader component
 * Dynamically removes the off-white/beige background from the animated video
 * via real-time alpha chroma-keying on HTML5 Canvas for true 100% transparency.
 *
 * @param {boolean} fullScreen - Fixed full-viewport overlay
 * @param {"sm" | "md" | "lg" | "xl" | number} size - Predefined size or custom px width
 * @param {string} text - Optional status text displayed below the logo
 * @param {string | number} minHeight - Minimum height for inline loader
 * @param {string} className - Additional CSS class name
 * @param {React.CSSProperties} style - Custom inline styles
 */
export default function TecNurxLoader({
  fullScreen = false,
  size = "md",
  text = "",
  minHeight,
  className = "",
  style = {},
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let animId;
    let isMounted = true;

    // Canvas rendering context with optimized frequent reads
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    // Target internal canvas resolution for sharp retina rendering
    const TARGET_WIDTH = 640;
    const TARGET_HEIGHT = 360; // 16:9 aspect ratio

    if (canvas.width !== TARGET_WIDTH || canvas.height !== TARGET_HEIGHT) {
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;
    }

    // Thresholds for background extraction
    const THRESH_MIN = 20;
    const THRESH_MAX = 45;
    const THRESH_MIN_SQ = THRESH_MIN * THRESH_MIN;
    const THRESH_MAX_SQ = THRESH_MAX * THRESH_MAX;
    const RANGE = THRESH_MAX - THRESH_MIN;

    const render = () => {
      if (!isMounted) return;

      // Only process when video has available frame data
      if (video.readyState >= 2 && !video.paused && !video.ended) {
        ctx.drawImage(video, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

        const imgData = ctx.getImageData(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
        const data = imgData.data;
        const totalPixels = data.length;

        // Sample background color from a 3x3 patch in the top-left corner
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        for (let y = 1; y <= 3; y++) {
          for (let x = 1; x <= 3; x++) {
            const idx = (y * TARGET_WIDTH + x) * 4;
            sumR += data[idx];
            sumG += data[idx + 1];
            sumB += data[idx + 2];
          }
        }
        const bgR = sumR / 9;
        const bgG = sumG / 9;
        const bgB = sumB / 9;

        // Key out the background color into transparent alpha channel
        for (let i = 0; i < totalPixels; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const dr = r - bgR;
          const dg = g - bgG;
          const db = b - bgB;
          const distSq = dr * dr + dg * dg + db * db;

          if (distSq <= THRESH_MIN_SQ) {
            // Background -> 100% transparent
            data[i + 3] = 0;
          } else if (distSq < THRESH_MAX_SQ) {
            // Anti-aliased feathering on edges of tiles
            const dist = Math.sqrt(distSq);
            data[i + 3] = Math.round(((dist - THRESH_MIN) / RANGE) * 255);
          }
          // Otherwise keep alpha 255 (solid logo tile)
        }

        ctx.putImageData(imgData, 0, 0);
      }

      animId = requestAnimationFrame(render);
    };

    // Ensure playback triggers across all browsers
    const startPlayback = () => {
      video.play().catch(() => {});
      if (!animId) {
        animId = requestAnimationFrame(render);
      }
    };

    video.addEventListener("loadeddata", startPlayback);
    video.addEventListener("canplay", startPlayback);

    startPlayback();

    return () => {
      isMounted = false;
      if (animId) cancelAnimationFrame(animId);
      video.removeEventListener("loadeddata", startPlayback);
      video.removeEventListener("canplay", startPlayback);
    };
  }, []);

  const sizeClass = typeof size === "string" ? `loader-size-${size}` : "";
  const customWidth = typeof size === "number" ? `${size}px` : undefined;

  const containerClasses = [
    "tecnurx-loader-container",
    fullScreen ? "is-fullscreen" : "is-inline",
    sizeClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inlineStyles = {
    ...(minHeight && !fullScreen ? { minHeight } : {}),
    ...style,
  };

  return (
    <div className={containerClasses} style={inlineStyles}>
      <div className="tecnurx-loader-media-box">
        {/* Hidden video decoder source */}
        <video
          ref={videoRef}
          src="/tecnurx-loader.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none",
            zIndex: -1,
          }}
          aria-hidden="true"
        />

        {/* Visible Canvas with 100% transparent keyed background */}
        <canvas
          ref={canvasRef}
          className="tecnurx-loader-canvas"
          style={customWidth ? { width: customWidth, maxWidth: "100%" } : undefined}
          aria-label="Loading..."
        />
      </div>
      {text ? <p className="tecnurx-loader-text">{text}</p> : null}
    </div>
  );
}
