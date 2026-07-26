"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAppContext } from "@/lib/data";

const moneySchema = z.coerce.number().positive("Nominal harus lebih dari 0.");

function required(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function switchWorkspace(formData: FormData) {
  const { workspaces } = await getAppContext();
  const workspaceId = required(formData, "workspace_id");
  if (!workspaces.some((item) => item.id === workspaceId)) return;
  const cookieStore = await cookies();
  cookieStore.set("budgetku_workspace", workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}

export async function saveTransaction(formData: FormData) {
  const context = await getAppContext();
  const type = z.enum(["income", "expense", "transfer"]).parse(required(formData, "type"));
  const accountId = required(formData, "account_id");
  const categoryId = required(formData, "category_id") || null;
  const destinationId = required(formData, "destination_account_id") || null;
  const amount = moneySchema.parse(formData.get("amount"));
  const date = required(formData, "date");
  const title = required(formData, "title");
  if (!accountId || !date || !title) throw new Error("Akun, tanggal, dan judul wajib diisi.");
  if (type !== "transfer" && !categoryId) throw new Error("Kategori wajib dipilih.");
  if (type === "transfer" && (!destinationId || destinationId === accountId)) {
    throw new Error("Pilih akun tujuan yang berbeda.");
  }

  const payload = {
    workspace_id: context.workspace.id,
    account_id: accountId,
    destination_account_id: type === "transfer" ? destinationId : null,
    category_id: type === "transfer" ? null : categoryId,
    type,
    amount,
    date,
    title,
    note: required(formData, "note") || null,
    source: required(formData, "source") || "manual",
    created_by: context.user.id,
  };
  const id = required(formData, "id");
  const supabase = await createClient();
  const result = id
    ? await supabase.from("transactions").update(payload).eq("id", id).eq("workspace_id", context.workspace.id)
    : await supabase.from("transactions").insert(payload);
  if (result.error) throw result.error;
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
  redirect("/transactions");
}

export async function deleteTransaction(formData: FormData) {
  const { workspace } = await getAppContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", required(formData, "id"))
    .eq("workspace_id", workspace.id);
  if (error) throw error;
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
}

export async function saveAccount(formData: FormData) {
  const { workspace } = await getAppContext();
  const payload = {
    workspace_id: workspace.id,
    name: required(formData, "name"),
    type: required(formData, "type"),
    initial_balance: z.coerce.number().min(0).parse(formData.get("initial_balance")),
    color: required(formData, "color") || "#34c995",
    icon: required(formData, "icon") || "💳",
  };
  if (!payload.name) throw new Error("Nama akun wajib diisi.");
  const supabase = await createClient();
  const id = required(formData, "id");
  const result = id
    ? await supabase.from("accounts").update(payload).eq("id", id).eq("workspace_id", workspace.id)
    : await supabase.from("accounts").insert(payload);
  const { error } = result;
  if (error) throw error;
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}

export async function toggleAccount(formData: FormData) {
  const { workspace } = await getAppContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .update({ is_active: required(formData, "is_active") !== "true" })
    .eq("id", required(formData, "id"))
    .eq("workspace_id", workspace.id);
  if (error) throw error;
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}

export async function saveCategory(formData: FormData) {
  const { workspace } = await getAppContext();
  const payload = {
    workspace_id: workspace.id,
    name: required(formData, "name"),
    type: z.enum(["income", "expense"]).parse(required(formData, "type")),
    color: required(formData, "color") || "#34c995",
    icon: required(formData, "icon") || "🏷️",
  };
  if (!payload.name) throw new Error("Nama kategori wajib diisi.");
  const supabase = await createClient();
  const id = required(formData, "id");
  const result = id
    ? await supabase.from("categories").update(payload).eq("id", id).eq("workspace_id", workspace.id)
    : await supabase.from("categories").insert(payload);
  const { error } = result;
  if (error) throw error;
  revalidatePath("/categories");
}

export async function toggleCategory(formData: FormData) {
  const { workspace } = await getAppContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_active: required(formData, "is_active") !== "true" })
    .eq("id", required(formData, "id"))
    .eq("workspace_id", workspace.id);
  if (error) throw error;
  revalidatePath("/categories");
}

export async function saveBudget(formData: FormData) {
  const { workspace } = await getAppContext();
  const payload = {
    workspace_id: workspace.id,
    category_id: required(formData, "category_id"),
    month: z.coerce.number().int().min(1).max(12).parse(formData.get("month")),
    year: z.coerce.number().int().min(2020).max(2100).parse(formData.get("year")),
    amount_limit: moneySchema.parse(formData.get("amount_limit")),
  };
  const supabase = await createClient();
  const { error } = await supabase
    .from("budgets")
    .upsert(payload, { onConflict: "workspace_id,category_id,month,year" });
  if (error) throw error;
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}

export async function createWorkspace(formData: FormData) {
  const context = await getAppContext();
  const name = required(formData, "name");
  if (name.length < 2) throw new Error("Nama workspace minimal 2 karakter.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .insert({ name, owner_id: context.user.id })
    .select("id")
    .single();
  if (error) throw error;
  const cookieStore = await cookies();
  cookieStore.set("budgetku_workspace", data.id, { httpOnly: true, sameSite: "lax" });
  revalidatePath("/", "layout");
}

export async function inviteMember(formData: FormData) {
  const context = await getAppContext();
  const email = z.string().email().parse(required(formData, "email"));
  const role = z.enum(["admin", "member"]).parse(required(formData, "role"));
  const supabase = await createClient();
  const { error } = await supabase.from("workspace_invitations").insert({
    workspace_id: context.workspace.id,
    email: email.toLowerCase(),
    role,
    invited_by: context.user.id,
  });
  if (error) throw error;
  revalidatePath("/members");
}

export async function updateMemberRole(formData: FormData) {
  const context = await getAppContext();
  const role = z.enum(["admin", "member"]).parse(required(formData, "role"));
  const supabase = await createClient();
  const { error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("workspace_id", context.workspace.id)
    .eq("user_id", required(formData, "user_id"))
    .neq("role", "owner");
  if (error) throw error;
  revalidatePath("/members");
}

export async function updateProfile(formData: FormData) {
  const context = await getAppContext();
  const displayName = required(formData, "display_name");
  if (displayName.length < 2) throw new Error("Nama minimal 2 karakter.");
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", context.user.id);
  if (error) throw error;
  revalidatePath("/", "layout");
  revalidatePath("/profile");
}

type WhatsAppRow = {
  title: string;
  amount: number;
  type: "income" | "expense";
  account_id: string;
  category_id: string;
  date: string;
};

export async function importWhatsApp(formData: FormData) {
  const context = await getAppContext();
  const rows = z.array(z.object({
    title: z.string().min(1),
    amount: z.number().positive(),
    type: z.enum(["income", "expense"]),
    account_id: z.string().uuid(),
    category_id: z.string().uuid(),
    date: z.string().min(10),
  })).parse(JSON.parse(required(formData, "rows"))) as WhatsAppRow[];
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").insert(
    rows.map((row) => ({
      ...row,
      workspace_id: context.workspace.id,
      source: "whatsapp",
      created_by: context.user.id,
      note: "Diimpor dari teks WhatsApp",
    })),
  );
  if (error) throw error;
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  redirect("/transactions?source=whatsapp");
}
