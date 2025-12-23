"use client";
import React, { useCallback, useState } from "react";
import { FaShareAlt } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ShareArticleButton({ url, title, className = "" }) {
  const [loading, setLoading] = useState(false);

  const handleShare = useCallback(async () => {
    try {
      setLoading(true);
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
        return;
      }
      toast.error("Sharing is not supported in this browser");
    } catch (err) {
      console.error("Share error", err);
      toast.error("Unable to share right now");
    } finally {
      setLoading(false);
    }
  }, [title, url]);

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 ${
        loading ? "opacity-70 cursor-not-allowed" : ""
      } ${className}`.trim()}
    >
      <FaShareAlt /> Share
    </button>
  );
}
