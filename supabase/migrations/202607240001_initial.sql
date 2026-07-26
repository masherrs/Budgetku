create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner','admin','member')),
  joined_at timestamptz not null default now(),
  primary key (workspace_id,user_id)
);

create table public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin','member')),
  status text not null default 'pending' check (status in ('pending','accepted','expired','revoked')),
  invited_by uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  unique (workspace_id,email,status)
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  type text not null check (type in ('cash','bank','e-wallet','credit-card','savings','investment','other')),
  initial_balance numeric(18,2) not null default 0 check (initial_balance >= 0),
  color text not null default '#34c995',
  icon text not null default '💳',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id,name)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  type text not null check (type in ('income','expense')),
  color text not null default '#34c995',
  icon text not null default '🏷️',
  is_active boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id,name,type)
);

alter table public.accounts add constraint accounts_workspace_id_id_key unique (workspace_id,id);
alter table public.categories add constraint categories_workspace_id_id_key unique (workspace_id,id);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete restrict,
  destination_account_id uuid references public.accounts(id) on delete restrict,
  category_id uuid references public.categories(id) on delete restrict,
  type text not null check (type in ('income','expense','transfer')),
  amount numeric(18,2) not null check (amount > 0),
  date date not null default current_date,
  title text not null check (char_length(title) between 1 and 160),
  note text,
  source text not null default 'manual' check (source in ('manual','whatsapp','receipt_ocr')),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transaction_shape check (
    (type in ('income','expense') and category_id is not null and destination_account_id is null)
    or
    (type = 'transfer' and category_id is null and destination_account_id is not null and destination_account_id <> account_id)
  )
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  month smallint not null check (month between 1 and 12),
  year smallint not null check (year between 2020 and 2100),
  amount_limit numeric(18,2) not null check (amount_limit > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id,category_id,month,year)
);

alter table public.transactions
  add constraint transactions_workspace_account_fk
    foreign key (workspace_id,account_id) references public.accounts(workspace_id,id),
  add constraint transactions_workspace_destination_fk
    foreign key (workspace_id,destination_account_id) references public.accounts(workspace_id,id),
  add constraint transactions_workspace_category_fk
    foreign key (workspace_id,category_id) references public.categories(workspace_id,id);

alter table public.budgets
  add constraint budgets_workspace_category_fk
    foreign key (workspace_id,category_id) references public.categories(workspace_id,id);

create index transactions_workspace_date_idx on public.transactions(workspace_id,date desc);
create index transactions_workspace_type_idx on public.transactions(workspace_id,type);
create index transactions_account_idx on public.transactions(account_id);
create index transactions_category_idx on public.transactions(category_id);
create index budgets_workspace_period_idx on public.budgets(workspace_id,year,month);
create index invitations_email_idx on public.workspace_invitations(lower(email));

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger workspaces_set_updated_at before update on public.workspaces for each row execute function public.set_updated_at();
create trigger accounts_set_updated_at before update on public.accounts for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger transactions_set_updated_at before update on public.transactions for each row execute function public.set_updated_at();
create trigger budgets_set_updated_at before update on public.budgets for each row execute function public.set_updated_at();

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id and user_id = auth.uid()
  );
$$;

create or replace function public.workspace_role(target_workspace_id uuid)
returns text
language sql stable security definer
set search_path = public
as $$
  select role from public.workspace_members
  where workspace_id = target_workspace_id and user_id = auth.uid()
  limit 1;
$$;

