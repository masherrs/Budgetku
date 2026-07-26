import { createMonthlyReportPdf } from "@/lib/pdf/monthly-report";
import { getAppContext, getDashboardData } from "@/lib/data";
import { currentMonth } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const context = await getAppContext();
  const data = await getDashboardData(context.workspace.id);
  const { month, year } = currentMonth();
  const generatedAt = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(new Date());
  const pdf = await createMonthlyReportPdf({
    workspaceName: context.workspace.name,
    displayName: context.profile.display_name ?? context.user.email,
    month,
    year,
    generatedAt,
    totalBalance: data.totalBalance,
    income: data.income,
    expense: data.expense,
    totalBudget: data.totalBudget,
    budgetRemaining: data.budgetRemaining,
    accounts: data.accounts,
    categories: data.categories,
    budgets: data.budgets,
    transactions: data.transactions,
  });
  const filename = `BudgetKu-Laporan-${year}-${String(month).padStart(2, "0")}.pdf`;

  return new Response(Uint8Array.from(pdf).buffer, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/pdf",
    },
  });
}
