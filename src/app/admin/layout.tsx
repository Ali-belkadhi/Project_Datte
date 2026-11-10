import { AdminShell } from "@/components/layout/admin-shell";

/** Vue admin — layout AdminShell (sidebar night). */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
