import { redirect } from "next/navigation";

export default function MessagesLegacyRedirect() {
  redirect("/dashboard/messages");
}
