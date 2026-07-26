import { PageHeader } from "@/components/page-header";
import { TransactionForm } from "@/components/transaction-form";
import { getAccounts, getAppContext, getCategories } from "@/lib/data";

export default async function NewTransactionPage() {
  const context = await getAppContext();
  const [accounts, categories] = await Promise.all([getAccounts(context.workspace.id), getCategories(context.workspace.id)]);
  return (
    <>
      <PageHeader title="Tambah transaksi" description="Catat dalam beberapa detik. Kamu bisa mengubahnya nanti."/>
      <TransactionForm accounts={accounts} categories={categories}/>
    </>
  );
}
