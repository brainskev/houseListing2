"use client";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Spinner from "@/components/Spinner";
import Sidebar from "@/components/Sidebar";

export default function UserDashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/user");
    }
  }, [status, router]);

  useEffect(() => {
    // If a user with elevated role lands on user dashboard, redirect appropriately
    const role = session?.user?.role;
    if (!role) return;
    if (role === "admin") router.replace("/dashboard/admin");
    if (role === "assistant") router.replace("/dashboard/assistant");
  }, [session?.user?.role, router]);

  if (status === "loading") {
    return <Spinner loading={true} />;
  }

  if (!session) return null;

  const current = (() => {
    if (pathname?.includes("/appointments")) return "appointments";
    if (pathname?.includes("/enquiry")) return "enquiries";
    if (pathname?.includes("/profile")) return "profile";
    if (pathname?.includes("/messages")) return "messages";
    if (pathname?.includes("/properties/saved")) return "bookmarks";
    return "dashboard";
  })();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
          <aside className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100 p-4">
            <Sidebar current={current} />
          </aside>
          <section className="space-y-4">
            <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100 p-4 lg:p-6">
              {children}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
