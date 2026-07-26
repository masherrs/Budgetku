import Link from "next/link";
import { Wallet } from "lucide-react";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="logo" aria-label="BudgetKu">
      <span><Wallet size={20} strokeWidth={2.4} /></span>
      <strong>Budget<span>Ku</span></strong>
    </Link>
  );
}
