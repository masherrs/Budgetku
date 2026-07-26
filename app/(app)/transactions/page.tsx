import Link from "next/link";
import { Plus, ReceiptText } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { TransactionList } from "@/components/transaction-list";
import { getAccounts, getAppContext, getCategories, getTransactions } from "@/lib/data";
import { currentMonth, formatRupiah } from "@/lib/format";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; type?: string; category?: string; account?: string }>;
}) {
  const context = await getAppContext();
  const params = await searchParams;
  const current = currentMonth();
  const month = params.month ?? `${current.year}-${String(current.month).padStart(2,"0")}`;
  const filters = { ...params, month };
  const [transactions, accounts, categories] = await Promise.all([
    getTransactions(context.workspace.id, filters),
    getAccounts(context.workspace.id),
    getCategories(context.workspace.id),
  ]);
  const income = transactions.filter((item)=>item.type === "income").reduce((sum,item)=>sum+Number(item.amount),0);
  const expense = transactions.filter((item)=>item.type === "expense").reduce((sum,item)=>sum+Number(item.amount),0);
  return (
    <>
      <PageHeader title="Transaksi" description="Semua pemasukan dan pengeluaran dalam satu riwayat.">
        <Link href="/transactions/new" className="button button-primary"><Plus size={17}/><span>Tambah transaksi</span></Link>
      </PageHeader>
      <section className="summary-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 15 }}>
        <article className="summary-card primary card"><div className="summary-label">Arus bersih</div><div className="summary-value">{formatRupiah(income-expense)}</div><div className="summary-foot">Periode terpilih</div></article>
        <article className="summary-card card"><div className="summary-label">Pemasukan</div><div className="summary-value">{formatRupiah(income)}</div><div className="summary-foot positive">{transactions.filter((item)=>item.type === "income").length} transaksi</div></article>
        <article className="summary-card card"><div className="summary-label">Pengeluaran</div><div className="summary-value">{formatRupiah(expense)}</div><div className="summary-foot negative">{transactions.filter((item)=>item.type === "expense").length} transaksi</div></article>
      </section>
      <form className="filter-bar card">
        <input className="input" type="month" name="month" defaultValue={month}/>
        <select className="select" name="type" defaultValue={params.type ?? ""}><option value="">Semua tipe</option><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option><option value="transfer">Transfer</option></select>
        <select className="select" name="account" defaultValue={params.account ?? ""}><option value="">Semua akun</option>{accounts.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <select className="select" name="category" defaultValue={params.category ?? ""}><option value="">Semua kategori</option>{categories.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <button className="button button-outline button-sm" type="submit">Terapkan</button>
      </form>
      {transactions.length ? <section className="card card-pad"><TransactionList transactions={transactions}/></section> : (
        <EmptyState icon={ReceiptText} title="Belum ada transaksi" description="Belum ada transaksi pada filter yang dipilih. Mulai dengan mencatat satu transaksi."><Link className="button button-primary button-sm" href="/transactions/new">Tambah transaksi</Link></EmptyState>
      )}
    </>
  );
}
