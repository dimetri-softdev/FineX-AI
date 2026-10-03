// src/services/receiptOcrService.ts

export interface ParsedReceipt {
  amount: number | null;
  merchant: string | null;
  date: string | null;
  suggestedCategoryId: string | null; // e.g. 'cat_1' for Groceries, 'cat_3' for Transport
}

// Replace with your OpenAI API Key or Google Cloud Vision / Mindee endpoint
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';

export const parseReceiptImage = async (base64Image: string): Promise<ParsedReceipt> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert receipt OCR scanner. Extract details from the receipt image and respond STRICTLY in JSON format with no markdown blocks:
{
  "amount": number or null,
  "merchant": string or null,
  "date": "YYYY-MM-DD" or null,
  "category": "cat_1" (Groceries) | "cat_2" (Dining Out) | "cat_3" (Transport) | "cat_5" (Utilities)
}`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 200,
      }),
    });

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content?.trim();
    
    if (!rawContent) return { amount: null, merchant: null, date: null, suggestedCategoryId: null };

    const parsed = JSON.parse(rawContent);
    return {
      amount: typeof parsed.amount === 'number' ? parsed.amount : parseFloat(parsed.amount) || null,
      merchant: parsed.merchant || null,
      date: parsed.date || null,
      suggestedCategoryId: parsed.category || 'cat_1',
    };
  } catch (error) {
    console.error('Receipt OCR parsing failed:', error);
    return { amount: null, merchant: null, date: null, suggestedCategoryId: null };
  }
};