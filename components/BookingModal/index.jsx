"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCalendarPlus, FaTimes } from "react-icons/fa";

const BookingModal = ({ open, onClose, property }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open || !property) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name,
        phone,
        propertyId: property._id,
        date,
      };
      const res = await axios.post("/api/appointments", payload);
      if (res.status >= 200 && res.status < 300) {
        toast.success("Viewing appointment requested");
        onClose();
      } else {
        toast.error(res?.data?.message || "Failed to request appointment");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to request appointment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold">Book viewing: {property?.name}</h3>
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
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date & Time</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <FaCalendarPlus className="mr-2" /> {submitting ? "Booking..." : "Book Viewing"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
