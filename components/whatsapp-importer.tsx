"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, MessageCircle } from "lucide-react";
import { importWhatsApp } from "@/app/actions";
import { parseWhatsAppText, type ParsedWhatsAppRow } from "@/lib/whatsapp-parser";
import type { Account, Category } from "@/lib/types";
import { formatRupiah } from "@/lib/format";

export function WhatsAppImporter({ accounts, categories }: { accounts: Account[]; categories: Category[] }) {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<ParsedWhatsAppRow[]>([]);
  const update = (id: string, field: keyof ParsedWhatsAppRow, value: string | number) =>
    setRows((items)=>items.map((item)=>item.id === id ? { ...item, [field]: value, needsReview: false } : item));
  const parse = () => setRows(parseWhatsAppText(text, accounts, categories));
  const valid = rows.length > 0 && rows.every((row)=>row.amount > 0 && row.account_id && row.category_id && row.title);
  return (
    <section className="split-layout">
      <div>
        <div className="card card-pad">
          <div className="card-title"><h2><MessageCircle size={17} style={{ display: "inline", marginRight: 8 }}/>Paste transaksi dari WhatsApp</h2></div>
          <textarea className="textarea" value={text} onChange={(event)=>setText(event.target.value)} placeholder={"makan ayam geprek 25000 cash\nkopi 18000 gopay\ngaji 5000000 bca"} style={{ minHeight: 170 }}/>
          <div className="form-footer"><button className="button button-primary" type="button" onClick={parse} disabled={!text.trim()}>Baca transaksi</button></div>
        </div>
        {rows.length > 0 && (
          <form action={importWhatsApp} className="card card-pad" style={{ marginTop: 15 }}>
            <input type="hidden" name="rows" value={JSON.stringify(rows.map(({ title,amount,type,account_id,category_id,date })=>({ title,amount,type,account_id,category_id,date })))}/>
            <div className="card-title"><h2>Periksa sebelum disimpan</h2><span>{rows.length} transaksi ditemukan</span></div>
            <div className="wa-preview">
              {rows.map((row)=>(
                <div className="wa-row" key={row.id}>
                  <input className="input" value={row.title} onChange={(event)=>update(row.id,"title",event.target.value)} aria-label="Judul transaksi"/>
                  <input className="input" type="number" min="1" value={row.amount || ""} onChange={(event)=>update(row.id,"amount",Number(event.target.value))} aria-label="Nominal"/>
                  <select className="select" value={row.type} onChange={(event)=>update(row.id,"type",event.target.value)} aria-label="Tipe"><option value="expense">Keluar</option><option value="income">Masuk</option></select>
                  <select className="select" value={row.account_id} onChange={(event)=>update(row.id,"account_id",event.target.value)} aria-label="Akun"><option value="">Pilih akun</option>{accounts.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select>
                  <select className="select" value={row.category_id} onChange={(event)=>update(row.id,"category_id",event.target.value)} aria-label="Kategori"><option value="">Pilih kategori</option>{categories.filter((item)=>item.type === row.type).map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select>
                  <input className="input" type="date" value={row.date} onChange={(event)=>update(row.id,"date",event.target.value)} aria-label="Tanggal"/>
                  <div className="wa-row-meta"><span>Asli: “{row.raw}”</span><span>{row.needsReview ? <><AlertCircle size={11} style={{ display:"inline" }}/> Perlu dicek</> : <><CheckCircle2 size={11} style={{ display:"inline" }}/> {formatRupiah(row.amount)}</>}</span></div>
                </div>
              ))}
            </div>
            <div className="form-footer"><button className="button button-primary" type="submit" disabled={!valid}>Simpan {rows.length} transaksi</button></div>
          </form>
        )}
      </div>
      <aside className="card card-pad sticky-card">
        <div className="card-title"><h2>Format yang didukung</h2></div>
        <p style={{ color: "#71808a", fontSize: 11, lineHeight: 1.6 }}>Satu transaksi per baris. Tulis keterangan, nominal, lalu nama akun.</p>
        <div className="wa-example">makan ayam geprek 25000 cash<br/>kopi 18000 gopay<br/>gaji 5000000 bca<br/>listrik 300000 mandiri<br/>freelance desain 750000 bca</div>
        <p style={{ color: "#8a979e", fontSize: 9, lineHeight: 1.55 }}>BudgetKu tidak akan menyimpan apa pun sebelum kamu memeriksa dan menekan tombol simpan.</p>
      </aside>
    </section>
  );
}
