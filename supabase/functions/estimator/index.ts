import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KEY_RE = /^[a-z0-9_-]{1,40}$/i;
const sanitizeLabel = (s: unknown) =>
  String(s ?? "").slice(0, 60).replace(/[^\w\s,.\-]/g, "");

function buildSystemPrompt(ctx?: {
  type?: { label: string; basePerM2: number };
  size?: { label: string; midpoint: number };
  style?: { label: string; multiplier: number };
  currency?: "TND" | "USD" | "EUR";
  rate?: number;
  language?: string;
}) {
  const lang = ctx?.language || "en";
  const langDirective =
    lang === "fr" ? "Respond in French." :
    lang === "ar" ? "Respond in Arabic." :
    "Respond in English.";

  let pricing = "";
  if (ctx?.type && ctx?.size && ctx?.style) {
    const buildPerM2Tnd = ctx.type.basePerM2 * ctx.style.multiplier;
    const totalTnd = buildPerM2Tnd * ctx.size.midpoint;
    const designFeeTnd = totalTnd * 0.10;
    const cur = ctx.currency || "TND";
    const rate = ctx.rate ?? 1;
    const fmt = (n: number) => Math.round(n * rate).toLocaleString("en-US");
    const range = (n: number) => `${fmt(n * 0.85)} – ${fmt(n * 1.15)}`;
    pricing = `
ADMIN-CONFIGURED PRICING CONTEXT (use these numbers as your authoritative baseline):
- Project type: ${ctx.type.label} (base ${ctx.type.basePerM2} TND/m²)
- Style: ${ctx.style.label} (multiplier ×${ctx.style.multiplier})
- Size bracket: ${ctx.size.label} (midpoint ${ctx.size.midpoint} m²)
- Effective build cost per m²: ${Math.round(buildPerM2Tnd)} TND/m²
- Currency for the client: ${cur}

Your indicative figures (already converted to ${cur}, present these ranges to the client):
- Build cost: ${cur} ${range(totalTnd)}
- Architect design fee (≈10%): ${cur} ${range(designFeeTnd)}
- Total project envelope: ${cur} ${range(totalTnd + designFeeTnd)}
- Suggested timeline: depends on size — ${ctx.size.midpoint < 200 ? "8–12" : ctx.size.midpoint < 600 ? "12–18" : "18–30"} months total.
`;
  }

  return `You are the design-estimate assistant for RAAR Architecture, the practice of Rabeb Chekir.
You help prospective clients understand the rough scope, cost range, and timeline of an architecture project.

${langDirective}

Tone: warm, editorial, concise — like a senior architect taking a first call. Never robotic.
${pricing}
Rules:
- If pricing context above is provided, USE THOSE NUMBERS. Do not invent different figures.
- Present the estimate as: build cost range, design fee range, timeline, and a one-line suggested next step.
- Be honest that figures are indicative and depend on site conditions.
- Encourage the client to click "Request a formal quotation" if they want a tailored proposal.
- Keep responses under 180 words.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { messages, context } = body as {
      messages?: Array<{ role: string; content: string }>;
      context?: {
        type?: { key?: string; label?: string };
        size?: { key?: string; label?: string };
        style?: { key?: string; label?: string };
        currency?: "TND" | "USD" | "EUR";
        rate?: number;
        language?: string;
      };
    };

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const totalChars = messages.reduce((s, m) => s + String(m?.content ?? "").length, 0);
    if (totalChars > 10_000) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load admin-curated pricing values from the DB
    let resolvedCtx: Parameters<typeof buildSystemPrompt>[0] = undefined;
    if (context?.type?.key && context?.size?.key && context?.style?.key) {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SERVICE_ROLE) {
        const keys = [context.type.key, context.size.key, context.style.key]
          .map((k) => String(k))
          .filter((k) => KEY_RE.test(k));
        if (keys.length === 3) {
          const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
          const { data: rows } = await admin
            .from("pricing_config")
            .select("kind,key,label,value")
            .in("key", keys);
          const byKey = new Map((rows ?? []).map((r: any) => [r.key, r]));
          const t = byKey.get(context.type.key);
          const s = byKey.get(context.size.key);
          const st = byKey.get(context.style.key);
          if (t?.kind === "type" && s?.kind === "size" && st?.kind === "style") {
            resolvedCtx = {
              type: { label: sanitizeLabel(t.label), basePerM2: Number(t.value) },
              size: { label: sanitizeLabel(s.label), midpoint: Number(s.value) },
              style: { label: sanitizeLabel(st.label), multiplier: Number(st.value) },
              currency: ["TND", "USD", "EUR"].includes(context.currency as string)
                ? (context.currency as "TND" | "USD" | "EUR")
                : "TND",
              rate: Number.isFinite(context.rate) ? Number(context.rate) : 1,
              language: ["en", "fr", "ar"].includes(context.language as string)
                ? context.language
                : "en",
            };
          }
        }
      }
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: buildSystemPrompt(resolvedCtx) },
          ...messages.map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.content ?? "").slice(0, 4000),
          })),
        ],
        stream: true,
        max_tokens: 400,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("estimator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
