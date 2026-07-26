"use client";

import { useState } from "react";
import Link from "next/link";
import { saveTransaction } from "@/app/actions";
import type { Account, Category, Transaction, TransactionType } from "@/lib/types";
import { todayJakarta } from "@/lib/format";

export function TransactionForm({
  accounts,
  categories,
  transaction,
}: {
  accounts: Account[];
  categories: Category[];
  transaction?: Transaction;
}) {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "expense");
  const relevantCategories = categories.filter((item) => item.type === type);
  return (
    <form action={saveTransaction} className="card card-pad form-card">
      {transaction && <input type="hidden" name="id" value={transaction.id}/>}
      <input type="hidden" name="source" value={transaction?.source ?? "manual"}/>
      <div className="form-grid">
        <div className="field full">
          <span className="field-label">Jenis transaksi</span>
          <div className="type-tabs">
            {(["expense","income","transfer"] as const).map((value) => (
              <label key={value}><input type="radio" name="type" value={value} checked={type === value} onChange={() => setType(value)}/><span>{value === "expense" ? "Pengeluaran" : value === "income" ? "Pemasukan" : "Transfer"}</span></label>
            ))}
          </div>
        </div>
        <div className="field full"><label htmlFor="title">Judul transaksi</label><input className="input" id="title" name="title" placeholder="Contoh: Makan siang" defaultValue={transaction?.title} required/></div>
        <div className="field"><label htmlFor="amount">Nominal</label><input className="input" id="amount" name="amount" type="number" inputMode="numeric" min="1" step="1" placeholder="Rp0" defaultValue={transaction?.amount} required/></div>
        <div className="field"><label htmlFor="date">Tanggal</label><input className="input" id="date" name="date" type="date" defaultValue={transaction?.date ?? todayJakarta()} required/></div>
        <div className="field"><label htmlFor="account">Akun {type === "transfer" ? "asal" : ""}</label><select className="select" id="account" name="account_id" defaultValue={transaction?.account_id} required><option value="">Pilih akun</option>{accounts.map((item)=><option key={item.id} value={item.id}>{item.icon} {item.name}</option>)}</select></div>
        {type === "transfer" ? (
          <div className="field"><label htmlFor="destination">Akun tujuan</label><select className="select" id="destination" name="destination_account_id" defaultValue={transaction?.destination_account_id ?? ""} required><option value="">Pilih akun tujuan</option>{accounts.map((item)=><option key={item.id} value={item.id}>{item.icon} {item.name}</option>)}</select></div>
        ) : (
          <div className="field"><label htmlFor="category">Kategori</label><select className="select" id="category" name="category_id" defaultValue={transaction?.category_id ?? ""} required><option value="">Pilih kategori</option>{relevantCategories.map((item)=><option key={item.id} value={item.id}>{item.icon} {item.name}</option>)}</select></div>
        )}
        <div className="field full"><label htmlFor="note">Catatan <span style={{ color: "#9aa6ac", fontWeight: 400 }}>(opsional)</span></label><textarea className="textarea" id="note" name="note" placeholder="Tambahkan detail transaksi..." defaultValue={transaction?.note ?? ""}/></div>
      </div>
      <div className="form-footer"><Link href="/transactions" className="button button-outline">Batal</Link><button className="button button-primary" type="submit">{transaction ? "Simpan perubahan" : "Simpan transaksi"}</button></div>
    </form>
  );
}
