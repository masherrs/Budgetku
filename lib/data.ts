import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Account, Budget, Category, Profile, Transaction, Workspace, WorkspaceRole } from "@/lib/types";
import { currentMonth } from "@/lib/format";

export type AppContext = {
  user: { id: string; email: string };
  profile: Profile;
  workspace: Workspace;
  workspaces: Workspace[];
  role: WorkspaceRole;
};

export async function getAppContext(): Promise<AppContext> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const [{ data: profileData }, { data: membershipData }] = await Promise.all([
    supabase.from("profiles").select("id,display_name,email").eq("id", authData.user.id).single(),
    supabase
      .from("workspace_members")
      .select("role,workspaces(id,name,owner_id)")
      .eq("user_id", authData.user.id),
  ]);

  const workspaces = (membershipData ?? [])
    .map((item) => {
      const workspace = Array.isArray(item.workspaces) ? item.workspaces[0] : item.workspaces;
      return workspace ? { ...workspace, role: item.role as WorkspaceRole } : null;
    })
    .filter(Boolean) as Workspace[];

  if (!workspaces.length) {
    throw new Error("Workspace awal belum tersedia. Jalankan migration Supabase lalu daftar ulang.");
  }

  const cookieStore = await cookies();
  const requestedId = cookieStore.get("budgetku_workspace")?.value;
  const workspace = workspaces.find((item) => item.id === requestedId) ?? workspaces[0];
  const profile = (profileData ?? {
    id: authData.user.id,
    display_name: authData.user.user_metadata.display_name ?? null,
    email: authData.user.email ?? "",
  }) as Profile;

  return {
    user: { id: authData.user.id, email: authData.user.email ?? "" },
    profile,
    workspace,
    workspaces,
    role: workspace.role ?? "member",
  };
}

export async function getAccounts(workspaceId: string, includeInactive = false) {
  const supabase = await createClient();
  let query = supabase
    .from("account_balances")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at");
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Account[];
}

export async function getCategories(workspaceId: string, includeInactive = false) {
  const supabase = await createClient();
  let query = supabase
    .from("categories")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("type")
    .order("name");
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Category[];
}

export type TransactionFilters = {
  month?: string;
  type?: string;
  category?: string;
  account?: string;
};

export async function getTransactions(
  workspaceId: string,
  filters: TransactionFilters = {},
  limit = 100,
) {
  const supabase = await createClient();
  let query = supabase
    .from("transactions")
    .select(
      "*,accounts!transactions_account_id_fkey(name,icon,color),categories!transactions_category_id_fkey(name,icon,color)",
    )
    .eq("workspace_id", workspaceId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.month && /^\d{4}-\d{2}$/.test(filters.month)) {
    const start = `${filters.month}-01`;
    const date = new Date(`${start}T00:00:00`);
    date.setMonth(date.getMonth() + 1);
    const end = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
    query = query.gte("date", start).lt("date", end);
  }
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.category) query = query.eq("category_id", filters.category);
  if (filters.account) query = query.eq("account_id", filters.account);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Transaction[];
}

export async function getTransaction(workspaceId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Transaction;
}

export async function getBudgets(workspaceId: string, month: number, year: number) {
  const supabase = await createClient();
  const [{ data: budgets, error }, { data: expenses }] = await Promise.all([
    supabase
      .from("budgets")
      .select("*,categories!budgets_category_id_fkey(name,icon,color)")
      .eq("workspace_id", workspaceId)
      .eq("month", month)
      .eq("year", year)
      .order("created_at"),
    supabase
      .from("transactions")
      .select("category_id,amount")
      .eq("workspace_id", workspaceId)
      .eq("type", "expense")
      .gte("date", `${year}-${String(month).padStart(2, "0")}-01`)
      .lt(
        "date",
        `${month === 12 ? year + 1 : year}-${String(month === 12 ? 1 : month + 1).padStart(2, "0")}-01`,
      ),
  ]);
  if (error) throw error;
  const spentByCategory = new Map<string, number>();
  for (const transaction of expenses ?? []) {
    if (transaction.category_id) {
      spentByCategory.set(
        transaction.category_id,
        (spentByCategory.get(transaction.category_id) ?? 0) + Number(transaction.amount),
      );
    }
  }
  return (budgets ?? []).map((budget) => ({
    ...budget,
    spent: spentByCategory.get(budget.category_id) ?? 0,
  })) as Budget[];
}

export async function getDashboardData(workspaceId: string) {
  const { month, year } = currentMonth();
  const monthValue = `${year}-${String(month).padStart(2, "0")}`;
  const [accounts, transactions, budgets] = await Promise.all([
    getAccounts(workspaceId),
    getTransactions(workspaceId, { month: monthValue }, 1000),
    getBudgets(workspaceId, month, year),
  ]);
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const expense = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const totalBalance = accounts.reduce((sum, item) => sum + Number(item.current_balance ?? item.initial_balance), 0);
  const totalBudget = budgets.reduce((sum, item) => sum + Number(item.amount_limit), 0);
  const byCategory = new Map<string, number>();
  transactions.filter((item) => item.type === "expense").forEach((item) => {
    const name = item.categories?.name ?? "Lainnya";
    byCategory.set(name, (byCategory.get(name) ?? 0) + Number(item.amount));
  });
  const categories = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  return {
    accounts,
    transactions,
    budgets,
    income,
    expense,
    totalBalance,
    totalBudget,
    budgetRemaining: totalBudget - expense,
    categories,
  };
}
