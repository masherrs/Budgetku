import { Wallet } from "lucide-react";
import { Logo } from "@/components/logo";
import { BottomNav, SidebarNav } from "@/components/navigation";
import { getAppContext } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <main className="setup-notice">
        <section className="card">
          <i><Wallet size={28}/></i>
          <h1>Sambungkan Supabase untuk membuka aplikasi</h1>
          <p>Landing page sudah siap. Untuk memakai dashboard dan menyimpan data nyata, buat file <strong>.env.local</strong> lalu isi kredensial publik Supabase.</p>
          <code>NEXT_PUBLIC_SUPABASE_URL=...<br/>NEXT_PUBLIC_SUPABASE_ANON_KEY=...</code>
        </section>
      </main>
    );
  }

  const context = await getAppContext();
  const displayName = context.profile.display_name ?? context.user.email.split("@")[0];
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="app-shell">
      <header className="mobile-topbar"><Logo href="/dashboard"/><span className="mobile-avatar">{initial}</span></header>
      <aside className="sidebar">
        <Logo href="/dashboard"/>
        <WorkspaceSwitcher workspaces={context.workspaces} currentId={context.workspace.id}/>
        <SidebarNav/>
        <div className="sidebar-profile"><span>{initial}</span><p><strong>{displayName}</strong><small>{context.user.email}</small></p></div>
      </aside>
      <main className="app-main"><div className="page-wrap">{children}</div></main>
      <BottomNav/>
    </div>
  );
}
