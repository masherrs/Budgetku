import { MailPlus, Plus, Users } from "lucide-react";
import { createWorkspace, inviteMember } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { getAppContext } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { WorkspaceRole } from "@/lib/types";
import { RoleSelect } from "@/components/role-select";

type MemberRow = {
  user_id: string;
  role: WorkspaceRole;
  profiles: { display_name: string | null; email: string } | { display_name: string | null; email: string }[] | null;
};
type InvitationRow = { id: string; email: string; role: WorkspaceRole; status: string; created_at: string };

export default async function MembersPage() {
  const context = await getAppContext();
  const supabase = await createClient();
  const [{ data: memberData }, { data: invitationData }] = await Promise.all([
    supabase.from("workspace_members").select("user_id,role,profiles(display_name,email)").eq("workspace_id",context.workspace.id).order("joined_at"),
    supabase.from("workspace_invitations").select("id,email,role,status,created_at").eq("workspace_id",context.workspace.id).order("created_at",{ascending:false}),
  ]);
  const members = (memberData ?? []) as MemberRow[];
  const invitations = (invitationData ?? []) as InvitationRow[];
  const canManage = context.role === "owner";
  return (
    <>
      <PageHeader title="Anggota workspace" description={`Atur siapa yang bisa mengelola ${context.workspace.name}.`}/>
      <section className="split-layout">
        <div className="card card-pad">
          <div className="card-title"><h2>Anggota aktif</h2><span>{members.length} orang</span></div>
          <div className="member-list">{members.map((member)=>{
            const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
            const name = profile?.display_name ?? profile?.email ?? "Anggota";
            return <div className="member-item" key={member.user_id}><span className="member-avatar">{name[0]?.toUpperCase()}</span><div className="member-copy"><strong>{name}</strong><small>{profile?.email}</small></div>{member.role === "owner" ? <span className="badge mint">Owner</span> : canManage ? <RoleSelect userId={member.user_id} role={member.role}/> : <span className="badge">{member.role}</span>}</div>;
          })}</div>
        </div>
        <aside>
          {canManage && <form action={inviteMember} className="card card-pad">
            <div className="card-title"><h2><MailPlus size={17} style={{display:"inline",marginRight:7}}/>Undang anggota</h2></div>
            <div className="field"><label>Email</label><input className="input" type="email" name="email" placeholder="teman@email.com" required/></div>
            <div className="field"><label>Peran</label><select className="select" name="role"><option value="member">Member</option><option value="admin">Admin</option></select></div>
            <button className="button button-primary button-block" style={{marginTop:17}} type="submit">Buat undangan</button>
          </form>}
          <form action={createWorkspace} className="card card-pad" style={{marginTop:15}}>
            <div className="card-title"><h2><Plus size={17} style={{display:"inline",marginRight:7}}/>Workspace baru</h2></div>
            <div className="field"><label>Nama workspace</label><input className="input" name="name" placeholder="Contoh: Keuangan Keluarga" required/></div>
            <button className="button button-outline button-block" style={{marginTop:17}} type="submit">Buat workspace</button>
          </form>
        </aside>
      </section>
      {invitations.length > 0 && <section className="card card-pad" style={{marginTop:15}}><div className="card-title"><h2>Undangan</h2></div><div className="member-list">{invitations.map((invite)=><div className="member-item" key={invite.id}><span className="member-avatar"><Users size={16}/></span><div className="member-copy"><strong>{invite.email}</strong><small>Diundang sebagai {invite.role}</small></div><span className="badge">{invite.status}</span></div>)}</div></section>}
    </>
  );
}
