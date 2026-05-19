import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Save, RefreshCw, Wifi, WifiOff, Clock } from "lucide-react";

type Rate = {
  id: string;
  currency: "TND" | "USD" | "EUR";
  rate_per_tnd: number;
  source: string;
  fetched_at: string;
};

export const Route = createFileRoute("/admin/pricing")({
  head: () => ({ meta: [{ title: "Pricing — RAAR Admin" }] }),
  component: AdminPricingPage,
});

function AdminPricingPage() {
  const { isAdmin } = useAuth();
  const [rates, setRates]       = useState<Rate[]>([]);
  const [busy, setBusy]         = useState(false);
  const [fetching, setFetching] = useState(false);
  const [liveOk, setLiveOk]     = useState<boolean | null>(null);

  const loadRates = async () => {
    const { data } = await supabase.from("currency_rates").select("*").order("currency");
    setRates((data ?? []) as Rate[]);
  };

  useEffect(() => { if (isAdmin) loadRates(); }, [isAdmin]);

  if (!isAdmin) return null;

  /* ── Fetch live rates directly from public API ── */
  const fetchLiveRates = async () => {
    setFetching(true);
    setLiveOk(null);
    try {
      const res  = await fetch("https://open.er-api.com/v6/latest/TND");
      const json = await res.json();

      if (!json?.rates) throw new Error("Bad response");

      const usd: number = json.rates.USD ?? 0.32;
      const eur: number = json.rates.EUR ?? 0.30;
      const now = new Date().toISOString();

      /* Update local state immediately */
      setRates((prev) => prev.map((r) => {
        if (r.currency === "USD") return { ...r, rate_per_tnd: usd, source: "live · open.er-api.com", fetched_at: now };
        if (r.currency === "EUR") return { ...r, rate_per_tnd: eur, source: "live · open.er-api.com", fetched_at: now };
        return r;
      }));

      /* Persist to Supabase immediately */
      await Promise.all([
        supabase.from("currency_rates").update({ rate_per_tnd: usd, source: "live · open.er-api.com", fetched_at: now }).eq("currency", "USD"),
        supabase.from("currency_rates").update({ rate_per_tnd: eur, source: "live · open.er-api.com", fetched_at: now }).eq("currency", "EUR"),
      ]);

      setLiveOk(true);
      toast.success(`✓ Rates updated — 1 TND = ${usd.toFixed(4)} USD / ${eur.toFixed(4)} EUR`);
    } catch {
      setLiveOk(false);
      toast.error("Could not reach exchange rate API. Check your internet connection.");
    } finally {
      setFetching(false);
    }
  };

  /* ── Save manual edits ── */
  const saveManual = async () => {
    setBusy(true);
    const updates = rates
      .filter((r) => r.currency !== "TND")
      .map((r) => supabase.from("currency_rates")
        .update({ rate_per_tnd: r.rate_per_tnd, source: "manual" })
        .eq("id", r.id));
    const results = await Promise.all(updates);
    setBusy(false);
    const err = results.find((r) => r.error);
    if (err?.error) toast.error(err.error.message);
    else { toast.success("Rates saved manually"); loadRates(); }
  };

  const usd = rates.find((r) => r.currency === "USD");
  const eur = rates.find((r) => r.currency === "EUR");

  return (
    <main className="px-6 py-10 md:px-10 max-w-3xl">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl">Currency Rates</h2>
          <p className="mt-1 text-[11px] uppercase tracking-[0.28em] opacity-60">
            Used in the project cost estimator
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchLiveRates}
            disabled={fetching || busy}
            className="inline-flex items-center gap-2 border border-bone/30 px-5 py-2.5 text-[11px] uppercase tracking-[0.28em] hover:bg-bone hover:text-ink disabled:opacity-50 transition"
          >
            <RefreshCw size={12} className={fetching ? "animate-spin" : ""} />
            {fetching ? "Fetching…" : "Refresh live rates"}
          </button>
          <button
            onClick={saveManual}
            disabled={busy || fetching}
            className="inline-flex items-center gap-2 bg-bone text-ink px-5 py-2.5 text-[11px] uppercase tracking-[0.28em] disabled:opacity-50"
          >
            <Save size={12} /> Save manual
          </button>
        </div>
      </div>

      {/* Live status badge */}
      {liveOk !== null && (
        <div className={`mb-6 inline-flex items-center gap-2 border px-4 py-2 text-[11px] uppercase tracking-[0.28em] ${liveOk ? "border-green-500/40 text-green-400" : "border-red-500/40 text-red-400"}`}>
          {liveOk ? <Wifi size={12} /> : <WifiOff size={12} />}
          {liveOk ? "Connected — rates saved to Supabase" : "API unreachable — check internet"}
        </div>
      )}

      {/* Rate cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {/* TND — base, always 1 */}
        <RateCard
          currency="TND"
          value={1}
          source="base currency"
          fetchedAt=""
          disabled
          onChange={() => {}}
        />
        {usd && (
          <RateCard
            currency="USD"
            value={usd.rate_per_tnd}
            source={usd.source}
            fetchedAt={usd.fetched_at}
            onChange={(v) => setRates((prev) => prev.map((r) => r.currency === "USD" ? { ...r, rate_per_tnd: v } : r))}
          />
        )}
        {eur && (
          <RateCard
            currency="EUR"
            value={eur.rate_per_tnd}
            source={eur.source}
            fetchedAt={eur.fetched_at}
            onChange={(v) => setRates((prev) => prev.map((r) => r.currency === "EUR" ? { ...r, rate_per_tnd: v } : r))}
          />
        )}
      </div>

      {/* How it works */}
      <div className="border border-bone/10 p-6 text-sm opacity-70 space-y-2">
        <p className="text-[10px] uppercase tracking-[0.28em] opacity-60 mb-3">How it works</p>
        <p>• <strong>Refresh live rates</strong> — fetches from <code>open.er-api.com</code> and saves to Supabase instantly. No page reload needed.</p>
        <p>• <strong>Save manual</strong> — if you edit the numbers yourself, click this to persist them.</p>
        <p>• Rates are used in the estimator calculator on the public site.</p>
      </div>
    </main>
  );
}

function RateCard({
  currency, value, source, fetchedAt, disabled = false, onChange,
}: {
  currency: string;
  value: number;
  source: string;
  fetchedAt: string;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  const date = fetchedAt ? new Date(fetchedAt).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }) : null;
  return (
    <div className="border border-bone/10 p-5">
      <p className="text-[11px] uppercase tracking-[0.28em] opacity-60 mb-1">{currency}</p>
      <input
        type="number"
        step="0.0001"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full bg-transparent border-b border-bone/20 pb-1 text-3xl font-display outline-none focus:border-bone disabled:opacity-40"
      />
      <p className="mt-2 text-[10px] uppercase tracking-[0.24em] opacity-40 truncate">{source}</p>
      {date && (
        <p className="mt-1 text-[10px] opacity-30 inline-flex items-center gap-1">
          <Clock size={9} /> {date}
        </p>
      )}
    </div>
  );
}
