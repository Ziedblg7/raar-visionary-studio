import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Calculator, Check, ArrowLeft, ArrowRight, RotateCcw, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/estimator")({
  head: () => ({
    meta: [
      { title: "Design Estimate — RAAR Architecture" },
      { name: "description", content: "Get an indicative estimate for your architecture project." },
      { property: "og:title", content: "Design Estimate — RAAR Architecture" },
    ],
  }),
  component: EstimatorPage,
});

type Currency = "TND" | "USD" | "EUR";
const RATES: Record<Currency, number> = { TND: 1, USD: 0.32, EUR: 0.30 };

const PROJECT_TYPES = [
  { key: "villa",       label: "Villa",           basePerM2: 1800 },
  { key: "apartment",   label: "Apartment",        basePerM2: 1200 },
  { key: "commercial",  label: "Commercial",        basePerM2: 1400 },
  { key: "interior",    label: "Interior Design",   basePerM2: 600  },
  { key: "renovation",  label: "Renovation",        basePerM2: 900  },
  { key: "concept",     label: "Conceptual",        basePerM2: 500  },
];

const SIZES = [
  { key: "xs",  label: "< 80 m²",          m2: 60   },
  { key: "s",   label: "80 – 150 m²",      m2: 115  },
  { key: "m",   label: "150 – 300 m²",     m2: 225  },
  { key: "l",   label: "300 – 600 m²",     m2: 450  },
  { key: "xl",  label: "600 – 1 000 m²",   m2: 800  },
  { key: "xxl", label: "> 1 000 m²",       m2: 1400 },
];

const STYLES = [
  { key: "standard", label: "Standard", multiplier: 1.00 },
  { key: "premium",  label: "Premium",  multiplier: 1.35 },
  { key: "luxury",   label: "Luxury",   multiplier: 1.75 },
];

function convert(tnd: number, currency: Currency) {
  return Math.round(tnd * RATES[currency]).toLocaleString("en-US");
}
function rangeStr(tnd: number, currency: Currency) {
  return `${convert(tnd * 0.85, currency)} – ${convert(tnd * 1.15, currency)}`;
}

