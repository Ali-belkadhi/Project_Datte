import { AuthShell } from "@/components/layout/auth-shell";

/** Authentification — layout AuthShell (écran partagé avec scène 3D). */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
