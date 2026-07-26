"use client";

import { switchWorkspace } from "@/app/actions";
import type { Workspace } from "@/lib/types";

export function WorkspaceSwitcher({
  workspaces,
  currentId,
}: {
  workspaces: Workspace[];
  currentId: string;
}) {
  return (
    <form className="workspace-switcher" action={switchWorkspace}>
      <small>Workspace aktif</small>
      <select
        name="workspace_id"
        className="select"
        defaultValue={currentId}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        aria-label="Pilih workspace"
      >
        {workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}
      </select>
    </form>
  );
}