function EstimatorPage() {
  const { t } = useTranslation();
  const [step,     setStep]     = useState<0 | 1 | 2 | 3>(0);
  const [selType,  setSelType]  = useState<typeof PROJECT_TYPES[0]  | null>(null);
  const [selSize,  setSelSize]  = useState<typeof SIZES[0]           | null>(null);
  const [selStyle, setSelStyle] = useState<typeof STYLES[0]          | null>(null);
  const [currency, setCurrency] = useState<Currency>("TND");

  const reset = () => { setStep(0); setSelType(null); setSelSize(null); setSelStyle(null); };

  const buildCost  = selType && selSize && selStyle ? selType.basePerM2 * selStyle.multiplier * selSize.m2 : 0;
  const designFee  = buildCost * 0.10;
  const total      = buildCost + designFee;
  const timeline   = !selSize ? "" : selSize.m2 < 115 ? "6–10" : selSize.m2 < 450 ? "10–16" : "16–28";

  const StepDot = ({ n, label }: { n: number; label: string }) => (
    <div className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] ${n <= step ? "text-foreground" : "text-muted-foreground"}`}>
      <span className={`flex h-6 w-6 items-center justify-center border text-[10px] ${n < step ? "bg-foreground text-background border-foreground" : n === step ? "border-foreground" : "border-border"}`}>
        {n < step ? <Check size={11} /> : n + 1}
      </span>
      {label}
    </div>
  );

  return (
    <div className="bg-background pt-32 pb-16 md:pt-40">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">

        {/* ── Header ── */}
        <div className="grid gap-12 md:grid-cols-12 mb-12">
          <div className="md:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground inline-flex items-center gap-2">
              <Calculator size={12} /> Cost Estimator
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.02] md:text-6xl">{t("estimator.title")}</h1>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground max-w-xl">{t("estimator.intro")}</p>
          </div>
          <div className="md:col-span-5 flex md:justify-end items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-2">{t("estimator.currency")}</p>
              <div className="flex border border-border">
                {(["TND", "USD", "EUR"] as Currency[]).map((c) => (
                  <button key={c} onClick={() => setCurrency(c)}
                    className={`px-4 py-2 text-[11px] uppercase tracking-[0.28em] transition ${currency === c ? "bg-foreground text-background" : "hover:bg-muted"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Progress ── */}
        <div className="flex flex-wrap gap-6 border-y border-border py-5 mb-10">
          <StepDot n={0} label={t("estimator.type")} />
          <StepDot n={1} label={t("estimator.size")} />
          <StepDot n={2} label={t("estimator.style")} />
          <StepDot n={3} label={t("estimator.result")} />
        </div>

        {/* ── Choices breadcrumb ── */}
        {(selType || selSize || selStyle) && (
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{t("estimator.your_choices")}:</span>
            {selType  && <Chip label={`${t("estimator.type")}: ${selType.label}`} />}
            {selSize  && <Chip label={`${t("estimator.size")}: ${selSize.label}`} />}
            {selStyle && <Chip label={`${t("estimator.style")}: ${selStyle.label}`} />}
            <button onClick={reset} className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground">
              <RotateCcw size={11} /> {t("estimator.restart")}
            </button>
          </div>
        )}

        {/* ── Step 0: Type ── */}
        {step === 0 && (
          <PickGrid heading={t("estimator.q_type")}
            items={PROJECT_TYPES}
            onPick={(key) => { setSelType(PROJECT_TYPES.find((x) => x.key === key)!); setStep(1); }} />
        )}

        {/* ── Step 1: Size ── */}
        {step === 1 && (
          <PickGrid heading={t("estimator.q_size")}
            items={SIZES}
            onPick={(key) => { setSelSize(SIZES.find((x) => x.key === key)!); setStep(2); }}
            onBack={() => setStep(0)} />
        )}

        {/* ── Step 2: Style ── */}
        {step === 2 && (
          <PickGrid heading={t("estimator.q_style")}
            items={STYLES}
            onPick={(key) => { setSelStyle(STYLES.find((x) => x.key === key)!); setStep(3); }}
            onBack={() => setStep(1)} />
        )}

        {/* ── Step 3: Result ── */}
        {step === 3 && selType && selSize && selStyle && (
          <div className="border border-border bg-card">
            <div className="px-6 py-8 md:px-10 md:py-12">

              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground inline-flex items-center gap-2">
                <Calculator size={11} /> Indicative Estimate
              </p>
              <h2 className="mt-3 font-display text-2xl md:text-3xl">
                {selType.label} · {selSize.label} · {selStyle.label}
              </h2>

              {/* Cards */}
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <ResultCard label="Build Cost"        value={`${currency} ${rangeStr(buildCost, currency)}`}  note="Construction only" />
                <ResultCard label="Design Fee"         value={`${currency} ${rangeStr(designFee, currency)}`}  note="≈ 10% of build cost" />
                <ResultCard label="Total Envelope"     value={`${currency} ${rangeStr(total, currency)}`}      note="Build + design fee" highlight />
              </div>

              {/* Timeline */}
              <div className="mt-5 flex items-center gap-6 border border-border px-5 py-4">
                <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Suggested Timeline</span>
                <span className="font-display text-2xl">{timeline} months</span>
              </div>

              <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
                * Figures are indicative. Actual costs depend on site conditions, materials, and final scope.
                Request a formal quotation for a precise offer.
              </p>
            </div>

            {/* Footer actions */}
            <div className="border-t border-border px-6 py-5 md:px-10 flex flex-wrap items-center justify-between gap-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{t("estimator.indicative")}</p>
              <div className="flex gap-3">
                <button onClick={reset}
                  className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-[11px] uppercase tracking-[0.28em] hover:bg-muted">
                  <RotateCcw size={12} /> {t("estimator.restart")}
                </button>
                <Link to="/quotation"
                  search={{ type: selType.label, size: selSize.label, style: selStyle.label, currency }}
                  className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-[11px] uppercase tracking-[0.28em] hover:opacity-90">
                  <FileText size={12} /> {t("estimator.request_quotation")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function ResultCard({ label, value, note, highlight }: { label: string; value: string; note: string; highlight?: boolean }) {
  return (
    <div className={`border p-5 ${highlight ? "border-foreground bg-foreground/5" : "border-border"}`}>
      <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
      <p className={`mt-2 font-display text-lg leading-tight break-words ${highlight ? "text-foreground font-semibold" : ""}`}>{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{note}</p>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return <span className="border border-foreground/40 bg-muted px-3 py-1.5 text-[10px] uppercase tracking-[0.24em]">{label}</span>;
}

function PickGrid({ heading, items, onPick, onBack }: {
  heading: string;
  items: { key: string; label: string }[];
  onPick: (key: string) => void;
  onBack?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl md:text-4xl">{heading}</h2>
        {onBack && (
          <button onClick={onBack}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground">
            <ArrowLeft size={12} /> {t("estimator.back")}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((it) => (
          <button key={it.key} onClick={() => onPick(it.key)}
            className="group border border-border p-6 text-left transition hover:border-foreground hover:bg-muted/40">
            <p className="font-display text-2xl">{it.label}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground inline-flex items-center gap-1">
              {t("estimator.choose")} <ArrowRight size={11} className="transition group-hover:translate-x-1" />
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
