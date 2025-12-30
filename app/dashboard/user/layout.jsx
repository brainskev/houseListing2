"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Spinner from "@/components/Spinner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function UserDashboardLayout({ children }) {
  const { data: session, status } = useSession();
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

  return (
    <DashboardLayout role="user">
      {children}
    </DashboardLayout>
  );
}
