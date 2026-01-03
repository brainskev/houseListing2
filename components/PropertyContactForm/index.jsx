"use client";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import Link from "next/link";
const PropertyContactForm = ({ property }) => {
  const { data: session } = useSession();
  const lastUserIdRef = useRef(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState(""); // honeypot field
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      // Reset contact form fields on user change
      setName(session?.user?.name || "");
      setEmail(session?.user?.email || "");
      setPhone("");
      setMessage("");
      setIsSubmitted(false);
    }
    lastUserIdRef.current = currentId;
  }, [session?.user?.id, session?.user?.name, session?.user?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      propertyId: property._id,
      message,
      contactName: name,
      contactEmail: email,
      contactPhone: phone,
      hp,
    };
    try {
      const response = await axios.post("/api/enquiries", data);
      if (response.status >= 200 && response.status < 300) {
        toast.success("Your chat has been opened. We will reply here.");
        setIsSubmitted(true);
        // Scroll to top on mobile after sending
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (response.status === 400 || response.status === 401) {
        toast.error(response?.data?.message);
      } else {
        toast.error("Error Sending Form.");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to open chat");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* <h3 className="text-xl font-semibold tracking-tight mb-6">Contact Property Manager</h3> */}
      {!session ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">You must be logged in to send a message.</p>
          <Link
            href={`/login?callbackUrl=/properties/${property?._id}`}
            className="inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Log in to message
          </Link>
        </div>
      ) : isSubmitted ? (
        <p className="text-green-500  mb-4">
          Your message has been sent successfully
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
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
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Name:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Enter your name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="phone"
            >
              Phone:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="phone"
              type="text"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="message"
            >
              Message:
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-44 focus:outline-none focus:shadow-outline"
              id="message"
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div>
            <button
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline flex items-center justify-center"
              type="submit"
            >
              <FaPaperPlane className="mr-2" /> Send Message
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PropertyContactForm;
