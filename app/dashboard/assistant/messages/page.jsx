import { redirect } from "next/navigation";

export default function AssistantMessagesRedirect() {
  redirect("/dashboard/messages");
}
