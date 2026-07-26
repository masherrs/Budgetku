import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Landmark,
  MessageCircle,
  PieChart,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import { Logo } from "@/components/logo";

const transactions = [
  { icon: "🍜", title: "Makan siang", meta: "Makanan · Hari ini", amount: "-Rp25.000" },
  { icon: "💼", title: "Freelance desain", meta: "Freelance · Hari ini", amount: "+Rp750.000" },
  { icon: "⚡", title: "Token listrik", meta: "Tagihan · Kemarin", amount: "-Rp300.000" },
];

export default function Home() {
  return (
    <main className="landing">
      <nav className="landing-nav shell">
        <Logo />
        <div className="landing-nav-links">
          <a href="#fitur">Fitur</a>
          <a href="#cara-kerja">Cara kerja</a>
        </div>
        <div className="nav-actions">
          <Link href="/login" className="button button-ghost">Masuk</Link>
          <Link href="/register" className="button button-primary">Mulai gratis</Link>
        </div>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> Dibuat untuk cara hidup Indonesia</div>
          <h1>Keuangan rapi.<br /><span>Hidup lebih tenang.</span></h1>
          <p>
            Catat pengeluaran, atur budget, dan kelola uang bersama orang tersayang—
            semua dalam satu tempat yang sederhana.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="button button-primary button-lg">
              Mulai kelola uang <ArrowRight size={18} />
            </Link>
            <span><Check size={16} /> Gratis untuk memulai</span>
          </div>
          <div className="trust-row">
            <div className="avatar-stack"><i>R</i><i>A</i><i>D</i></div>
            <p><strong>Lebih dari sekadar catatan</strong><br />Satu pandangan untuk semua keuanganmu</p>
          </div>
        </div>

        <div className="phone-stage" aria-label="Pratinjau dashboard BudgetKu">
          <div className="float-pill float-pill-top"><span>↗</span><div><small>Pemasukan</small><strong>+ Rp750.000</strong></div></div>
          <div className="phone">
            <div className="phone-top"><div><small>Selamat pagi,</small><strong>Rani 👋</strong></div><button aria-label="Notifikasi">🔔</button></div>
            <div className="balance-card">
              <small>Total saldo</small>
              <h3>Rp12.450.000</h3>
              <div><span>↗ Rp5,75 jt masuk</span><span>↘ Rp3,21 jt keluar</span></div>
            </div>
            <div className="quick-actions"><button><b>＋</b><span>Catat</span></button><button><b>⇄</b><span>Transfer</span></button><button><b>◎</b><span>Budget</span></button><button><b>⋯</b><span>Lainnya</span></button></div>
            <div className="budget-mini">
              <div><strong>Budget Juli</strong><span>62% terpakai</span></div>
              <div className="progress"><i style={{ width: "62%" }} /></div>
              <small>Rp3.100.000 dari Rp5.000.000</small>
            </div>
            <div className="phone-section-title"><strong>Transaksi terbaru</strong><span>Lihat semua</span></div>
            <div className="mini-transactions">
              {transactions.map((item) => (
                <div key={item.title}><i>{item.icon}</i><p><strong>{item.title}</strong><small>{item.meta}</small></p><b className={item.amount.startsWith("+") ? "positive" : ""}>{item.amount}</b></div>
              ))}
            </div>
          </div>
          <div className="float-pill float-pill-bottom"><span>✓</span><div><small>Budget bulan ini</small><strong>Masih aman</strong></div></div>
        </div>
      </section>

      <section className="proof-strip">
        <div className="shell proof-grid">
          <div><strong>1 ruang</strong><span>untuk semua akun</span></div>
          <div><strong>3 detik</strong><span>untuk catat transaksi</span></div>
          <div><strong>100%</strong><span>data milik kamu</span></div>
          <div><strong>Rp</strong><span>format rupiah otomatis</span></div>
        </div>
      </section>

      <section id="fitur" className="feature-section shell">
        <div className="section-heading">
          <div className="eyebrow">Semua yang kamu butuhkan</div>
          <h2>Lebih mudah paham ke mana uangmu pergi</h2>
          <p>Fitur yang terasa ringan untuk dipakai setiap hari, tetapi lengkap saat kamu membutuhkannya.</p>
        </div>
        <div className="feature-grid">
          <article className="feature-card featured">
            <div className="feature-icon"><PieChart /></div><h3>Budget yang mudah dipahami</h3>
            <p>Lihat pemakaian per kategori dan dapatkan peringatan sebelum budget habis.</p>
            <div className="mock-bars">
              <div><span><i>🍜</i>Makanan</span><b>72%</b></div><div className="progress"><i style={{ width: "72%" }} /></div>
              <div><span><i>🚕</i>Transportasi</span><b>48%</b></div><div className="progress mint"><i style={{ width: "48%" }} /></div>
            </div>
          </article>
          <article className="feature-card"><div className="feature-icon mint"><MessageCircle /></div><h3>Import dari WhatsApp</h3><p>Paste catatan transaksi dari chat. BudgetKu membantu membaca nominal, akun, dan kategorinya.</p><span className="chat-bubble">kopi 18000 gopay</span></article>
          <article className="feature-card"><div className="feature-icon coral"><WalletCards /></div><h3>Semua akun, satu tampilan</h3><p>Cash, bank, dan e-wallet tersusun rapi dengan saldo yang selalu terbarui.</p><div className="account-chips"><span>Cash</span><span>BCA</span><span>GoPay</span></div></article>
          <article className="feature-card"><div className="feature-icon blue"><Users /></div><h3>Kelola bersama</h3><p>Buat ruang keuangan keluarga atau tim kecil dengan kontrol peran yang aman.</p><div className="member-row"><div className="avatar-stack"><i>R</i><i>A</i><i>D</i></div><span>+ Undang anggota</span></div></article>
          <article className="feature-card"><div className="feature-icon amber"><Landmark /></div><h3>Insight bulanan</h3><p>Pemasukan, pengeluaran, dan kategori terbesar langsung terlihat tanpa spreadsheet.</p><div className="spark-bars">{[42,65,38,82,56,72,50].map((height, index)=><i key={index} style={{height:`${height}%`}} />)}</div></article>
          <article className="feature-card"><div className="feature-icon mint"><ShieldCheck /></div><h3>Aman per workspace</h3><p>Data dipisahkan dengan kebijakan akses Supabase. Anggota hanya melihat ruang yang mereka ikuti.</p><div className="security-label"><ShieldCheck size={17}/> Row Level Security aktif</div></article>
        </div>
      </section>

      <section id="cara-kerja" className="cta-section shell">
        <div>
          <div className="eyebrow light">Mulai hari ini</div>
          <h2>Uangmu layak dikelola dengan tenang.</h2>
          <p>Buat akun, catat transaksi pertama, dan lihat gambaran keuanganmu dalam hitungan menit.</p>
        </div>
        <Link href="/register" className="button button-white button-lg">Buat akun gratis <ChevronRight size={18}/></Link>
      </section>

      <footer className="landing-footer shell"><Logo /><p>© 2026 BudgetKu. Dibuat untuk keputusan keuangan yang lebih baik.</p><Link href="/login">Masuk</Link></footer>
    </main>
  );
}
