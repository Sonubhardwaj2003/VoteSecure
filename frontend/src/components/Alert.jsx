import React from "react";

// Infers a visual "tone" from common wording in our API messages so every
// page gets consistent green/red/blue feedback without a big refactor of
// each page's state.
function inferTone(text = "") {
  const t = text.toLowerCase();
  const negative = ["fail", "invalid", "error", "not ", "denied", "already", "could not", "reject"];
  const positive = ["success", "verified", "confirmed", "created", "added", "sent", "cast"];
  if (negative.some((w) => t.includes(w))) return "error";
  if (positive.some((w) => t.includes(w))) return "success";
  return "info";
}

const styles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-brand-200 bg-brand-50 text-brand-800",
};

const icons = {
  success: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  ),
  error: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />,
  info: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v.01M11 12h1v4h1" />,
};

export default function Alert({ message, tone }) {
  if (!message) return null;
  const resolved = tone || inferTone(message);

  return (
    <div
      role="status"
      className={`animate-fade-in flex items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm ${styles[resolved]}`}
    >
      <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
        {icons[resolved]}
      </svg>
      <span>{message}</span>
    </div>
  );
}
