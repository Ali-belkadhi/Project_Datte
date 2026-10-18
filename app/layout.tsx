import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "@/styles/globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Providers } from "@/components/layout/providers";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://siwar.tn"),
  title: {
    default: "SIWAR — La richesse naturelle du désert | Dattes de Kébili",
    template: "%s | SIWAR Kébili",
  },
  description:
    "SIWAR, marque tunisienne de dattes naturelles, produits à base de dattes et coffrets cadeaux de luxe, récoltés au cœur de Kébili.",
  keywords: ["dattes", "Deglet Nour", "Kébili", "Tunisie", "coffret cadeau", "sirop de dattes", "SIWAR"],
  openGraph: {
    type: "website",
    locale: "fr_TN",
    siteName: "SIWAR",
    images: ["/images/products/coffret-prestige-open.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#123B2A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${inter.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <a
            href="#contenu"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-forest focus:px-4 focus:py-2 focus:text-cream"
          >
            Aller au contenu
          </a>
          <Navbar />
          <MobileMenu />
          <SearchOverlay />
          <CartDrawer />
          <main id="contenu">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
