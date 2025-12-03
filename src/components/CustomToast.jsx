// components/CustomToast.tsx
"use client";

import { useEffect, useState } from "react";
import "./toast.css";
import { Check, X, AlertCircle, Loader2 } from "lucide-react";

// Toast storage
const toasts = [];
let toastId = 0;

const addToast = (type, message, duration = 5000) => {
  const id = `toast-${++toastId}`;
  toasts.push({ id, type, message, duration });

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }

  document.dispatchEvent(new Event("toast-update"));
};

const removeToast = (id) => {
  const index = toasts.findIndex((t) => t.id === id);
  if (index !== -1) {
    toasts.splice(index, 1);
    document.dispatchEvent(new Event("toast-update"));
  }
};

// Export toast globally
export const toast = {
  success: (msg) => addToast("success", msg, 4000),
  error: (msg) => addToast("error", msg, 6000),
  loading: (msg) => addToast("loading", msg, 0),
  info: (msg) => addToast("info", msg, 5000),
};

export default function CustomToast() {
  const [list, setList] = useState([]);

  useEffect(() => {
    const handler = () => setList([...toasts]);
    document.addEventListener("toast-update", handler);
    return () => document.removeEventListener("toast-update", handler);
  }, []);

  if (list.length === 0) return null;

  return (
    <div className="custom-toast-container">
      {list.map((t) => (
        <div
          key={t.id}
          className={`custom-toast custom-toast-${t.type}`}
          onClick={() => removeToast(t.id)}
        >
          {/* ICONS */}
          <div className="custom-toast-icon">
            {t.type === "success" && <Check size={24} strokeWidth={3} />}
            {t.type === "error" && <X size={24} strokeWidth={3} />}
            {t.type === "loading" && <Loader2 size={24} className="animate-spin" />}
            {t.type === "info" && <AlertCircle size={24} strokeWidth={2.5} />}
          </div>

          {/* MESSAGE */}
          <div className="custom-toast-message">{t.message}</div>

          {/* CLOSE BUTTON (except loading) */}
          {t.type !== "loading" && (
            <button
              className="custom-toast-close"
              onClick={(e) => {
                e.stopPropagation();
                removeToast(t.id);
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}