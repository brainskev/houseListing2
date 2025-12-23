import React from "react";

export default function StatusBadge({ status = "New", className = "" }) {
  const styles = {
    New: "bg-brand-100 text-brand-700",
    Contacted: "bg-yellow-100 text-yellow-700",
    Scheduled: "bg-brand-100 text-brand-700",
    Confirmed: "bg-green-100 text-green-700",
    Rescheduled: "bg-yellow-100 text-yellow-700",
    Cancelled: "bg-red-100 text-red-700",
    Completed: "bg-slate-100 text-slate-700",
  };
  const base = "inline-block rounded-full px-3 py-1 text-xs font-semibold";
  return <span className={`${base} ${styles[status] || styles.New} ${className}`}>{status}</span>;
}