import Link from "next/link";
import { forgotPassword } from "../auth-actions";

export default async function ForgotPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="auth-card">
      <h1>Pulihkan akun</h1>
      <p>Masukkan email. Kami akan mengirim tautan untuk membuat kata sandi baru.</p>
      {params.error && <div className="form-message">{params.error}</div>}
      {params.success && <div className="form-message success">{params.success}</div>}
      <form action={forgotPassword}>
        <div className="field"><label htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" placeholder="nama@email.com" required /></div>
        <div style={{ marginTop: 22 }}><button className="button button-primary button-block" type="submit">Kirim tautan pemulihan</button></div>
      </form>
      <p className="auth-switch"><Link href="/login">← Kembali ke halaman masuk</Link></p>
    </div>
  );
}
