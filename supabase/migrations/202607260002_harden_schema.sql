-- Trigger functions are internal-only and must not be callable through PostgREST.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.seed_workspace() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- RLS helper functions are required by signed-in users, but never by anon.
revoke execute on function public.is_workspace_member(uuid) from public, anon;
revoke execute on function public.workspace_role(uuid) from public, anon;
revoke execute on function public.can_manage_workspace(uuid) from public, anon;
revoke execute on function public.can_view_profile(uuid) from public, anon;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.workspace_role(uuid) to authenticated;
grant execute on function public.can_manage_workspace(uuid) to authenticated;
grant execute on function public.can_view_profile(uuid) to authenticated;

-- Cover foreign keys and common workspace-scoped joins.
create index if not exists workspaces_owner_idx
  on public.workspaces(owner_id);
create index if not exists workspace_members_user_idx
  on public.workspace_members(user_id);
create index if not exists invitations_invited_by_idx
  on public.workspace_invitations(invited_by);
create index if not exists budgets_category_idx
  on public.budgets(category_id);
create index if not exists transactions_created_by_idx
  on public.transactions(created_by);
create index if not exists transactions_destination_account_idx
  on public.transactions(destination_account_id);
create index if not exists transactions_workspace_account_idx
  on public.transactions(workspace_id,account_id);
create index if not exists transactions_workspace_destination_idx
  on public.transactions(workspace_id,destination_account_id);
create index if not exists transactions_workspace_category_idx
  on public.transactions(workspace_id,category_id);

-- Cache auth.uid() once per statement in policies that call it directly.
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "workspaces_insert_owner" on public.workspaces;
create policy "workspaces_insert_owner" on public.workspaces
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists "workspaces_update_owner" on public.workspaces;
create policy "workspaces_update_owner" on public.workspaces
  for update to authenticated
  using (public.workspace_role(id) = 'owner')
  with check (owner_id = (select auth.uid()));

drop policy if exists "members_insert_manager" on public.workspace_members;
create policy "members_insert_manager" on public.workspace_members
  for insert to authenticated
  with check (
    public.can_manage_workspace(workspace_id)
    or exists (
      select 1
      from public.workspaces
      where id = workspace_id
        and owner_id = (select auth.uid())
        and user_id = (select auth.uid())
    )
  );

drop policy if exists "invitations_insert_owner" on public.workspace_invitations;
create policy "invitations_insert_owner" on public.workspace_invitations
  for insert to authenticated
  with check (
    public.workspace_role(workspace_id) = 'owner'
    and invited_by = (select auth.uid())
  );

drop policy if exists "transactions_insert_member" on public.transactions;
create policy "transactions_insert_member" on public.transactions
  for insert to authenticated
  with check (
    public.is_workspace_member(workspace_id)
    and created_by = (select auth.uid())
  );

drop policy if exists "transactions_update_creator_or_manager" on public.transactions;
create policy "transactions_update_creator_or_manager" on public.transactions
  for update to authenticated
  using (
    public.can_manage_workspace(workspace_id)
    or created_by = (select auth.uid())
  )
  with check (
    public.can_manage_workspace(workspace_id)
    or created_by = (select auth.uid())
  );

drop policy if exists "transactions_delete_creator_or_manager" on public.transactions;
create policy "transactions_delete_creator_or_manager" on public.transactions
  for delete to authenticated
  using (
    public.can_manage_workspace(workspace_id)
    or created_by = (select auth.uid())
  );
