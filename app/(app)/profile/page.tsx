import { LogOut, UserRound } from "lucide-react";
import { logout, updateProfile } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { getAppContext } from "@/lib/data";

export default async function ProfilePage() {
  const context = await getAppContext();
  return (
    <>
      <PageHeader title="Profil" description="Informasi akun dan workspace aktif."/>
      <section className="split-layout">
        <form action={updateProfile} className="card card-pad">
          <div className="card-title"><h2>Informasi pribadi</h2></div>
          <div style={{ width: 62, height: 62, display: "grid", placeItems: "center", borderRadius: "50%", color: "white", background: "#0b2537", marginBottom: 20 }}><UserRound size={25}/></div>
          <div className="form-grid">
            <div className="field"><label>Nama</label><input className="input" name="display_name" defaultValue={context.profile.display_name ?? ""} required/></div>
            <div className="field"><label>Email</label><input className="input" value={context.user.email} disabled/></div>
            <div className="field"><label>Workspace aktif</label><input className="input" value={context.workspace.name} disabled/></div>
            <div className="field"><label>Peran</label><input className="input" value={context.role} disabled/></div>
          </div>
          <div className="form-footer"><button className="button button-primary" type="submit">Simpan profil</button></div>
        </form>
        <aside className="card card-pad">
          <div className="card-title"><h2>Sesi akun</h2></div>
          <p style={{ color: "#71808a", fontSize: 11, lineHeight: 1.6 }}>Keluar dari BudgetKu pada perangkat ini. Data yang sudah disimpan tidak akan terhapus.</p>
          <form action={logout}><button className="button button-danger button-block" type="submit"><LogOut size={16}/>Keluar</button></form>
        </aside>
      </section>
    </>
  );
}
