import { supabase } from "../lib/supabase";

export interface ParsedReceipt {
  amount: number | null;
  merchant: string | null;
  date: string | null;
  suggestedCategoryId: string | null;
}

export const parseReceiptImage = async (
  base64Image: string
): Promise<ParsedReceipt> => {
  const { data, error } = await supabase.functions.invoke<ParsedReceipt>(
    "receipt-ocr",
    { body: { base64Image } }
  );

  if (error) {
    console.error("Receipt OCR request failed:", error);
    throw error;
  }

  if (!data) {
    throw new Error("Receipt OCR returned an empty response.");
  }

  return data;
};
