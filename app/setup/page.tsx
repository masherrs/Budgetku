import Link from "next/link";
import { Wallet } from "lucide-react";

export default function SetupPage() {
  return (
    <main className="setup-notice">
      <section className="card">
        <i><Wallet size={28}/></i>
        <h1>Sambungkan Supabase untuk membuka aplikasi</h1>
        <p>Landing page sudah siap. Untuk memakai dashboard dan menyimpan data nyata, buat file <strong>.env.local</strong> lalu isi kredensial publik Supabase.</p>
        <code>NEXT_PUBLIC_SUPABASE_URL=...<br/>NEXT_PUBLIC_SUPABASE_ANON_KEY=...</code>
        <Link href="/" className="button button-primary" style={{ marginTop: 20 }}>Kembali ke beranda</Link>
      </section>
    </main>
  );
}
