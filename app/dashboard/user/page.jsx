import React from "react";
import { redirect } from "next/navigation";
import UserDashboard from "@/components/UserDashboard";
import { getSessionUser } from "@/utils/getSessionUser";

export const dynamic = "force-dynamic";

const Page = async () => {
  const sessionUser = await getSessionUser();
  // getSessionUser can return a Response or null on failure
  if (sessionUser instanceof Response || !sessionUser?.user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/user");
  }

  const role = sessionUser.user.role;
  if (["admin", "assistant"].includes(role)) {
    redirect("/dashboard/admin");
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <UserDashboard />
    </div>
  );
};

export default Page;

