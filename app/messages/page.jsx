import { redirect } from "next/navigation";

export default function MessagesLegacyRedirect({ searchParams }) {
  const qs = new URLSearchParams(searchParams || {}).toString();
  redirect(qs ? `/dashboard/messages?${qs}` : "/dashboard/messages");
}
