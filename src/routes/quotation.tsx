import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { FileText, ArrowLeft, Check } from "lucide-react";

type Search = { type?: string; size?: string; style?: string; currency?: string };

export const Route = createFileRoute("/quotation")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    type: typeof s.type === "string" ? s.type : undefined,
    size: typeof s.size === "string" ? s.size : undefined,
    style: typeof s.style === "string" ? s.style : undefined,
    currency: typeof s.currency === "string" ? s.currency : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Request a Quotation — RAAR Architecture" },
      { name: "description", content: "Request a personalised quotation from RAAR Architecture." },
    ],
  }),
  component: QuotationPage,
});

const schema = z.object({
  client_name: z.string().trim().min(2).max(120),
  client_email: z.string().trim().email().max(255),
  client_phone: z.string().trim().max(40).optional().or(z.literal("")),
  project_location: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

function QuotationPage() {
  const { t } = useTranslation();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    project_location: "",
    message: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("quotation_requests").insert({
      client_name: parsed.data.client_name,
      client_email: parsed.data.client_email,
      client_phone: parsed.data.client_phone || null,
      project_location: parsed.data.project_location || null,
      message: parsed.data.message || null,
      project_type: search.type || null,
      project_size: search.size || null,
      project_style: search.style || null,
      currency: (search.currency as "TND" | "USD" | "EUR") || "TND",
      status: "pending",
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
    toast.success(t("quotation.sent"));
  };

  if (done) {
    return (
      <div className="bg-background pt-32 pb-16 md:pt-40">
        <Toaster />
        <div className="mx-auto max-w-2xl px-6 md:px-10 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center border border-foreground mb-6">
            <Check size={22} />
          </div>
          <h1 className="font-display text-4xl md:text-5xl">{t("quotation.thanks_h")}</h1>
          <p className="mt-6 text-sm text-muted-foreground">{t("quotation.thanks_p")}</p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-10 inline-flex items-center gap-2 border border-border px-6 py-3 text-[11px] uppercase tracking-[0.28em] hover:bg-muted"
          >
            {t("common.back_home", { defaultValue: "Back home" })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background pt-32 pb-16 md:pt-40">
      <Toaster />
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <Link to="/estimator" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground">
          <ArrowLeft size={11} /> {t("estimator.label")}
        </Link>
        <p className="mt-6 text-[11px] uppercase tracking-[0.32em] text-muted-foreground inline-flex items-center gap-2">
          <FileText size={12} /> {t("quotation.label")}
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">{t("quotation.title")}</h1>
        <p className="mt-4 text-sm text-muted-foreground max-w-xl">{t("quotation.intro")}</p>

        {(search.type || search.size || search.style) && (
          <div className="mt-8 border border-border p-5 bg-muted/30">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-3">{t("quotation.your_brief")}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Brief label={t("estimator.type")} value={search.type} />
              <Brief label={t("estimator.size")} value={search.size} />
              <Brief label={t("estimator.style")} value={search.style} />
              <Brief label={t("estimator.currency")} value={search.currency} />
            </div>
          </div>
        )}

        <form onSubmit={submit} className="mt-10 space-y-6">
          <Field label={t("quotation.f_name")} value={form.client_name} onChange={(v) => setForm({ ...form, client_name: v })} required />
          <Field label={t("quotation.f_email")} type="email" value={form.client_email} onChange={(v) => setForm({ ...form, client_email: v })} required />
          <Field label={t("quotation.f_phone")} value={form.client_phone} onChange={(v) => setForm({ ...form, client_phone: v })} />
          <Field label={t("quotation.f_location")} value={form.project_location} onChange={(v) => setForm({ ...form, project_location: v })} />
          <div>
            <label className="block text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-2">{t("quotation.f_message")}</label>
            <textarea
              rows={5}
              maxLength={2000}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full border border-border bg-transparent p-3 text-sm outline-none focus:border-foreground"
              placeholder={t("quotation.placeholder")}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[11px] uppercase tracking-[0.28em] disabled:opacity-50"
          >
            <FileText size={12} /> {busy ? t("quotation.sending") : t("quotation.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}

function Brief({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display">{value}</p>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", required,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-2">{label}{required && " *"}</label>
      <input
        type={type}
        value={value}
        required={required}
        maxLength={255}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-border bg-transparent pb-2 text-sm outline-none focus:border-foreground"
      />
    </div>
  );
}