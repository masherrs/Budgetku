import Link from "next/link";
import { Plus, Tags } from "lucide-react";
import { saveCategory, toggleCategory } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getAppContext, getCategories } from "@/lib/data";

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ edit?: string; add?: string }> }) {
  const context = await getAppContext();
  const params = await searchParams;
  const categories = await getCategories(context.workspace.id, true);
  const editing = categories.find((item)=>item.id === params.edit);
  const canManage = context.role === "owner" || context.role === "admin";
  const showForm = canManage && Boolean(params.add || editing);
  return (
    <>
      <PageHeader title="Kategori" description="Kelompokkan transaksi agar laporan lebih mudah dipahami.">
        {canManage && <Link href="/categories?add=1" className="button button-primary"><Plus size={17}/><span>Tambah kategori</span></Link>}
      </PageHeader>
      {showForm && (
        <form action={saveCategory} className="card card-pad" style={{ marginBottom: 15 }}>
          {editing && <input type="hidden" name="id" value={editing.id}/>}
          <div className="form-grid">
            <div className="field"><label>Nama kategori</label><input className="input" name="name" defaultValue={editing?.name} required/></div>
            <div className="field"><label>Tipe</label><select className="select" name="type" defaultValue={editing?.type ?? "expense"}><option value="expense">Pengeluaran</option><option value="income">Pemasukan</option></select></div>
            <div className="field"><label>Ikon</label><input className="input" name="icon" defaultValue={editing?.icon ?? "🏷️"} maxLength={4}/></div>
            <div className="field"><label>Warna</label><input className="input" name="color" type="color" defaultValue={editing?.color ?? "#34c995"}/></div>
          </div>
          <div className="form-footer"><Link href="/categories" className="button button-outline">Batal</Link><button className="button button-primary" type="submit">{editing ? "Simpan perubahan" : "Tambah kategori"}</button></div>
        </form>
      )}
      {categories.length ? <section className="category-grid">{categories.map((category)=>(
        <article className="category-row card" key={category.id} style={{ opacity: category.is_active ? 1 : .55 }}>
          <i style={{ color: category.color, background: `${category.color}18` }}>{category.icon}</i>
          <p><strong>{category.name}</strong><small>{category.type === "income" ? "Pemasukan" : "Pengeluaran"}</small></p>
          <span className={`badge ${category.type === "income" ? "mint" : "coral"}`}>{category.is_active ? "Aktif" : "Nonaktif"}</span>
          {canManage && <><Link className="button button-ghost button-sm" href={`/categories?edit=${category.id}`}>Edit</Link>
          <form action={toggleCategory}><input type="hidden" name="id" value={category.id}/><input type="hidden" name="is_active" value={String(category.is_active)}/><button className="button button-ghost button-sm" type="submit">{category.is_active ? "×" : "✓"}</button></form></>}
        </article>
      ))}</section> : <EmptyState icon={Tags} title="Belum ada kategori" description="Admin atau owner dapat menambahkan kategori.">{canManage && <Link href="/categories?add=1" className="button button-primary button-sm">Tambah kategori</Link>}</EmptyState>}
    </>
  );
}
