import { notFound } from "next/navigation";
import { deleteTransaction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { TransactionForm } from "@/components/transaction-form";
import { getAccounts, getAppContext, getCategories, getTransaction } from "@/lib/data";

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const context = await getAppContext();
  const { id } = await params;
  let transaction;
  try {
    transaction = await getTransaction(context.workspace.id,id);
  } catch {
    notFound();
  }
  const [accounts, categories] = await Promise.all([
    getAccounts(context.workspace.id),
    getCategories(context.workspace.id),
  ]);
  return (
    <>
      <PageHeader title="Edit transaksi" description="Perbarui informasi atau hapus transaksi ini.">
        <form action={deleteTransaction}><input type="hidden" name="id" value={id}/><button className="button button-danger" type="submit">Hapus</button></form>
      </PageHeader>
      <TransactionForm accounts={accounts} categories={categories} transaction={transaction}/>
    </>
  );
}
