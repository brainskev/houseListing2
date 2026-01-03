import React from "react";
import TestimonialForm from "@/components/TestimonialForm";

export const metadata = {
  title: "Share Your Experience | Real Estate Hub",
  description: "Share your experience with our services",
};

export default function TestimonialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-slate-900">
            Share Your Experience
          </h1>
          <p className="text-lg text-slate-600">
            We'd love to hear about your experience with us. Your feedback helps us improve and helps others make informed decisions.
          </p>
        </div>

        <TestimonialForm />

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-6">
          <h3 className="mb-2 font-semibold text-blue-900">
            What happens next?
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Your testimonial will be reviewed by our team</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Once approved, it will appear on our homepage</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>You'll help future clients make informed decisions</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
