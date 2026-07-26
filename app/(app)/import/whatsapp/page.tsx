import { PageHeader } from "@/components/page-header";
import { WhatsAppImporter } from "@/components/whatsapp-importer";
import { getAccounts, getAppContext, getCategories } from "@/lib/data";

export default async function WhatsAppPage() {
  const context = await getAppContext();
  const [accounts,categories] = await Promise.all([getAccounts(context.workspace.id),getCategories(context.workspace.id)]);
  return (
    <>
      <PageHeader title="Import dari WhatsApp" description="Ubah catatan chat menjadi transaksi tanpa mengetik ulang."/>
      <WhatsAppImporter accounts={accounts} categories={categories}/>
    </>
  );
}
