declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (request: Request) => Promise<Response>): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const groqApiKey = Deno.env.get("GROQ_API_KEY");
  const authorization = request.headers.get("Authorization");

  if (!supabaseUrl || !supabaseAnonKey || !groqApiKey) {
    console.error("Receipt OCR function is missing required server secrets.");
    return jsonResponse({ error: "Receipt OCR is not configured." }, 500);
  }

  if (!authorization) {
    return jsonResponse({ error: "Authentication is required." }, 401);
  }

  const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: authorization,
    },
  });

  if (!authResponse.ok) {
    return jsonResponse({ error: "Authentication is required." }, 401);
  }

  let base64Image: unknown;
  try {
    const body: unknown = await request.json();
    base64Image =
      isRecord(body) && "base64Image" in body
        ? body.base64Image
        : undefined;
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400);
  }

  if (
    typeof base64Image !== "string" ||
    base64Image.length === 0 ||
    base64Image.length > 15_000_000
  ) {
    return jsonResponse({ error: "A valid receipt image is required." }, 400);
  }

  const groqResponse = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this receipt image and extract the key information.
Return ONLY a raw JSON object with no markdown backticks, explanations, or formatting.
Use this exact key structure:
{
  "amount": number or null,
  "merchant": string or null,
  "date": "YYYY-MM-DD" or null,
  "suggestedCategoryId": string or null
}`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    }
  );

  if (!groqResponse.ok) {
    const errorText = await groqResponse.text();
    console.error(
      `Groq API request failed (${groqResponse.status}): ${errorText}`
    );
    return jsonResponse({ error: "Receipt analysis failed." }, 502);
  }

  const completion: unknown = await groqResponse.json();
  const choices = isRecord(completion) ? completion.choices : undefined;
  const firstChoice = Array.isArray(choices) ? choices[0] : undefined;
  const message = isRecord(firstChoice) ? firstChoice.message : undefined;
  const rawContent = isRecord(message) ? message.content : undefined;

  if (typeof rawContent !== "string" || rawContent.length === 0) {
    console.error("Groq returned an empty receipt analysis response.");
    return jsonResponse({ error: "Receipt analysis returned no data." }, 502);
  }

  let parsedData: unknown;
  try {
    parsedData = JSON.parse(
      rawContent.replace(/```json/g, "").replace(/```/g, "").trim()
    );
  } catch (error) {
    console.error("Groq returned invalid receipt JSON:", error);
    return jsonResponse({ error: "Receipt analysis returned invalid data." }, 502);
  }

  if (!isRecord(parsedData)) {
    return jsonResponse({ error: "Receipt analysis returned invalid data." }, 502);
  }

  return jsonResponse({
    amount: typeof parsedData.amount === "number" ? parsedData.amount : null,
    merchant: typeof parsedData.merchant === "string" ? parsedData.merchant : null,
    date: typeof parsedData.date === "string" ? parsedData.date : null,
    suggestedCategoryId:
      typeof parsedData.suggestedCategoryId === "string"
        ? parsedData.suggestedCategoryId
        : null,
  });
});
