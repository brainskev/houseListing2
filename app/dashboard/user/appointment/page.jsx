"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function UserAppointmentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const presetPropertyId = searchParams.get("propertyId") || "";
  const presetPropertyName = searchParams.get("propertyName") || "";
  const [form, setForm] = useState({ name: "", phone: "", propertyId: presetPropertyId, date: "" });
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
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
    if (loading || isPending) return; // prevent duplicate submissions
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Something went wrong");
      toast.success("Viewing booked successfully.");
      startTransition(() => {
        router.push("/dashboard/user/appointments");
      });
    } catch (err) {
      const msg = err?.message || "Failed to book appointment";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Book a Viewing Appointment</h1>
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
        <div>
          <label className="block text-sm font-medium text-slate-700">Property</label>
          <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
            {presetPropertyName || "Select a property"}
          </div>
          <input type="hidden" name="propertyId" value={form.propertyId} readOnly />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Date</label>
          <input
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || isPending}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading || isPending ? "Booking..." : "Book Viewing"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
