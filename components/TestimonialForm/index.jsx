"use client";
import React, { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { FaStar } from "react-icons/fa";
import Link from "next/link";

export default function TestimonialForm({ onSuccess }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Preserve the current location (with query + anchor) so login returns here
  const callbackUrl = useMemo(() => {
    const qs = searchParams?.toString();
    const base = qs ? `${pathname}?${qs}` : pathname || "/testimonials";
    return `${base}#testimonial-form`;
  }, [pathname, searchParams]);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    role: "Customer",
    message: "",
    rating: 5,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please log in to submit a testimonial");
      return;
    }

    if (formData.message.length < 10) {
      toast.error("Please write a more detailed testimonial");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to submit testimonial");
      }

      toast.success("Thank you! Your testimonial will appear on our page.");
      setFormData({
        name: session?.user?.name || "",
        role: "Customer",
        message: "",
        rating: 5,
      });
      onSuccess?.();
      router.push("/#testimonials");
    } catch (error) {
      toast.error(error.message || "Failed to submit testimonial");
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-soft" id="testimonial-form">
        <p className="mb-4 text-slate-600">
          Please log in to share your experience
        </p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="inline-flex rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          Log In
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
      id="testimonial-form"
    >
      <h3 className="mb-4 text-xl font-bold text-slate-900">
        Share Your Experience
      </h3>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Your Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          required
        />
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Your Role
        </label>
        <input
          type="text"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          placeholder="e.g., Homebuyer, Renter, Seller"
          className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className="transition hover:scale-110"
            >
              <FaStar
                className={`h-6 w-6 ${
                  star <= formData.rating
                    ? "text-amber-400"
                    : "text-slate-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Your Testimonial
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={4}
          maxLength={500}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Share your experience with us..."
          required
        />
        <p className="mt-1 text-xs text-slate-500">
          {formData.message.length}/500 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Testimonial"}
      </button>
    </form>
  );
}
