"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Spinner from "@/components/Spinner";
import Sidebar from "@/components/Sidebar";

export default function MessagesLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/messages");
    }
  }, [status, router]);

  if (status === "loading") {
    return <Spinner loading={true} />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
          <Sidebar current="messages" />
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
