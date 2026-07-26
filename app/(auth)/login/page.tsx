import Link from "next/link";
import { login } from "../auth-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="auth-card">
      <h1>Selamat datang kembali</h1>
      <p>Masuk untuk melanjutkan mengelola keuanganmu.</p>
      {params.error && <div className="form-message">{params.error}</div>}
      {params.success && <div className="form-message success">{params.success}</div>}
      <form action={login}>
        <div className="field"><label htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" placeholder="nama@email.com" required autoComplete="email" /></div>
        <div className="field"><label htmlFor="password">Kata sandi</label><input className="input" id="password" name="password" type="password" placeholder="Minimal 8 karakter" required autoComplete="current-password" /></div>
        <div className="auth-row"><span>Data tersimpan dengan aman</span><Link href="/forgot-password">Lupa kata sandi?</Link></div>
        <button className="button button-primary button-block" type="submit">Masuk ke BudgetKu</button>
      </form>
      <p className="auth-switch">Belum punya akun? <Link href="/register">Daftar gratis</Link></p>
    </div>
  );
}
