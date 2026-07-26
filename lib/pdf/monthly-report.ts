import {
  PDFDocument,
  PDFFont,
  PDFPage,
  rgb,
  StandardFonts,
} from "pdf-lib";
import type { Account, Budget, Transaction } from "@/lib/types";
import { monthLabel } from "@/lib/format";

export type MonthlyReportInput = {
  workspaceName: string;
  displayName: string;
  month: number;
  year: number;
  generatedAt: string;
  totalBalance: number;
  income: number;
  expense: number;
  totalBudget: number;
  budgetRemaining: number;
  accounts: Account[];
  categories: Array<[string, number]>;
  budgets: Budget[];
  transactions: Transaction[];
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const color = {
  navy: rgb(11 / 255, 37 / 255, 55 / 255),
  navyLight: rgb(20 / 255, 57 / 255, 77 / 255),
  mint: rgb(52 / 255, 201 / 255, 149 / 255),
  mintDark: rgb(31 / 255, 143 / 255, 108 / 255),
  mintSoft: rgb(231 / 255, 248 / 255, 241 / 255),
  coral: rgb(244 / 255, 119 / 255, 99 / 255),
  coralSoft: rgb(1, 240 / 255, 237 / 255),
  amber: rgb(242 / 255, 173 / 255, 60 / 255),
  amberSoft: rgb(1, 247 / 255, 225 / 255),
  ink: rgb(23 / 255, 43 / 255, 56 / 255),
  muted: rgb(113 / 255, 128 / 255, 139 / 255),
  line: rgb(230 / 255, 236 / 255, 239 / 255),
  canvas: rgb(247 / 255, 250 / 255, 249 / 255),
  white: rgb(1, 1, 1),
};

function safeText(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/[–—−]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\u00a0/g, " ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e\u00a1-\u00ff]/g, "")
    .trim();
}

function money(value: number | string | null | undefined) {
  return `Rp ${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0))}`;
}

function reportDate(value: string) {
  return safeText(
    new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(new Date(`${value}T00:00:00+07:00`)),
  );
}

function truncate(text: string, font: PDFFont, size: number, maxWidth: number) {
  const clean = safeText(text);
  if (font.widthOfTextAtSize(clean, size) <= maxWidth) return clean;
  let result = clean;
  while (result.length && font.widthOfTextAtSize(`${result}...`, size) > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result.trimEnd()}...`;
}

function drawLabel(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size = 7,
) {
  page.drawText(safeText(text).toUpperCase(), {
    x,
    y,
    font,
    size,
    color: color.muted,
  });
}

function drawMetricCard({
  page,
  x,
  y,
  width,
  label,
  value,
  note,
  accent,
  fonts,
}: {
  page: PDFPage;
  x: number;
  y: number;
  width: number;
  label: string;
  value: string;
  note: string;
  accent: typeof color.mint;
  fonts: { regular: PDFFont; bold: PDFFont };
}) {
  page.drawRectangle({
    x,
    y,
    width,
    height: 58,
    color: color.white,
    borderColor: color.line,
    borderWidth: 0.8,
  });
  page.drawRectangle({ x, y, width: 4, height: 58, color: accent });
  page.drawCircle({ x: x + width - 20, y: y + 39, size: 8, color: accent, opacity: 0.14 });
  drawLabel(page, label, x + 16, y + 40, fonts.bold);
  page.drawText(truncate(value, fonts.bold, 15, width - 32), {
    x: x + 16,
    y: y + 19,
    font: fonts.bold,
    size: 15,
    color: color.navy,
  });
  page.drawText(truncate(note, fonts.regular, 6.5, width - 32), {
    x: x + 16,
    y: y + 7,
    font: fonts.regular,
    size: 6.5,
    color: color.muted,
  });
}

function drawProgressBar(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  percent: number,
  fill: typeof color.mint,
) {
  page.drawRectangle({ x, y, width, height: 5, color: color.line });
  page.drawRectangle({
    x,
    y,
    width: Math.max(2, width * Math.min(Math.max(percent, 0), 1)),
    height: 5,
    color: fill,
  });
}

function drawOverviewPage(
  document: PDFDocument,
  data: MonthlyReportInput,
  fonts: { regular: PDFFont; bold: PDFFont },
) {
  const page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: color.canvas });
  page.drawRectangle({ x: 0, y: 687, width: PAGE_WIDTH, height: 155, color: color.navy });
  page.drawRectangle({ x: 0, y: 687, width: PAGE_WIDTH, height: 4, color: color.mint });
  page.drawCircle({ x: 548, y: 818, size: 74, color: color.mint, opacity: 0.08 });
  page.drawCircle({ x: 544, y: 813, size: 41, borderColor: color.mint, borderWidth: 12, opacity: 0.1 });

  page.drawText("Budget", { x: MARGIN, y: 805, font: fonts.bold, size: 16, color: color.white });
  page.drawText("Ku", {
    x: MARGIN + fonts.bold.widthOfTextAtSize("Budget", 16),
    y: 805,
    font: fonts.bold,
    size: 16,
    color: color.mint,
  });
  page.drawRectangle({
    x: 429,
    y: 800,
    width: 126,
    height: 22,
    color: color.navyLight,
    borderColor: rgb(46 / 255, 91 / 255, 111 / 255),
    borderWidth: 0.7,
  });
  page.drawText("LAPORAN BULANAN", {
    x: 447,
    y: 807,
    font: fonts.bold,
    size: 6.5,
    color: color.mint,
  });

  page.drawText("Ringkasan keuangan", {
    x: MARGIN,
    y: 759,
    font: fonts.bold,
    size: 25,
    color: color.white,
  });
  page.drawText(safeText(monthLabel(data.month, data.year)), {
    x: MARGIN,
    y: 737,
    font: fonts.regular,
    size: 11,
    color: rgb(192 / 255, 211 / 255, 219 / 255),
  });
  page.drawText(truncate(data.workspaceName, fonts.bold, 8, 280), {
    x: MARGIN,
    y: 710,
    font: fonts.bold,
    size: 8,
    color: color.mint,
  });
  page.drawText(`Disiapkan untuk ${truncate(data.displayName, fonts.regular, 8, 170)}`, {
    x: 328,
    y: 710,
    font: fonts.regular,
    size: 8,
    color: rgb(170 / 255, 194 / 255, 204 / 255),
  });

  drawLabel(page, "Ikhtisar", MARGIN, 659, fonts.bold);
  const cardWidth = (CONTENT_WIDTH - 12) / 2;
  drawMetricCard({
    page,
    x: MARGIN,
    y: 586,
    width: cardWidth,
    label: "Total saldo",
    value: money(data.totalBalance),
    note: `${data.accounts.length} akun aktif`,
    accent: color.navyLight,
    fonts,
  });
  drawMetricCard({
    page,
    x: MARGIN + cardWidth + 12,
    y: 586,
    width: cardWidth,
    label: "Pemasukan",
    value: money(data.income),
    note: "Bulan berjalan",
    accent: color.mint,
    fonts,
  });
  drawMetricCard({
    page,
    x: MARGIN,
    y: 516,
    width: cardWidth,
    label: "Pengeluaran",
    value: money(data.expense),
    note: `${data.transactions.filter((item) => item.type === "expense").length} transaksi pengeluaran`,
    accent: color.coral,
    fonts,
  });
  drawMetricCard({
    page,
    x: MARGIN + cardWidth + 12,
    y: 516,
    width: cardWidth,
    label: "Sisa budget",
    value: money(data.budgetRemaining),
    note: `Dari total ${money(data.totalBudget)}`,
    accent: data.budgetRemaining < 0 ? color.coral : color.amber,
    fonts,
  });

  page.drawRectangle({
    x: MARGIN,
    y: 398,
    width: CONTENT_WIDTH,
    height: 94,
    color: color.white,
    borderColor: color.line,
    borderWidth: 0.8,
  });
  drawLabel(page, "Arus uang", MARGIN + 16, 472, fonts.bold);
  const maxFlow = Math.max(data.income, data.expense, 1);
  const flowWidth = 205;
  page.drawText("Pemasukan", {
    x: MARGIN + 16,
    y: 451,
    font: fonts.regular,
    size: 7,
    color: color.muted,
  });
  page.drawText(money(data.income), {
    x: MARGIN + 16,
    y: 437,
    font: fonts.bold,
    size: 10,
    color: color.mintDark,
  });
  drawProgressBar(page, MARGIN + 16, 422, flowWidth, data.income / maxFlow, color.mint);
  page.drawText("Pengeluaran", {
    x: MARGIN + 16,
    y: 407,
    font: fonts.regular,
    size: 7,
    color: color.muted,
  });
  page.drawText(money(data.expense), {
    x: MARGIN + 82,
    y: 407,
    font: fonts.bold,
    size: 7,
    color: color.coral,
  });

  page.drawLine({
    start: { x: 292, y: 413 },
    end: { x: 292, y: 477 },
    thickness: 0.7,
    color: color.line,
  });
  drawLabel(page, "Catatan bulan ini", 311, 472, fonts.bold);
  const savings = data.income - data.expense;
  const expenseRatio = data.income > 0 ? Math.round((data.expense / data.income) * 100) : 0;
  page.drawText(savings >= 0 ? "Arus kas positif" : "Arus kas perlu perhatian", {
    x: 311,
    y: 449,
    font: fonts.bold,
    size: 11,
    color: savings >= 0 ? color.mintDark : color.coral,
  });
  page.drawText(
    savings >= 0
      ? `Surplus ${money(savings)} setelah pengeluaran.`
      : `Defisit ${money(Math.abs(savings))} pada periode ini.`,
    {
      x: 311,
      y: 433,
      font: fonts.regular,
      size: 7,
      color: color.muted,
    },
  );
  page.drawText(
    data.income > 0
      ? `${expenseRatio}% pemasukan telah digunakan.`
      : "Belum ada pemasukan tercatat.",
    {
      x: 311,
      y: 417,
      font: fonts.regular,
      size: 7,
      color: color.muted,
    },
  );

  const panelWidth = (CONTENT_WIDTH - 12) / 2;
  const panelY = 166;
  const panelHeight = 208;
  page.drawRectangle({
    x: MARGIN,
    y: panelY,
    width: panelWidth,
    height: panelHeight,
    color: color.white,
    borderColor: color.line,
    borderWidth: 0.8,
  });
  page.drawRectangle({
    x: MARGIN + panelWidth + 12,
    y: panelY,
    width: panelWidth,
    height: panelHeight,
    color: color.white,
    borderColor: color.line,
    borderWidth: 0.8,
  });

  drawLabel(page, "Saldo per akun", MARGIN + 16, 350, fonts.bold);
  page.drawText(`${data.accounts.length} akun aktif`, {
    x: MARGIN + 16,
    y: 334,
    font: fonts.regular,
    size: 7,
    color: color.muted,
  });
  const accountRows = data.accounts.slice(0, 5);
  if (accountRows.length) {
    accountRows.forEach((account, index) => {
      const y = 307 - index * 28;
      page.drawCircle({ x: MARGIN + 20, y: y + 3, size: 3, color: color.mint });
      page.drawText(truncate(account.name, fonts.regular, 8, 105), {
        x: MARGIN + 31,
        y,
        font: fonts.regular,
        size: 8,
        color: color.ink,
      });
      const value = money(account.current_balance ?? account.initial_balance);
      const valueWidth = fonts.bold.widthOfTextAtSize(value, 7.5);
      page.drawText(value, {
        x: MARGIN + panelWidth - 16 - valueWidth,
        y,
        font: fonts.bold,
        size: 7.5,
        color: color.navy,
      });
      if (index < accountRows.length - 1) {
        page.drawLine({
          start: { x: MARGIN + 16, y: y - 10 },
          end: { x: MARGIN + panelWidth - 16, y: y - 10 },
          thickness: 0.5,
          color: color.line,
        });
      }
    });
  } else {
    page.drawText("Belum ada akun aktif.", {
      x: MARGIN + 16,
      y: 294,
      font: fonts.regular,
      size: 8,
      color: color.muted,
    });
  }
  if (data.accounts.length > 5) {
    page.drawText(`+${data.accounts.length - 5} akun lainnya`, {
      x: MARGIN + 16,
      y: 181,
      font: fonts.bold,
      size: 6.5,
      color: color.mintDark,
    });
  }

  const categoryX = MARGIN + panelWidth + 12;
  drawLabel(page, "Pengeluaran terbesar", categoryX + 16, 350, fonts.bold);
  page.drawText("Berdasarkan kategori", {
    x: categoryX + 16,
    y: 334,
    font: fonts.regular,
    size: 7,
    color: color.muted,
  });
  const categoryRows = data.categories.slice(0, 5);
  const totalCategory = data.categories.reduce((sum, item) => sum + item[1], 0);
  if (categoryRows.length) {
    categoryRows.forEach(([name, amount], index) => {
      const y = 307 - index * 28;
      const percent = totalCategory ? amount / totalCategory : 0;
      page.drawText(truncate(name, fonts.regular, 7.5, 108), {
        x: categoryX + 16,
        y: y + 4,
        font: fonts.regular,
        size: 7.5,
        color: color.ink,
      });
      page.drawText(`${Math.round(percent * 100)}%`, {
        x: categoryX + panelWidth - 35,
        y: y + 4,
        font: fonts.bold,
        size: 7,
        color: color.coral,
      });
      drawProgressBar(page, categoryX + 16, y - 7, panelWidth - 32, percent, color.coral);
    });
  } else {
    page.drawText("Belum ada pengeluaran bulan ini.", {
      x: categoryX + 16,
      y: 294,
      font: fonts.regular,
      size: 8,
      color: color.muted,
    });
  }

  page.drawText("Laporan ini dibuat otomatis dari data BudgetKu.", {
    x: MARGIN,
    y: 135,
    font: fonts.regular,
    size: 7,
    color: color.muted,
  });
  page.drawText(`Dibuat ${safeText(data.generatedAt)} WIB`, {
    x: MARGIN,
    y: 122,
    font: fonts.regular,
    size: 7,
    color: color.muted,
  });
}

function drawDetailHeader(
  page: PDFPage,
  title: string,
  subtitle: string,
  fonts: { regular: PDFFont; bold: PDFFont },
) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: color.canvas });
  page.drawRectangle({ x: 0, y: 754, width: PAGE_WIDTH, height: 88, color: color.navy });
  page.drawRectangle({ x: 0, y: 754, width: 6, height: 88, color: color.mint });
  page.drawText("BudgetKu", { x: MARGIN, y: 808, font: fonts.bold, size: 11, color: color.mint });
  page.drawText(safeText(title), { x: MARGIN, y: 783, font: fonts.bold, size: 20, color: color.white });
  page.drawText(safeText(subtitle), {
    x: MARGIN,
    y: 767,
    font: fonts.regular,
    size: 7.5,
    color: rgb(184 / 255, 205 / 255, 214 / 255),
  });
}

function drawBudgetSection(
  page: PDFPage,
  data: MonthlyReportInput,
  fonts: { regular: PDFFont; bold: PDFFont },
) {
  const budgets = [...data.budgets]
    .sort((a, b) => {
      const aRatio = Number(a.amount_limit) ? Number(a.spent ?? 0) / Number(a.amount_limit) : 0;
      const bRatio = Number(b.amount_limit) ? Number(b.spent ?? 0) / Number(b.amount_limit) : 0;
      return bRatio - aRatio;
    })
    .slice(0, 6);
  const height = budgets.length ? 64 + budgets.length * 30 : 92;
  const y = 728 - height;
  page.drawRectangle({
    x: MARGIN,
    y,
    width: CONTENT_WIDTH,
    height,
    color: color.white,
    borderColor: color.line,
    borderWidth: 0.8,
  });
  drawLabel(page, "Kesehatan budget", MARGIN + 16, y + height - 23, fonts.bold);
  page.drawText(`${data.budgets.length} kategori memiliki budget`, {
    x: MARGIN + 16,
    y: y + height - 39,
    font: fonts.regular,
    size: 7,
    color: color.muted,
  });

  if (!budgets.length) {
    page.drawText("Belum ada budget yang diatur untuk periode ini.", {
      x: MARGIN + 16,
      y: y + 20,
      font: fonts.regular,
      size: 8,
      color: color.muted,
    });
    return y;
  }

  budgets.forEach((budget, index) => {
    const rowY = y + height - 69 - index * 30;
    const limit = Number(budget.amount_limit);
    const spent = Number(budget.spent ?? 0);
    const ratio = limit ? spent / limit : 0;
    const statusColor = ratio > 1 ? color.coral : ratio >= 0.7 ? color.amber : color.mint;
    page.drawText(truncate(budget.categories?.name ?? "Tanpa kategori", fonts.bold, 7.5, 120), {
      x: MARGIN + 16,
      y: rowY + 6,
      font: fonts.bold,
      size: 7.5,
      color: color.ink,
    });
    page.drawText(`${Math.round(ratio * 100)}%`, {
      x: MARGIN + 150,
      y: rowY + 6,
      font: fonts.bold,
      size: 7,
      color: statusColor,
    });
    drawProgressBar(page, MARGIN + 183, rowY + 8, 120, ratio, statusColor);
    const detail = `${money(spent)} / ${money(limit)}`;
    page.drawText(detail, {
      x: PAGE_WIDTH - MARGIN - 16 - fonts.regular.widthOfTextAtSize(detail, 7),
      y: rowY + 6,
      font: fonts.regular,
      size: 7,
      color: color.muted,
    });
  });

  if (data.budgets.length > 6) {
    page.drawText(`Menampilkan 6 budget dengan penggunaan tertinggi dari ${data.budgets.length} budget.`, {
      x: MARGIN + 16,
      y: y + 8,
      font: fonts.regular,
      size: 6,
      color: color.muted,
    });
  }
  return y;
}

function drawTransactionTable({
  page,
  transactions,
  startY,
  fonts,
}: {
  page: PDFPage;
  transactions: Transaction[];
  startY: number;
  fonts: { regular: PDFFont; bold: PDFFont };
}) {
  const columns = {
    date: MARGIN + 12,
    detail: MARGIN + 84,
    category: MARGIN + 270,
    amountRight: PAGE_WIDTH - MARGIN - 12,
  };
  page.drawRectangle({
    x: MARGIN,
    y: startY - 25,
    width: CONTENT_WIDTH,
    height: 25,
    color: color.navy,
  });
  ["Tanggal", "Transaksi", "Kategori"].forEach((label, index) => {
    const x = [columns.date, columns.detail, columns.category][index];
    page.drawText(label.toUpperCase(), {
      x,
      y: startY - 16,
      font: fonts.bold,
      size: 6,
      color: color.mint,
    });
  });
  const amountHeader = "NOMINAL";
  page.drawText(amountHeader, {
    x: columns.amountRight - fonts.bold.widthOfTextAtSize(amountHeader, 6),
    y: startY - 16,
    font: fonts.bold,
    size: 6,
    color: color.mint,
  });

  transactions.forEach((transaction, index) => {
    const rowTop = startY - 25 - index * 30;
    const rowY = rowTop - 19;
    page.drawRectangle({
      x: MARGIN,
      y: rowTop - 30,
      width: CONTENT_WIDTH,
      height: 30,
      color: index % 2 ? color.canvas : color.white,
    });
    page.drawText(reportDate(transaction.date), {
      x: columns.date,
      y: rowY,
      font: fonts.regular,
      size: 7,
      color: color.muted,
    });
    page.drawText(truncate(transaction.title, fonts.bold, 7.5, 170), {
      x: columns.detail,
      y: rowY + 4,
      font: fonts.bold,
      size: 7.5,
      color: color.ink,
    });
    page.drawText(truncate(transaction.accounts?.name ?? "Akun", fonts.regular, 6, 150), {
      x: columns.detail,
      y: rowY - 6,
      font: fonts.regular,
      size: 6,
      color: color.muted,
    });
    page.drawText(
      truncate(
        transaction.type === "transfer" ? "Transfer" : transaction.categories?.name ?? "Lainnya",
        fonts.regular,
        7,
        92,
      ),
      {
        x: columns.category,
        y: rowY,
        font: fonts.regular,
        size: 7,
        color: color.ink,
      },
    );
    const prefix = transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : "";
    const amount = `${prefix}${money(transaction.amount)}`;
    page.drawText(amount, {
      x: columns.amountRight - fonts.bold.widthOfTextAtSize(amount, 7.5),
      y: rowY,
      font: fonts.bold,
      size: 7.5,
      color:
        transaction.type === "income"
          ? color.mintDark
          : transaction.type === "expense"
            ? color.coral
            : color.navyLight,
    });
  });
}

function drawDetailPages(
  document: PDFDocument,
  data: MonthlyReportInput,
  fonts: { regular: PDFFont; bold: PDFFont },
) {
  if (!data.budgets.length && !data.transactions.length) return;

  let transactionIndex = 0;
  const firstPage = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawDetailHeader(
    firstPage,
    "Detail aktivitas",
    `${monthLabel(data.month, data.year)} - ${data.workspaceName}`,
    fonts,
  );
  const budgetBottom = drawBudgetSection(firstPage, data, fonts);
  const tableStart = budgetBottom - 38;
  drawLabel(firstPage, "Transaksi bulan ini", MARGIN, tableStart + 15, fonts.bold);
  const firstCapacity = Math.max(1, Math.floor((tableStart - 66) / 30));
  const firstRows = data.transactions.slice(0, firstCapacity);
  if (firstRows.length) {
    drawTransactionTable({ page: firstPage, transactions: firstRows, startY: tableStart, fonts });
    transactionIndex = firstRows.length;
  } else {
    firstPage.drawRectangle({
      x: MARGIN,
      y: tableStart - 78,
      width: CONTENT_WIDTH,
      height: 60,
      color: color.white,
      borderColor: color.line,
      borderWidth: 0.8,
    });
    firstPage.drawText("Belum ada transaksi pada periode ini.", {
      x: MARGIN + 16,
      y: tableStart - 52,
      font: fonts.regular,
      size: 8,
      color: color.muted,
    });
  }

  const subsequentCapacity = 20;
  while (transactionIndex < data.transactions.length) {
    const page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawDetailHeader(
      page,
      "Daftar transaksi",
      `${monthLabel(data.month, data.year)} - lanjutan`,
      fonts,
    );
    const rows = data.transactions.slice(transactionIndex, transactionIndex + subsequentCapacity);
    drawTransactionTable({ page, transactions: rows, startY: 724, fonts });
    transactionIndex += rows.length;
  }
}

function drawPageFooters(
  document: PDFDocument,
  fonts: { regular: PDFFont; bold: PDFFont },
) {
  const pages = document.getPages();
  pages.forEach((page, index) => {
    page.drawLine({
      start: { x: MARGIN, y: 46 },
      end: { x: PAGE_WIDTH - MARGIN, y: 46 },
      thickness: 0.6,
      color: color.line,
    });
    page.drawText("BudgetKu - Keuangan lebih tertata", {
      x: MARGIN,
      y: 30,
      font: fonts.regular,
      size: 6.5,
      color: color.muted,
    });
    const pageLabel = `${index + 1} / ${pages.length}`;
    page.drawText(pageLabel, {
      x: PAGE_WIDTH - MARGIN - fonts.bold.widthOfTextAtSize(pageLabel, 6.5),
      y: 30,
      font: fonts.bold,
      size: 6.5,
      color: color.navy,
    });
  });
}

export async function createMonthlyReportPdf(data: MonthlyReportInput) {
  const document = await PDFDocument.create();
  const fonts = {
    regular: await document.embedFont(StandardFonts.Helvetica),
    bold: await document.embedFont(StandardFonts.HelveticaBold),
  };
  const period = safeText(monthLabel(data.month, data.year));
  document.setTitle(`Laporan BudgetKu - ${period}`);
  document.setAuthor("BudgetKu");
  document.setSubject(`Ringkasan keuangan ${safeText(data.workspaceName)}`);
  document.setKeywords(["BudgetKu", "laporan keuangan", period]);
  document.setCreator("BudgetKu");
  document.setProducer("BudgetKu");
  document.setCreationDate(new Date());
  document.setModificationDate(new Date());

  drawOverviewPage(document, data, fonts);
  drawDetailPages(document, data, fonts);
  drawPageFooters(document, fonts);

  return document.save();
}
