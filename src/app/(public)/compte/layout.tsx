import { AccountNav } from "@/components/layout/account-nav";
import { Container } from "@/components/layout/section";

/** Compte acheteur : sidebar sur desktop, onglets défilants ou cartes sur mobile. */
export default function CompteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container className="py-6 md:py-10">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <AccountNav />
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </Container>
  );
}
