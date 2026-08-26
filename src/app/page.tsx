import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  try {
    const session = await auth();
    if (session?.user) {
      redirect("/dashboard");
    }
  } catch {
    // Fallback to login
  }
  redirect("/login");
}