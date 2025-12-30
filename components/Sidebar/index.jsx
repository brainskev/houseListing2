"use client";
import React from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FaHome,
  FaBookmark,
  FaEnvelope,
  FaCalendar,
  FaComments,
  FaUserCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useGlobalContext } from "@/context/GlobalContext";

const Sidebar = ({ current, onChange }) => {
  const { dashboardSidebarOpen, setDashboardSidebarOpen } = useGlobalContext();
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
    setDashboardSidebarOpen(false);
    // If a consumer manages the tabs, delegate
    if (onChange) {
      if (["messages"].includes(key)) {
        router.push("/messages");
        return;
      }
      if (["profile"].includes(key)) {
        router.push("/profile");
        return;
      }
      onChange(key);
      return;
    }
    // Otherwise, navigate to the corresponding pages
    switch (key) {
      case "dashboard":
        router.push("/dashboard/user");
        break;
      case "bookmarks":
        router.push("/properties/saved");
        break;
      case "enquiries":
        router.push("/dashboard/user/enquiry");
        break;
      case "appointments":
        router.push("/dashboard/user/appointments");
        break;
      case "messages":
        router.push("/messages");
        break;
      case "profile":
        router.push("/profile");
        break;
      default:
        router.push("/dashboard/user");
    }
  };

  return (
    <aside className="relative">
      {/* Sidebar drawer */}
      <div
        className={`fixed md:static top-0 left-0 z-30 h-full md:h-auto w-64 md:w-64 transform bg-white shadow md:shadow-none transition-transform md:translate-x-0 max-h-screen overflow-y-auto pt-20 md:pt-0 ${
          dashboardSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b hidden md:block">
          <h2 className="text-lg font-semibold">My Dashboard</h2>
        </div>
        <nav className="p-4 space-y-2">
          <button
            onClick={() => router.push("/")}
            className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-gray-100"
          >
            <span className="text-gray-600"><FaHome /></span>
            <span className="font-medium text-gray-800">Back to Home</span>
          </button>
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
