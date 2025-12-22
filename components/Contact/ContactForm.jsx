"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";

export default function ContactForm() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // success | error | null

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await axios.post("/api/enquiries", { name, phone, message });
      if (res.status === 201) {
        setStatus("success");
        setName("");
        setPhone("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">You must be logged in to send an enquiry.</p>
        <Link
          href="/login?callbackUrl=/contact"
          className="inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          Log in to continue
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Name</label>
        <input
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Phone</label>
        <input
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Message</label>
        <textarea
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        <FaPaperPlane /> {loading ? "Sending..." : "Send Enquiry"}
      </button>
      {status === "success" && (
        <p className="text-xs text-green-600">Thanks! We’ll be in touch soon.</p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-600">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
