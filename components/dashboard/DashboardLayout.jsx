"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const linksConfig = {
  admin: [
    { href: "/dashboard/admin", label: "Enquiries" },
    { href: "/dashboard/admin/appointments", label: "Viewing Appointments" },
    { href: "/dashboard/admin/properties", label: "Properties" },
    { href: "/dashboard/admin/users", label: "User Management" },
    { href: "/dashboard/admin/settings", label: "Settings" },
  ],
  assistant: [
    { href: "/dashboard/admin", label: "Enquiries" },
    { href: "/dashboard/admin/appointments", label: "Viewing Appointments" },
    { href: "/dashboard/admin/properties", label: "Properties" },
    { href: "/dashboard/admin/users", label: "Users (View Only)" },
    { href: "/dashboard/admin/settings", label: "Settings" },
  ],
};

const DashboardLayout = ({ role = "admin", title, children }) => {
  const pathname = usePathname();
  const links = linksConfig[role] || [];

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
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cx(
                      "rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50",
                      active && "bg-slate-100 text-slate-900"
                    )}
                  >
                    {link.label}
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
