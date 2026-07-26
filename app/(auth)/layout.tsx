import { Check } from "lucide-react";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <Logo />
        <div className="auth-quote">
          <h2>Keputusan kecil hari ini, <span>tenang di masa depan.</span></h2>
          <p>BudgetKu membantu kamu melihat, merencanakan, dan membicarakan uang dengan lebih sederhana.</p>
          <div className="auth-feature-list">
            <span><i><Check size={14}/></i> Semua akun keuangan dalam satu tempat</span>
            <span><i><Check size={14}/></i> Budget bulanan yang mudah dipantau</span>
            <span><i><Check size={14}/></i> Aman untuk keuangan pribadi dan bersama</span>
          </div>
        </div>
        <small>BudgetKu · Keuangan sehari-hari, tanpa ribet.</small>
      </section>
      <section className="auth-panel">{children}</section>
    </main>
  );
}
