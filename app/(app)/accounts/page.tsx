import Link from "next/link";
import { Plus, WalletCards } from "lucide-react";
import { saveAccount, toggleAccount } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getAccounts, getAppContext } from "@/lib/data";
import { formatRupiah } from "@/lib/format";

const accountTypes = ["cash","bank","e-wallet","credit-card","savings","investment","other"];

export default async function AccountsPage({ searchParams }: { searchParams: Promise<{ edit?: string; add?: string }> }) {
  const context = await getAppContext();
  const params = await searchParams;
  const accounts = await getAccounts(context.workspace.id, true);
  const editing = accounts.find((item) => item.id === params.edit);
  const canManage = context.role === "owner" || context.role === "admin";
  const showForm = canManage && Boolean(params.add || editing);
  return (
    <>
      <PageHeader title="Akun keuangan" description="Saldo bank, cash, dan e-wallet dalam satu tampilan.">
        {canManage && <Link href="/accounts?add=1" className="button button-primary"><Plus size={17}/><span>Tambah akun</span></Link>}
      </PageHeader>
      {showForm && (
        <form action={saveAccount} className="card card-pad" style={{ marginBottom: 15 }}>
          {editing && <input type="hidden" name="id" value={editing.id}/>}
          <div className="form-grid">
            <div className="field"><label>Nama akun</label><input className="input" name="name" placeholder="Contoh: BCA" defaultValue={editing?.name} required/></div>
            <div className="field"><label>Jenis</label><select className="select" name="type" defaultValue={editing?.type ?? "bank"}>{accountTypes.map((type)=><option key={type} value={type}>{type}</option>)}</select></div>
            <div className="field"><label>Saldo awal</label><input className="input" name="initial_balance" type="number" min="0" defaultValue={editing?.initial_balance ?? 0} required/></div>
            <div className="field"><label>Ikon</label><input className="input" name="icon" defaultValue={editing?.icon ?? "💳"} maxLength={4}/></div>
            <div className="field"><label>Warna</label><input className="input" name="color" type="color" defaultValue={editing?.color ?? "#34c995"}/></div>
          </div>
          <div className="form-footer"><Link className="button button-outline" href="/accounts">Batal</Link><button className="button button-primary" type="submit">{editing ? "Simpan perubahan" : "Tambah akun"}</button></div>
        </form>
      )}
      {accounts.length ? (
        <section className="accounts-grid">
          {accounts.map((account)=>(
            <article className="account-card card" key={account.id} style={{ opacity: account.is_active ? 1 : .55 }}>
              <div className="account-head"><i className="account-icon" style={{ color: account.color, background: `${account.color}18` }}>{account.icon}</i><span className={`badge ${account.is_active ? "mint" : ""}`}>{account.is_active ? "Aktif" : "Nonaktif"}</span></div>
              <h3>{account.name}</h3><small>{account.type}</small><strong className="balance">{formatRupiah(account.current_balance ?? account.initial_balance)}</strong>
              {canManage && <div className="page-actions" style={{ marginTop: 16 }}>
                <Link href={`/accounts?edit=${account.id}`} className="button button-outline button-sm">Edit</Link>
                <form action={toggleAccount}><input type="hidden" name="id" value={account.id}/><input type="hidden" name="is_active" value={String(account.is_active)}/><button className="button button-ghost button-sm" type="submit">{account.is_active ? "Nonaktifkan" : "Aktifkan"}</button></form>
              </div>}
            </article>
          ))}
        </section>
      ) : <EmptyState icon={WalletCards} title="Belum ada akun" description="Admin atau owner dapat menambahkan akun pertama.">{canManage && <Link href="/accounts?add=1" className="button button-primary button-sm">Tambah akun</Link>}</EmptyState>}
    </>
  );
}
