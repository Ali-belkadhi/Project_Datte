import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountNav } from "@/components/layout/account-nav";
import { Container } from "@/components/layout/section";

/** Compte acheteur : sidebar sur desktop, onglets défilants ou cartes sur mobile. */
export default async function CompteLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  console.log("[CompteLayout] session:", JSON.stringify({ id: session?.user?.id, role: (session?.user as { role?: string })?.role ?? null }));
  if (!session?.user?.id) {
    console.log("[CompteLayout] ⛔ no session → redirect /connexion");
    redirect("/connexion");
  }
  return (
    <Container className="py-6 md:py-10">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <AccountNav />
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </Container>
  );
}
