import Link from "next/link";
import { formatDate, formatRupiah } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export function TransactionList({
  transactions,
  compact = false,
}: {
  transactions: Transaction[];
  compact?: boolean;
}) {
  return (
    <div className="transaction-list">
      {transactions.map((transaction) => (
        <Link className="transaction-item" href={`/transactions/${transaction.id}/edit`} key={transaction.id}>
          <i className="transaction-icon" style={{ background: `${transaction.categories?.color ?? "#87949b"}18` }}>{transaction.categories?.icon ?? (transaction.type === "transfer" ? "⇄" : "💸")}</i>
          <div className="transaction-copy">
            <strong>{transaction.title}</strong>
            <span>{transaction.categories?.name ?? "Transfer"} · {transaction.accounts?.name ?? "Akun"} · {formatDate(transaction.date)}</span>
          </div>
          <div className={`transaction-amount ${transaction.type}`}>
            {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}{formatRupiah(transaction.amount)}
            {!compact && <div><span className="badge">{transaction.source === "whatsapp" ? "WhatsApp" : "Manual"}</span></div>}
          </div>
        </Link>
      ))}
    </div>
  );
}
