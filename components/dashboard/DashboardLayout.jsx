"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiMail, FiCalendar, FiUsers, FiFileText, FiSettings, FiMessageSquare } from "react-icons/fi";
import useEnquiries from "@/hooks/useEnquiries";
import useAppointments from "@/hooks/useAppointments";

const linksConfig = {
  admin: [
    { href: "/dashboard/admin/properties", label: "Properties", Icon: FiHome },
    { href: "/dashboard/admin/enquiries", label: "Enquiries", Icon: FiMail, showCount: true },
    { href: "/dashboard/admin/appointments", label: "Viewing Appointments", Icon: FiCalendar, showCount: true },
    { href: "/dashboard/admin/messages", label: "Messages", Icon: FiMessageSquare },
    { href: "/dashboard/admin/users", label: "User Management", Icon: FiUsers },
    { href: "/dashboard/admin/blog", label: "Blog", Icon: FiFileText },
    { href: "/dashboard/admin/settings", label: "Settings", Icon: FiSettings },
  ],
  assistant: [
    { href: "/dashboard/assistant", label: "Enquiries", Icon: FiMail, showCount: true },
    { href: "/dashboard/assistant/appointments", label: "Viewing Appointments", Icon: FiCalendar, showCount: true },
    { href: "/dashboard/assistant/blog", label: "Blog", Icon: FiFileText },
    { href: "/dashboard/assistant/settings", label: "Settings", Icon: FiSettings },
  ],
};

const DashboardLayout = ({ role = "admin", title, children }) => {
  const pathname = usePathname();
  const links = linksConfig[role] || [];
  const { enquiries = [] } = useEnquiries();
  const { appointments = [] } = useAppointments();

  const newEnquiriesCount = enquiries.filter((e) => e.status === "new").length;
  const pendingAppointmentsCount = appointments.filter((a) => a.status === "pending").length;

  const cx = (...classes) => classes.filter(Boolean).join(" ");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
          <aside className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="px-6 py-5 border-b border-slate-100">
              <p className="text-sm text-slate-500">Dashboard</p>
              <h2 className="text-xl font-semibold text-slate-900 capitalize">{role}</h2>
            </div>
            <nav className="flex flex-col p-3">
              {links.map((link) => {
                const active = pathname === link.href;
                const Icon = link.Icon;
                const count = link.showCount
                  ? link.label.includes("Enquiries")
                    ? newEnquiriesCount
                    : link.label.includes("Appointments")
                    ? pendingAppointmentsCount
                    : 0
                  : 0;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cx(
                      "rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50",
                      active && "bg-slate-100 text-slate-900"
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2">
                        {Icon && <Icon className="text-slate-500" size={18} />}
                        <span>{link.label}</span>
                      </span>
                      {count > 0 && (
                        <span className="inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                          {count}
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <section className="space-y-4">
            {title && <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>}
            <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100 p-4 lg:p-6">
              {children}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
