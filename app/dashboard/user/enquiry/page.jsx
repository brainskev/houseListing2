"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function UserEnquiryPage() {
  const searchParams = useSearchParams();
  const presetPropertyId = searchParams.get("propertyId") || "";
  const presetPropertyName = searchParams.get("propertyName") || "";
  const [form, setForm] = useState({ name: "", phone: "", message: "", propertyId: presetPropertyId });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (presetPropertyId) {
      setForm((prev) => ({ ...prev, propertyId: presetPropertyId }));
    }
  }, [presetPropertyId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Something went wrong");
      setSuccess("Enquiry sent successfully");
      setForm({ name: "", phone: "", message: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Make an Enquiry</h1>
      <p className="text-sm text-slate-600 mt-2">Please provide your name and phone number.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
            required
          />
        </div>
          {!presetPropertyId && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Property ID (optional)</label>
              <input
                name="propertyId"
                value={form.propertyId}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
                placeholder="Link this enquiry to a property"
              />
            </div>
          )}
        {presetPropertyId && (
          <div>
            <label className="block text-sm font-medium text-slate-700">Property</label>
            <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
              {presetPropertyName || "Linked property"}
            </div>
            <input type="hidden" name="propertyId" value={form.propertyId} readOnly />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700">Message</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Enquiry"}
        </button>
        {success && <p className="text-sm text-emerald-600">{success}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
