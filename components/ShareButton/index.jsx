"use client";
import React, { useCallback, useState } from "react";
import { FaShareAlt } from "react-icons/fa";
import { toast } from "react-toastify";

const ShareButton = ({ property, className = "" }) => {
  const [loading, setLoading] = useState(false);
  const shareUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/properties/${property._id}`;

  const handleShare = useCallback(async () => {
    try {
      setLoading(true);
      if (navigator?.share) {
        await navigator.share({
          title: property?.name,
          text: property?.description,
          url: shareUrl,
        });
        return;
      }

      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard");
        return;
      }

      toast.error("Sharing is not supported in this browser");
    } catch (error) {
      console.error("Share error", error);
      toast.error("Unable to share right now");
    } finally {
      setLoading(false);
    }
  }, [property?.description, property?.name, shareUrl]);

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition text-sm ${
        loading ? "opacity-70 cursor-not-allowed" : ""
      } ${className}`.trim()}
    >
      <FaShareAlt /> Share
    </button>
  );
};

export default ShareButton;
