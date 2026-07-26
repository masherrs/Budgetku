export type TransactionType = "income" | "expense" | "transfer";
export type WorkspaceRole = "owner" | "admin" | "member";

export type Profile = { id: string; display_name: string | null; email: string };
export type Workspace = { id: string; name: string; owner_id: string; role?: WorkspaceRole };
export type Account = {
  id: string; workspace_id: string; name: string; type: string;
  initial_balance: number; current_balance?: number; color: string;
  icon: string; is_active: boolean;
};
export type Category = {
  id: string; workspace_id: string; name: string; type: "income" | "expense";
  color: string; icon: string; is_active: boolean;
};
export type Transaction = {
  id: string; workspace_id: string; account_id: string;
  destination_account_id: string | null; category_id: string | null;
  type: TransactionType; amount: number; date: string; title: string;
  note: string | null; source: "manual" | "whatsapp" | "receipt_ocr";
  created_by: string;
  accounts?: Pick<Account, "name" | "icon" | "color"> | null;
  categories?: Pick<Category, "name" | "icon" | "color"> | null;
};
export type Budget = {
  id: string; category_id: string; month: number; year: number;
  amount_limit: number; categories?: Pick<Category, "name" | "icon" | "color"> | null;
  spent?: number;
};
