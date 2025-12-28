"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hp }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
        setHp("");
      } else {
        if (res.status === 429) {
          setStatus("Too many attempts. Please wait a minute and try again.");
        } else {
          const text = await res.text();
          setStatus(text || "error");
        }
      }
    } catch (err) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      {/* Honeypot field: invisible and non-interactive */}
      <input
        type="text"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-10000px", height: 0, width: 0, opacity: 0 }}
      />
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="w-full rounded-md border border-gray-300 bg-white/90 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Joining..." : "Join"}
        </button>
      </div>
      {status === "success" ? (
        <p className="text-xs text-green-600">Thanks! You’re on the list.</p>
      ) : status && status !== "error" ? (
        <p className="text-xs text-red-600">{String(status)}</p>
      ) : status === "error" ? (
        <p className="text-xs text-red-600">Something went wrong. Try again.</p>
      ) : null}
    </form>
  );
}
