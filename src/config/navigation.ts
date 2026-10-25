/**
 * Navigation — source unique des menus acheteur / vendeur / admin.
 */
import {
  BadgeCheck,
  Bell,
  Box,
  ChartNoAxesCombined,
  CircleUser,
  Coins,
  Flag,
  Heart,
  House,
  LayoutDashboard,
  LayoutGrid,
  MapPin,
  MessageCircle,
  Package,
  Palmtree,
  Receipt,
  Scale,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  TicketPercent,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Correspondance exacte pour l'état actif. */
  exact?: boolean;
  badge?: string;
};

export type NavSection = { titre: string; items: NavItem[] };

/* ------------------------------ Acheteur ------------------------------ */

export const buyerMainNav: NavItem[] = [
  { href: "/catalogue", label: "Catalogue", icon: LayoutGrid },
  { href: "/varietes", label: "Variétés", icon: Palmtree },
  { href: "/assistant", label: "Assistant", icon: Sparkles },
];

export const buyerBottomNav: (NavItem & { featured?: boolean })[] = [
  { href: "/", label: "Accueil", icon: House, exact: true },
  { href: "/catalogue", label: "Catalogue", icon: LayoutGrid },
  { href: "/assistant", label: "Assistant", icon: Sparkles, featured: true },
  { href: "/panier", label: "Panier", icon: ShoppingBag },
  { href: "/compte", label: "Compte", icon: CircleUser },
];

export const accountNav: NavItem[] = [
  { href: "/compte", label: "Aperçu", icon: CircleUser, exact: true },
  { href: "/compte/commandes", label: "Mes commandes", icon: Package },
  { href: "/compte/favoris", label: "Favoris", icon: Heart },
  { href: "/compte/adresses", label: "Adresses", icon: MapPin },
  { href: "/compte/profil", label: "Profil et sécurité", icon: Settings },
  { href: "/compte/notifications", label: "Notifications", icon: Bell },
  { href: "/compte/messages", label: "Messages", icon: MessageCircle },
];

export const footerNav: { titre: string; liens: { href: string; label: string }[] }[] = [
  {
    titre: "Acheter",
    liens: [
      { href: "/catalogue", label: "Catalogue" },
      { href: "/varietes", label: "Les variétés" },
      { href: "/catalogue?type=DERIVE", label: "Produits dérivés" },
      { href: "/assistant", label: "Assistant DEGLA" },
    ],
  },
  {
    titre: "Vendre",
    liens: [
      { href: "/inscription?role=vendeur", label: "Ouvrir ma boutique" },
      { href: "/vendeur", label: "Espace vendeur" },
      { href: "/vendeur/studio-3d", label: "Studio 3D" },
      { href: "/vendeur/credits", label: "Crédits 3D" },
    ],
  },
  {
    titre: "DEGLA",
    liens: [
      { href: "/", label: "Notre mission" },
      { href: "/boutique/palmeraie-ben-amor", label: "Nos producteurs" },
      { href: "/varietes", label: "Terroirs du Djérid" },
    ],
  },
  {
    titre: "Aide",
    liens: [
      { href: "/compte/commandes", label: "Suivre une commande" },
      { href: "/compte/messages", label: "Contacter un vendeur" },
      { href: "/produit/deglet-nour-extra-branchee", label: "Livraison et retours" },
    ],
  },
];

/* ------------------------------ Vendeur ------------------------------- */

export const sellerNav: NavSection[] = [
  {
    titre: "Pilotage",
    items: [{ href: "/vendeur", label: "Tableau de bord", icon: LayoutDashboard, exact: true }],
  },
  {
    titre: "Catalogue",
    items: [
      { href: "/vendeur/produits", label: "Produits", icon: Package },
      { href: "/vendeur/studio-3d", label: "Studio 3D", icon: Box },
      { href: "/vendeur/credits", label: "Crédits 3D", icon: Coins },
    ],
  },
  {
    titre: "Ventes",
    items: [
      { href: "/vendeur/commandes", label: "Commandes", icon: Receipt, badge: "4" },
      { href: "/vendeur/avis", label: "Avis", icon: Star },
      { href: "/vendeur/versements", label: "Versements", icon: Wallet },
    ],
  },
  {
    titre: "Boutique",
    items: [
      { href: "/vendeur/boutique", label: "Ma boutique", icon: Store },
      { href: "/vendeur/messages", label: "Messages", icon: MessageCircle, badge: "2" },
      { href: "/vendeur/parametres", label: "Paramètres", icon: Settings },
    ],
  },
];

export const sellerBottomNav: NavItem[] = [
  { href: "/vendeur", label: "Tableau", icon: LayoutDashboard, exact: true },
  { href: "/vendeur/produits", label: "Produits", icon: Package },
  { href: "/vendeur/studio-3d", label: "Studio 3D", icon: Box },
  { href: "/vendeur/commandes", label: "Commandes", icon: Receipt },
];

/* ------------------------------- Admin -------------------------------- */

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Vue d'ensemble", icon: ChartNoAxesCombined, exact: true },
  { href: "/admin/fournisseurs", label: "Fournisseurs", icon: BadgeCheck, badge: "3" },
  { href: "/admin/varietes", label: "Variétés", icon: Palmtree },
  { href: "/admin/moderation", label: "Modération", icon: Flag },
  { href: "/admin/commandes", label: "Commandes", icon: Receipt },
  { href: "/admin/litiges", label: "Litiges", icon: Scale },
  { href: "/admin/codes-promo", label: "Codes promo", icon: TicketPercent },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

export function isActive(pathname: string, item: Pick<NavItem, "href" | "exact">) {
  const href = item.href.split("?")[0];
  return item.exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}
