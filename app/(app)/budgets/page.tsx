import { PiggyBank } from "lucide-react";
import { saveBudget } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getAppContext, getBudgets, getCategories } from "@/lib/data";
import { currentMonth, formatRupiah, monthLabel } from "@/lib/format";

export default async function BudgetsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const context = await getAppContext();
  const params = await searchParams;
  const current = currentMonth();
  const [year, month] = (params.month ?? `${current.year}-${String(current.month).padStart(2,"0")}`).split("-").map(Number);
  const [budgets, categories] = await Promise.all([
    getBudgets(context.workspace.id, month, year),
    getCategories(context.workspace.id),
  ]);
  const canManage = context.role === "owner" || context.role === "admin";
  const expenseCategories = categories.filter((item)=>item.type === "expense");
  const total = budgets.reduce((sum,item)=>sum+Number(item.amount_limit),0);
  const spent = budgets.reduce((sum,item)=>sum+Number(item.spent),0);
  return (
    <>
      <PageHeader title="Budget bulanan" description="Tetapkan batas dan pantau pemakaian tiap kategori."/>
      <form className="filter-bar card"><input className="input" type="month" name="month" defaultValue={`${year}-${String(month).padStart(2,"0")}`}/><button className="button button-outline button-sm" type="submit">Lihat bulan</button></form>
      <section className="summary-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 15 }}>
        <article className="summary-card primary card"><div className="summary-label">Total budget</div><div className="summary-value">{formatRupiah(total)}</div><div className="summary-foot">{monthLabel(month,year)}</div></article>
        <article className="summary-card card"><div className="summary-label">Terpakai</div><div className="summary-value">{formatRupiah(spent)}</div><div className="summary-foot negative">{total ? Math.round(spent/total*100) : 0}% dari total</div></article>
        <article className="summary-card card"><div className="summary-label">Tersisa</div><div className="summary-value">{formatRupiah(total-spent)}</div><div className="summary-foot positive">Sampai akhir bulan</div></article>
      </section>
      <section className="split-layout">
        <div>
          {budgets.length ? <div className="budget-list">{budgets.map((budget)=>{
            const percent = Math.round(Number(budget.spent)/Number(budget.amount_limit)*100);
            const status = percent < 70 ? "safe" : percent <= 100 ? "warning" : "over";
            return <article className={`budget-row card ${status}`} key={budget.id}><div className="budget-row-head"><div className="budget-row-name"><i>{budget.categories?.icon ?? "🏷️"}</i><div><strong>{budget.categories?.name}</strong><small>{formatRupiah(budget.spent)} dari {formatRupiah(budget.amount_limit)}</small></div></div><div className="budget-status"><strong>{Math.max(0,100-percent)}% tersisa</strong><span>{status === "safe" ? "Aman" : status === "warning" ? "Waspada" : "Melebihi budget"}</span></div></div><div className="progress"><i style={{ width: `${Math.min(percent,100)}%` }}/></div></article>;
          })}</div> : <EmptyState icon={PiggyBank} title="Belum ada budget" description={`Tetapkan budget pertamamu untuk ${monthLabel(month,year)}.`}/>}
        </div>
        {canManage && <form action={saveBudget} className="card card-pad sticky-card">
          <div className="card-title"><h2>Atur budget</h2></div>
          <input type="hidden" name="month" value={month}/><input type="hidden" name="year" value={year}/>
          <div className="field"><label>Kategori pengeluaran</label><select className="select" name="category_id" required><option value="">Pilih kategori</option>{expenseCategories.map((item)=><option key={item.id} value={item.id}>{item.icon} {item.name}</option>)}</select></div>
          <div className="field"><label>Limit budget</label><input className="input" name="amount_limit" type="number" min="1" placeholder="Rp0" required/></div>
          <button className="button button-primary button-block" type="submit" style={{ marginTop: 18 }}>Simpan budget</button>
          <p style={{ color: "#8a979e", fontSize: 9, lineHeight: 1.5 }}>Menyimpan kategori yang sudah ada akan memperbarui limitnya.</p>
        </form>}
      </section>
    </>
  );
}
