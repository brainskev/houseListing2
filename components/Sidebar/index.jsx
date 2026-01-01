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
import useEnquiries from "@/hooks/useEnquiries";
import { useSession } from "next-auth/react";

const Sidebar = ({ current, onChange }) => {
  const { dashboardSidebarOpen, setDashboardSidebarOpen } = useGlobalContext();
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { enquiries } = useEnquiries({ enabled: !!userId, poll: false });

  const totalUnread = enquiries.reduce((acc, e) => {
    const counts = e?.unreadCountByUser || {};
    const val = userId ? (typeof counts.get === "function" ? counts.get(userId) : counts[userId]) : 0;
    return acc + (Number(val) || 0);
  }, 0);

  const items = [
    { key: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { key: "bookmarks", label: "My Bookmarks", icon: <FaBookmark /> },
    { key: "appointments", label: "Viewing Appointments", icon: <FaCalendar /> },
    { key: "messages", label: "Messages", icon: <FaComments />, unread: totalUnread },
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
              <span className="relative text-gray-600">
                {item.icon}
                {item.unread > 0 && (
                  <span className="absolute -top-1 -right-2 inline-flex min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {item.unread > 99 ? "99+" : item.unread}
                  </span>
                )}
              </span>
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
      {/* Overlay for mobile to close drawer on outside click */}
      {dashboardSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/10 md:hidden"
          onClick={() => setDashboardSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </aside>
  );
};

export default Sidebar;
