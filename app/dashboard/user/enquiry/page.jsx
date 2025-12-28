"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import useEnquiries from "@/hooks/useEnquiries";
import EnquiryTable from "@/components/dashboard/EnquiryTable";

export default function UserEnquiryPage() {
  const { data: session } = useSession();
  const lastUserIdRef = useRef(null);
  const { enquiries, loading, error, refresh } = useEnquiries();
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetPropertyId = searchParams.get("propertyId") || "";
  const presetPropertyName = searchParams.get("propertyName") || "";
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "", propertyId: presetPropertyId, hp: "" });

  useEffect(() => {
    if (presetPropertyId) {
      setShowForm(true);
      setForm((prev) => ({ ...prev, propertyId: presetPropertyId }));
    }
  }, [presetPropertyId]);

  useEffect(() => {
    const sessionName = session?.user?.name;
    if (sessionName && !form.name) {
      setForm((prev) => ({ ...prev, name: sessionName }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.name]);

  useEffect(() => {
    // If role elevates, route to appropriate dashboard
    const role = session?.user?.role;
    if (role === "admin") router.replace("/dashboard/admin/enquiries");
    if (role === "assistant") router.replace("/dashboard/assistant/enquiries");
  }, [session?.user?.role, router]);

  useEffect(() => {
    const currentId = session?.user?.id || null;
    if (lastUserIdRef.current && lastUserIdRef.current !== currentId) {
      // Clear sensitive input when user switches
      setForm((prev) => ({
        name: session?.user?.name || "",
        phone: "",
        message: "",
        propertyId: prev.propertyId,
      }));
      setShowForm(false);
    }
    lastUserIdRef.current = currentId;
  }, [session?.user?.id, session?.user?.name]);

  const openMessageForEnquiry = (enquiry) => {
    if (!enquiry?._id) return;
    const params = new URLSearchParams({ enquiryId: enquiry._id });
    if (enquiry.propertyId) {
      const pid = enquiry.propertyId._id || enquiry.propertyId;
      params.set("propertyId", pid);
    }
    router.push(`/messages?${params.toString()}`);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.status === 429) {
        throw new Error("Too many attempts. Please wait a minute and try again.");
      }
      if (!res.ok) throw new Error(data?.message || "Failed to submit enquiry");
      setShowForm(false);
      setForm({ name: "", phone: "", message: "", propertyId: "" });
      await refresh();
    } catch (err) {
      // Surface minimal inline error; could use toast here if desired
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Your Enquiries</h1>
          <p className="mt-1 text-sm text-slate-600">Track the status of your enquiries and message admin.</p>
        </div>
        <button onClick={refresh} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50">Refresh</button>
      </div>
      {!presetPropertyId && (
        <div className="mb-4 rounded-md border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          To create a new enquiry, open a property and click <span className="font-semibold">Make an Enquiry</span>.
        </div>
      )}
      {showForm && presetPropertyId && (
        <div className="mb-6 rounded-xl border border-slate-100 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Make an Enquiry</h2>
          {presetPropertyId && (
            <p className="text-xs text-slate-600 mt-1">About: {presetPropertyName || "Linked property"}</p>
          )}
          <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Honeypot field: invisible and non-interactive */}
            <input
              type="text"
              value={form.hp}
              onChange={(e) => setForm({ ...form, hp: e.target.value })}
              aria-hidden="true"
              tabIndex={-1}
              autoComplete="off"
              style={{ position: "absolute", left: "-10000px", height: 0, width: 0, opacity: 0 }}
            />
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
            <div className="md:col-span-2">
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
            <div className="md:col-span-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Enquiry"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {!presetPropertyId && showForm && (
        <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          Please start an enquiry from a property page.
        </div>
      )}
      {loading && (
        <div className="py-10 text-center text-slate-500">Loading enquiries…</div>
      )}
      {error && (
        <div className="mb-4 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {!showForm && !loading && !error && (
        <EnquiryTable enquiries={enquiries} userMode onOpenMessage={openMessageForEnquiry} />
      )}
    </div>
  );
}
