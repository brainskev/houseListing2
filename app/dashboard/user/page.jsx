import React from "react";
import { redirect } from "next/navigation";
import UserDashboard from "@/components/UserDashboard";
import { getSessionUser } from "@/utils/getSessionUser";

export const dynamic = "force-dynamic";

const Page = async () => {
  const sessionUser = await getSessionUser();
  // getSessionUser can return a Response or null on failure
  if (sessionUser instanceof Response || !sessionUser?.user) {
    redirect("/login?callbackUrl=/dashboard/user");
  }

  const role = sessionUser.user.role;
  if (["admin", "assistant"].includes(role)) {
    redirect("/dashboard/admin");
  }

  return <UserDashboard hideSidebar />;
};

export default Page;

