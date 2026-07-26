import Link from "next/link";
import { register } from "../auth-actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="auth-card">
      <h1>Mulai lebih teratur</h1>
      <p>Buat akun BudgetKu dan catat transaksi pertamamu hari ini.</p>
      {error && <div className="form-message">{error}</div>}
      <form action={register}>
        <div className="field"><label htmlFor="name">Nama lengkap</label><input className="input" id="name" name="name" placeholder="Nama kamu" required autoComplete="name" /></div>
        <div className="field"><label htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" placeholder="nama@email.com" required autoComplete="email" /></div>
        <div className="field"><label htmlFor="password">Kata sandi</label><input className="input" id="password" name="password" type="password" minLength={8} placeholder="Minimal 8 karakter" required autoComplete="new-password" /></div>
        <div className="auth-row"><span>Dengan mendaftar, kamu menyetujui penggunaan BudgetKu.</span></div>
        <button className="button button-primary button-block" type="submit">Buat akun gratis</button>
      </form>
      <p className="auth-switch">Sudah punya akun? <Link href="/login">Masuk</Link></p>
    </div>
  );
}
