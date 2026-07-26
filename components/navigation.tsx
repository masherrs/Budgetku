"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartNoAxesCombined,
  FolderKanban,
  LayoutDashboard,
  MessageCircle,
  PiggyBank,
  ReceiptText,
  Tags,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";

const primary = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ReceiptText },
  { href: "/budgets", label: "Budget", icon: PiggyBank },
  { href: "/accounts", label: "Akun", icon: WalletCards },
];
const secondary = [
  { href: "/categories", label: "Kategori", icon: Tags },
  { href: "/import/whatsapp", label: "Import dari WA", icon: MessageCircle },
  { href: "/members", label: "Anggota", icon: Users },
  { href: "/receipts", label: "Scan struk", icon: ChartNoAxesCombined },
  { href: "/profile", label: "Profil", icon: UserRound },
];

function active(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <>
      <nav className="nav-list">
        {primary.map((item) => <NavLink key={item.href} item={item} selected={active(pathname,item.href)} />)}
      </nav>
      <div className="nav-section-label">Kelola</div>
      <nav className="nav-list">
        {secondary.map((item) => <NavLink key={item.href} item={item} selected={active(pathname,item.href)} />)}
      </nav>
    </>
  );
}

function NavLink({
  item,
  selected,
}: {
  item: { href: string; label: string; icon: typeof FolderKanban };
  selected: boolean;
}) {
  const Icon = item.icon;
  return <Link href={item.href} className={`nav-item ${selected ? "active" : ""}`}><Icon size={17}/>{item.label}</Link>;
}

export function BottomNav() {
  const pathname = usePathname();
  const items = [...primary.slice(0, 4), { href: "/profile", label: "Profil", icon: UserRound }];
  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {items.map((item) => {
        const Icon = item.icon;
        return <Link key={item.href} href={item.href} className={active(pathname,item.href) ? "active" : ""}><Icon/><span>{item.label}</span></Link>;
      })}
    </nav>
  );
}
