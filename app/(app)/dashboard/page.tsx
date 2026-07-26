import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, Plus, ReceiptText, Wallet } from "lucide-react";
import { ExportPdfButton } from "@/components/export-pdf-button";
import { PageHeader } from "@/components/page-header";
import { TransactionList } from "@/components/transaction-list";
import { getAppContext, getDashboardData } from "@/lib/data";
import { currentMonth, formatRupiah, monthLabel } from "@/lib/format";

export default async function DashboardPage() {
  const context = await getAppContext();
  const data = await getDashboardData(context.workspace.id);
  const { month, year } = currentMonth();
  const maxFlow = Math.max(data.income, data.expense, 1);
  const totalCategory = data.categories.reduce((sum, item) => sum + item[1], 0);
  const topCategories = data.categories.slice(0, 3);
  const nearlyUsed = data.budgets
    .filter((budget) => Number(budget.amount_limit) > 0 && Number(budget.spent) / Number(budget.amount_limit) >= .7)
    .slice(0, 3);
  const displayName = context.profile.display_name?.split(" ")[0] ?? "Kamu";

  return (
    <>
      <PageHeader title={`Halo, ${displayName} 👋`} description={`${monthLabel(month, year)} · ${context.workspace.name}`}>
        <ExportPdfButton />
        <Link className="button button-primary" href="/transactions/new"><Plus size={17}/><span>Tambah transaksi</span></Link>
      </PageHeader>

      <section className="summary-grid">
        <article className="summary-card primary card">
          <div className="summary-label"><i><Wallet size={15}/></i>Total saldo</div>
          <div className="summary-value">{formatRupiah(data.totalBalance)}</div>
          <div className="summary-foot">{data.accounts.length} akun aktif terhubung</div>
        </article>
        <article className="summary-card card">
          <div className="summary-label"><i><ArrowDownLeft size={15}/></i>Pemasukan</div>
          <div className="summary-value">{formatRupiah(data.income)}</div>
          <div className="summary-foot positive">Bulan ini</div>
        </article>
        <article className="summary-card card">
          <div className="summary-label"><i><ArrowUpRight size={15}/></i>Pengeluaran</div>
          <div className="summary-value">{formatRupiah(data.expense)}</div>
          <div className="summary-foot negative">Bulan ini</div>
        </article>
        <article className="summary-card card">
          <div className="summary-label"><i><CircleDollarSign size={15}/></i>Sisa budget</div>
          <div className="summary-value">{formatRupiah(data.budgetRemaining)}</div>
          <div className="summary-foot">Dari {formatRupiah(data.totalBudget)}</div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="card card-pad">
          <div className="card-title"><h2>Arus uang bulan ini</h2><span>{monthLabel(month, year)}</span></div>
          <div className="chart-wrap" style={{ height: 190 }}>
            <div className="chart-column"><i style={{ height: `${Math.max(4, data.income / maxFlow * 100)}%`, width: 54 }}/></div>
            <div className="chart-column"><i className="expense" style={{ height: `${Math.max(4, data.expense / maxFlow * 100)}%`, width: 54 }}/></div>
          </div>
          <div className="chart-labels" style={{ gridTemplateColumns: "1fr 1fr" }}><span>Pemasukan</span><span>Pengeluaran</span></div>
        </article>
        <article className="card card-pad">
          <div className="card-title"><h2>Pengeluaran terbesar</h2><Link href="/transactions">Lihat detail</Link></div>
          {topCategories.length ? (
            <div className="donut-row">
              <div className="donut" style={{ "--pct": Math.round((topCategories[0]?.[1] ?? 0) / Math.max(totalCategory,1) * 100) } as React.CSSProperties}><span><strong>{Math.round((topCategories[0]?.[1] ?? 0) / Math.max(totalCategory,1) * 100)}%</strong>terbesar</span></div>
              <div className="legend">
                {topCategories.map(([name, amount], index) => <div key={name}><span><i/>{name}</span><b>{index === 0 ? formatRupiah(amount) : `${Math.round(amount / Math.max(totalCategory,1) * 100)}%`}</b></div>)}
              </div>
            </div>
          ) : <div className="empty-state" style={{ minHeight: 150, padding: 10 }}><div><p>Belum ada pengeluaran bulan ini.</p></div></div>}
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="card card-pad">
          <div className="card-title"><h2>Transaksi terbaru</h2><Link href="/transactions">Lihat semua</Link></div>
          {data.transactions.length ? <TransactionList transactions={data.transactions.slice(0, 6)} compact/> : (
            <div className="empty-state" style={{ minHeight: 210 }}><div><i><ReceiptText size={23}/></i><h3>Belum ada transaksi</h3><p>Catat pemasukan atau pengeluaran pertamamu.</p><Link className="button button-primary button-sm" href="/transactions/new">Tambah transaksi</Link></div></div>
          )}
        </article>
        <article className="card card-pad">
          <div className="card-title"><h2>Budget perlu perhatian</h2><Link href="/budgets">Kelola</Link></div>
          {nearlyUsed.length ? <div className="budget-list">{nearlyUsed.map((budget) => {
            const percent = Math.round(Number(budget.spent) / Number(budget.amount_limit) * 100);
            return <div key={budget.id} className={`budget-row ${percent > 100 ? "over" : "warning"}`} style={{ padding: "10px 0" }}><div className="budget-row-head"><div className="budget-row-name"><i>{budget.categories?.icon ?? "🏷️"}</i><div><strong>{budget.categories?.name}</strong><small>{percent}% terpakai</small></div></div><strong>{formatRupiah(budget.amount_limit - Number(budget.spent))}</strong></div><div className="progress"><i style={{ width: `${Math.min(percent,100)}%` }}/></div></div>;
          })}</div> : <div className="empty-state" style={{ minHeight: 210, padding: 10 }}><div><p>Semua budget masih aman, atau belum ada budget bulan ini.</p><Link className="button button-outline button-sm" href="/budgets">Atur budget</Link></div></div>}
        </article>
      </section>
    </>
  );
}
