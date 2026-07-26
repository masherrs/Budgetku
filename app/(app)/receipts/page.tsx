import { Camera, LockKeyhole } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function ReceiptsPage() {
  return (
    <>
      <PageHeader title="Scan struk" description="Masukkan transaksi dari foto struk belanja."/>
      <section className="card empty-state" style={{ minHeight: 470 }}>
        <div>
          <i><Camera size={28}/></i>
          <span className="badge mint">Segera hadir · Phase 2</span>
          <h3 style={{ marginTop: 14 }}>OCR struk sedang kami siapkan</h3>
          <p>Nantinya kamu bisa unggah foto struk, periksa hasil pembacaan, lalu simpan transaksi. Untuk saat ini, gunakan tambah transaksi atau Import dari WhatsApp.</p>
          <button className="button button-outline" disabled><LockKeyhole size={16}/>Upload belum tersedia</button>
        </div>
      </section>
    </>
  );
}
