export type ReceiptParseResult = {
  merchant: string | null;
  total: number | null;
  date: string | null;
  confidence: number;
};

export async function parseReceipt(_file: File): Promise<ReceiptParseResult> {
  void _file;
  // TODO Phase 2: connect an OCR provider, normalize Indonesian receipt fields,
  // and always return a reviewable draft instead of saving a transaction directly.
  throw new Error("OCR struk belum tersedia pada Phase 1.");
}
