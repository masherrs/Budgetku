"use client";

import { updateMemberRole } from "@/app/actions";
import type { WorkspaceRole } from "@/lib/types";

export function RoleSelect({ userId, role }: { userId: string; role: WorkspaceRole }) {
  return (
    <form action={updateMemberRole}>
      <input type="hidden" name="user_id" value={userId}/>
      <select className="select" name="role" defaultValue={role} onChange={(event)=>event.currentTarget.form?.requestSubmit()} aria-label="Ubah peran anggota">
        <option value="admin">Admin</option>
        <option value="member">Member</option>
      </select>
    </form>
  );
}
