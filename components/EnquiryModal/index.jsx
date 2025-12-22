"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPaperPlane, FaTimes } from "react-icons/fa";

const EnquiryModal = ({ open, onClose, property }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      };
      const res = await axios.post("/api/messages", payload);
      if (res.status >= 200 && res.status < 300) {
        toast.success("Enquiry sent successfully");
        onClose();
      } else {
        toast.error(res?.data?.message || "Failed to send enquiry");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send enquiry");
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
