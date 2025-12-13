"use client";
import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaBookmark,
  FaEnvelope,
  FaCalendar,
  FaComments,
  FaUserCog,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = ({ current, onChange }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const items = [
    { key: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { key: "bookmarks", label: "My Bookmarks", icon: <FaBookmark /> },
    { key: "enquiries", label: "My Enquiries", icon: <FaEnvelope /> },
    { key: "appointments", label: "Viewing Appointments", icon: <FaCalendar /> },
    { key: "messages", label: "Messages", icon: <FaComments /> },
    { key: "profile", label: "Profile / Settings", icon: <FaUserCog /> },
  ];

  const handleNavigate = (key) => {
    setOpen(false);
    if (["messages"].includes(key)) {
      router.push("/messages");
      return;
    }
    if (["profile"].includes(key)) {
      router.push("/profile");
      return;
    }
    onChange?.(key);
  };

  return (
    <aside className="relative">
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 inline-flex items-center justify-center rounded-md bg-white p-2 shadow hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle sidebar"
      >
        {open ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 z-30 h-full md:h-auto w-64 md:w-64 transform bg-white shadow md:shadow-none transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b hidden md:block">
          <h2 className="text-lg font-semibold">My Dashboard</h2>
        </div>
        <nav className="p-4 space-y-2">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavigate(item.key)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-gray-100 ${
                current === item.key ? "bg-gray-100" : ""
              }`}
            >
              <span className="text-gray-600">{item.icon}</span>
              <span className="font-medium text-gray-800">{item.label}</span>
            </button>
          ))}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-4 flex w-full items-center gap-3 rounded-lg bg-red-50 px-3 py-2 text-left text-red-600 hover:bg-red-100"
          >
            <FaSignOutAlt />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
