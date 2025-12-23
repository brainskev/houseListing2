"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";

export default function ContactForm() {
  const { data: session } = useSession();
  const lastUserIdRef = useRef(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState(""); // honeypot field for anti-spam
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // success | error | null

  useEffect(() => {
    const sessionName = session?.user?.name;
    if (sessionName && !name) setName(sessionName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.name]);

  useEffect(() => {
    const currentId = session?.user?.id || null;
    if (lastUserIdRef.current && lastUserIdRef.current !== currentId) {
      setName(session?.user?.name || "");
      setPhone("");
      setMessage("");
    }
    lastUserIdRef.current = currentId;
  }, [session?.user?.id, session?.user?.name]);

  // Contact form is open to all users; session used only for prefill

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await axios.post("/api/contact", { name, phone, message, hp });
      if (res.status === 201) {
        setStatus("success");
        setName("");
        setPhone("");
        setMessage("");
        setHp("");
      } else {
        setStatus("error");
      }
    } catch (err) {
      if (err?.response?.status === 429) {
        setStatus("rate-limit");
      } else {
        setStatus("error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot field: hidden from users & screen readers */}
      <input
        type="text"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-10000px", height: 0, width: 0, opacity: 0 }}
      />
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
      {status === "rate-limit" && (
        <p className="text-xs text-amber-600">Too many attempts. Please wait a minute and try again.</p>
      )}
    </form>
  );
}