create or replace function public.can_manage_workspace(target_workspace_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(public.workspace_role(target_workspace_id) in ('owner','admin'), false);
$$;

create or replace function public.can_view_profile(target_user_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select target_user_id = auth.uid() or exists (
    select 1
    from public.workspace_members mine
    join public.workspace_members theirs on theirs.workspace_id = mine.workspace_id
    where mine.user_id = auth.uid() and theirs.user_id = target_user_id
  );
$$;

revoke all on function public.is_workspace_member(uuid) from public;
revoke all on function public.workspace_role(uuid) from public;
revoke all on function public.can_manage_workspace(uuid) from public;
revoke all on function public.can_view_profile(uuid) from public;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.workspace_role(uuid) to authenticated;
grant execute on function public.can_manage_workspace(uuid) to authenticated;
grant execute on function public.can_view_profile(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invitations enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

create policy "profiles_select_shared" on public.profiles for select to authenticated using (public.can_view_profile(id));
create policy "profiles_update_self" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "workspaces_select_member" on public.workspaces for select to authenticated using (public.is_workspace_member(id));
create policy "workspaces_insert_owner" on public.workspaces for insert to authenticated with check (owner_id = auth.uid());
create policy "workspaces_update_owner" on public.workspaces for update to authenticated using (public.workspace_role(id) = 'owner') with check (owner_id = auth.uid());
create policy "workspaces_delete_owner" on public.workspaces for delete to authenticated using (public.workspace_role(id) = 'owner');

create policy "members_select_member" on public.workspace_members for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members_insert_manager" on public.workspace_members for insert to authenticated with check (
  public.can_manage_workspace(workspace_id)
  or exists (select 1 from public.workspaces where id = workspace_id and owner_id = auth.uid() and user_id = auth.uid())
);
create policy "members_update_owner" on public.workspace_members for update to authenticated using (
  public.workspace_role(workspace_id) = 'owner' and role <> 'owner'
) with check (public.workspace_role(workspace_id) = 'owner' and role <> 'owner');
create policy "members_delete_owner" on public.workspace_members for delete to authenticated using (
  public.workspace_role(workspace_id) = 'owner' and role <> 'owner'
);

create policy "invitations_select_member" on public.workspace_invitations for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "invitations_insert_owner" on public.workspace_invitations for insert to authenticated with check (public.workspace_role(workspace_id) = 'owner' and invited_by = auth.uid());
create policy "invitations_update_owner" on public.workspace_invitations for update to authenticated using (public.workspace_role(workspace_id) = 'owner') with check (public.workspace_role(workspace_id) = 'owner');
create policy "invitations_delete_owner" on public.workspace_invitations for delete to authenticated using (public.workspace_role(workspace_id) = 'owner');

create policy "accounts_select_member" on public.accounts for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "accounts_insert_manager" on public.accounts for insert to authenticated with check (public.can_manage_workspace(workspace_id));
create policy "accounts_update_manager" on public.accounts for update to authenticated using (public.can_manage_workspace(workspace_id)) with check (public.can_manage_workspace(workspace_id));
create policy "accounts_delete_manager" on public.accounts for delete to authenticated using (public.can_manage_workspace(workspace_id));

create policy "categories_select_member" on public.categories for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "categories_insert_manager" on public.categories for insert to authenticated with check (public.can_manage_workspace(workspace_id));
create policy "categories_update_manager" on public.categories for update to authenticated using (public.can_manage_workspace(workspace_id)) with check (public.can_manage_workspace(workspace_id));
create policy "categories_delete_manager" on public.categories for delete to authenticated using (public.can_manage_workspace(workspace_id) and is_default = false);

create policy "transactions_select_member" on public.transactions for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "transactions_insert_member" on public.transactions for insert to authenticated with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());
create policy "transactions_update_creator_or_manager" on public.transactions for update to authenticated using (
  public.can_manage_workspace(workspace_id) or created_by = auth.uid()
) with check (public.can_manage_workspace(workspace_id) or created_by = auth.uid());
create policy "transactions_delete_creator_or_manager" on public.transactions for delete to authenticated using (
  public.can_manage_workspace(workspace_id) or created_by = auth.uid()
);

create policy "budgets_select_member" on public.budgets for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "budgets_insert_manager" on public.budgets for insert to authenticated with check (public.can_manage_workspace(workspace_id));
create policy "budgets_update_manager" on public.budgets for update to authenticated using (public.can_manage_workspace(workspace_id)) with check (public.can_manage_workspace(workspace_id));
create policy "budgets_delete_manager" on public.budgets for delete to authenticated using (public.can_manage_workspace(workspace_id));

create or replace function public.seed_workspace()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.workspace_members (workspace_id,user_id,role)
  values (new.id,new.owner_id,'owner')
  on conflict do nothing;

  insert into public.accounts (workspace_id,name,type,initial_balance,color,icon)
  values (new.id,'Cash','cash',0,'#34c995','💵');

  insert into public.categories (workspace_id,name,type,color,icon,is_default) values
    (new.id,'Makanan & Minuman','expense','#f47763','🍜',true),
    (new.id,'Transportasi','expense','#4c8dff','🚕',true),
    (new.id,'Belanja Bulanan','expense','#9b78db','🛒',true),
    (new.id,'Tagihan','expense','#f2ad3c','🧾',true),
    (new.id,'Listrik','expense','#f2ad3c','⚡',true),
    (new.id,'Air','expense','#4c8dff','💧',true),
    (new.id,'Internet','expense','#4c8dff','📶',true),
    (new.id,'Pulsa','expense','#4c8dff','📱',true),
    (new.id,'Sewa / Kontrakan','expense','#9b78db','🏠',true),
    (new.id,'Cicilan','expense','#f47763','📅',true),
    (new.id,'Kesehatan','expense','#ef6c8c','🩺',true),
    (new.id,'Pendidikan','expense','#4c8dff','🎓',true),
    (new.id,'Anak & Keluarga','expense','#ef6c8c','👨‍👩‍👧',true),
    (new.id,'Hiburan','expense','#9b78db','🎬',true),
    (new.id,'Liburan','expense','#34c995','🏝️',true),
    (new.id,'Donasi','expense','#34c995','🤲',true),
    (new.id,'Hadiah','expense','#ef6c8c','🎁',true),
    (new.id,'Perawatan Diri','expense','#ef6c8c','✨',true),
    (new.id,'Rumah Tangga','expense','#9b78db','🧹',true),
    (new.id,'Darurat','expense','#f47763','🚨',true),
    (new.id,'Lainnya','expense','#87949b','🏷️',true),
    (new.id,'Gaji','income','#34c995','💼',true),
    (new.id,'Freelance','income','#34c995','💻',true),
    (new.id,'Bisnis','income','#34c995','🏪',true),
    (new.id,'Bonus','income','#34c995','🎉',true),
    (new.id,'THR','income','#34c995','🌙',true),
    (new.id,'Investasi','income','#34c995','📈',true),
    (new.id,'Hadiah','income','#34c995','🎁',true),
    (new.id,'Refund','income','#34c995','↩️',true),
    (new.id,'Penjualan Barang','income','#34c995','📦',true),
    (new.id,'Lainnya','income','#87949b','🏷️',true);
  return new;
end;
$$;

create trigger seed_workspace_after_insert
after insert on public.workspaces
for each row execute function public.seed_workspace();

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  profile_name text;
begin
  profile_name := coalesce(nullif(new.raw_user_meta_data->>'display_name',''), split_part(new.email,'@',1));
  insert into public.profiles (id,display_name,email)
  values (new.id,profile_name,new.email);
  insert into public.workspaces (name,owner_id)
  values (profile_name || ' — Pribadi',new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill users who registered before this initial migration was applied.
insert into public.profiles (id,display_name,email)
select
  user_row.id,
  coalesce(
    nullif(user_row.raw_user_meta_data->>'display_name',''),
    split_part(user_row.email,'@',1)
  ),
  user_row.email
from auth.users user_row
where user_row.email is not null
on conflict (id) do nothing;

insert into public.workspaces (name,owner_id)
select
  coalesce(nullif(profile_row.display_name,''),split_part(profile_row.email,'@',1)) || ' — Pribadi',
  profile_row.id
from public.profiles profile_row
where not exists (
  select 1
  from public.workspace_members membership_row
  where membership_row.user_id = profile_row.id
);

create or replace view public.account_balances
with (security_invoker = true)
as
select
  a.*,
  a.initial_balance
  + coalesce(sum(case
      when t.type = 'income' and t.account_id = a.id then t.amount
      when t.type = 'expense' and t.account_id = a.id then -t.amount
      when t.type = 'transfer' and t.account_id = a.id then -t.amount
      when t.type = 'transfer' and t.destination_account_id = a.id then t.amount
      else 0
    end),0) as current_balance
from public.accounts a
left join public.transactions t
  on t.workspace_id = a.workspace_id
  and (t.account_id = a.id or t.destination_account_id = a.id)
group by a.id;

grant usage on schema public to authenticated;
grant select,insert,update,delete on all tables in schema public to authenticated;
grant select on public.account_balances to authenticated;
