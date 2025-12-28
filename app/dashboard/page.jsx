import { redirect } from "next/navigation";
import { getSessionUser } from "@/utils/getSessionUser";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const sessionUser = await getSessionUser();

  if (sessionUser instanceof Response || !sessionUser?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const role = sessionUser.user.role;
  if (["admin", "assistant"].includes(role)) {
    redirect("/dashboard/admin");
  }

  redirect("/dashboard/user");
}
