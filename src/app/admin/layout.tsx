import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/layout/admin-shell";

/** Vue admin — layout AdminShell (sidebar night). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  return <AdminShell>{children}</AdminShell>;
}
