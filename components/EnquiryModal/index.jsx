"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import { useSession } from "next-auth/react";

const EnquiryModal = ({ open, onClose, property }) => {
  const { data: session } = useSession();
  const lastUserIdRef = useRef(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState(""); // honeypot anti-spam
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const sessionName = session?.user?.name;
    const sessionEmail = session?.user?.email;
    if (sessionName && !name) setName(sessionName);
    if (sessionEmail && !email) setEmail(sessionEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.name, session?.user?.email]);

  useEffect(() => {
    const currentId = session?.user?.id || null;
    if (lastUserIdRef.current && lastUserIdRef.current !== currentId) {
      setName(session?.user?.name || "");
      setEmail(session?.user?.email || "");
      setPhone("");
      setMessage("");
    }
    lastUserIdRef.current = currentId;
  }, [session?.user?.id, session?.user?.name, session?.user?.email]);

  if (!open || !property) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name,
        email,
        phone,
        message,
        recipient: property.owner,
        property: property._id,
        hp,
      };
      const res = await axios.post("/api/messages", payload);
      if (res.status >= 200 && res.status < 300) {
        toast.success("Enquiry sent successfully");
        onClose();
      } else {
        toast.error(res?.data?.message || "Failed to send enquiry");
      }
    } catch (err) {
      if (err?.response?.status === 429) {
        toast.error("Too many attempts. Please wait a minute and try again.");
      } else {
        toast.error(err?.response?.data?.message || "Failed to send enquiry");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold">Enquire about {property?.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring h-28"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <FaPaperPlane className="mr-2" /> {submitting ? "Sending..." : "Send Enquiry"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnquiryModal;
