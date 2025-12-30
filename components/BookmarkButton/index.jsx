"use client";
import React, { useState, useEffect } from "react";
import { FaBookmark } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { apiDomain } from "@/utils/requests";

const BookmarkButton = ({ property, className = "" }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;
    const checkBookmarkStatus = async () => {
      try {
        setLoading(true);
        const res = await axios.post(`${apiDomain}/bookmark/check`, {
          propertyId: property._id,
        });
        if (res?.status === 200) {
          setIsBookmarked(res?.data?.isBookmarked);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    checkBookmarkStatus();
  }, [property._id, userId]);

  const handleClick = async () => {
    if (!userId) {
      const returnUrl = typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search || ""}`
        : "/";
      router.push(`/login?callbackUrl=${encodeURIComponent(returnUrl)}&bookmark=${property._id}`);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${apiDomain}/bookmark`, {
        propertyId: property._id,
      });
      if (res?.status === 200) {
        toast.success(res?.data?.message);
        setIsBookmarked(res?.data?.isBookmarked);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition ${
        isBookmarked
          ? "border-brand-200 bg-brand-50 text-brand-700"
          : "border-gray-200 text-gray-700 hover:bg-gray-50"
      } ${loading ? "opacity-70 cursor-not-allowed" : ""} ${className}`.trim()}
    >
      <FaBookmark className={isBookmarked ? "text-brand-600" : "text-gray-500"} />
      {isBookmarked ? "Saved" : "Save"}
    </button>
  );
};

export default BookmarkButton;
