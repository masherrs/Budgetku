import type { Account, Category } from "@/lib/types";
import { todayJakarta } from "@/lib/format";

const incomeWords = ["gaji", "bonus", "freelance", "refund", "bisnis", "thr", "penjualan"];
const categoryKeywords: Record<string, string[]> = {
  "Makanan & Minuman": ["makan", "kopi", "jajan", "ayam", "restoran", "bakso", "nasi"],
  Transportasi: ["bensin", "grab", "gojek", "parkir", "tol", "taksi", "transport"],
  Listrik: ["listrik", "token"],
  Internet: ["internet", "wifi"],
  Pulsa: ["pulsa", "paket data"],
  Tagihan: ["tagihan"],
  "Anak & Keluarga": ["anak", "keluarga"],
  Gaji: ["gaji"],
  Freelance: ["freelance"],
  Bonus: ["bonus", "thr"],
  Refund: ["refund"],
  Bisnis: ["bisnis"],
  "Penjualan Barang": ["penjualan", "jual"],
};

export type ParsedWhatsAppRow = {
  id: string;
  raw: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  account_id: string;
  category_id: string;
  date: string;
  needsReview: boolean;
};

export function parseWhatsAppText(
  text: string,
  accounts: Account[],
  categories: Category[],
): ParsedWhatsAppRow[] {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((raw, index) => {
    const lower = raw.toLowerCase();
    const amountMatch = lower.match(/(?:rp\s*)?(\d[\d.,]*)/i);
    const amount = amountMatch ? Number(amountMatch[1].replace(/[.,]/g, "")) : 0;
    const account = [...accounts]
      .sort((a,b)=>b.name.length-a.name.length)
      .find((item) => lower.includes(item.name.toLowerCase()));
    const type: "income" | "expense" = incomeWords.some((word)=>lower.includes(word)) ? "income" : "expense";
    const typedCategories = categories.filter((item)=>item.type === type);
    const matchedName = Object.entries(categoryKeywords).find(([,keywords])=>keywords.some((word)=>lower.includes(word)))?.[0];
    const category = typedCategories.find((item)=>item.name.toLowerCase() === matchedName?.toLowerCase())
      ?? typedCategories.find((item)=>item.name.toLowerCase() === "lainnya");
    const title = raw
      .replace(amountMatch?.[0] ?? "", "")
      .replace(account?.name ?? "", "")
      .replace(/\s+/g, " ")
      .trim();
    return {
      id: `${Date.now()}-${index}`,
      raw,
      title: title || "Transaksi WhatsApp",
      amount,
      type,
      account_id: account?.id ?? "",
      category_id: category?.id ?? "",
      date: todayJakarta(),
      needsReview: !amount || !account || !category,
    };
  });
}
