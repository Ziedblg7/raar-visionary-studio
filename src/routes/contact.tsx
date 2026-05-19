import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Mail, Instagram, Facebook, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — RAAR Architecture" },
      { name: "description", content: "Begin a project with RAAR. Reach out by email or visit the studio." },
      { property: "og:title", content: "Contact — RAAR Architecture" },
      { property: "og:description", content: "Begin a project with RAAR." },
      { property: "og:image", content: "/projects/project-5.jpg" },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(5).max(2000),
});

function ContactPage() {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = schema.safeParse({
      name: form.get("name")?.toString() ?? "",
      email: form.get("email")?.toString() ?? "",
      message: form.get("message")?.toString() ?? "",
    });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Please review the form");
      return;
    }
    setSubmitting(true);
    // Open mail client with prefilled body — privacy-friendly v1
    const { name, email, message } = result.data;
    const body = encodeURIComponent(`From: ${name} <${email}>\n\n${message}`);
    window.location.href = `mailto:contact@raararchitecture.com?subject=${encodeURIComponent("New enquiry — " + name)}&body=${body}`;
    setTimeout(() => {
      setSubmitting(false);
      toast.success(t("contact.opening"));
    }, 400);
  };

  return (
    <div className="bg-background pt-36 pb-24 md:pt-48 md:pb-36">
      <Toaster />
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">{t("contact.label")}</p>
        <h1 className="mt-6 max-w-4xl font-display text-6xl leading-[0.96] md:text-[8vw]">
          {t("contact.title_l1")} <span className="italic text-sandstone-deep">{t("contact.title_em")}</span>
        </h1>

        <div className="mt-20 grid gap-16 md:grid-cols-12">
          {/* Form */}
          <form onSubmit={onSubmit} className="md:col-span-7 space-y-8">
            <Field label={t("contact.name")} name="name" type="text" required maxLength={100} />
            <Field label={t("contact.email")} name="email" type="email" required maxLength={255} />
            <div>
              <label className="block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">{t("contact.message")}</label>
              <textarea
                name="message"
                rows={6}
                required
                maxLength={2000}
                className="mt-3 w-full border-b border-border bg-transparent pb-3 text-base outline-none transition focus:border-foreground"
                placeholder={t("contact.placeholder")}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="border border-foreground px-7 py-4 text-[11px] uppercase tracking-[0.28em] transition hover:bg-foreground hover:text-background disabled:opacity-50"
            >
              {submitting ? t("contact.sending") : t("contact.send")}
            </button>
          </form>

          {/* Info */}
          <aside className="md:col-span-5 space-y-10 md:pl-10 md:border-l md:border-border">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">{t("common.studio")}</p>
              <a href="mailto:contact@raararchitecture.com" className="mt-3 inline-flex items-center gap-2 text-base hover:underline">
                <Mail size={14} /> contact@raararchitecture.com
              </a>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">{t("common.visit")}</p>
              <a
                href="https://maps.app.goo.gl/G2h3vXR9f7CzDPeq5"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-base hover:underline"
              >
                <MapPin size={14} /> {t("common.open_in_maps")}
              </a>
              <div className="mt-6 aspect-[4/3] overflow-hidden border border-border bg-muted">
                <iframe
                  title="Studio location"
                  src="https://www.google.com/maps?q=Tunis,Tunisia&output=embed"
                  className="h-full w-full"
                  loading="lazy"
                />
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">{t("common.follow")}</p>
              <div className="mt-3 flex gap-3">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full border border-border p-3 transition hover:border-foreground">
                  <Instagram size={16} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full border border-border p-3 transition hover:border-foreground">
                  <Facebook size={16} />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">{label}</label>
      <input
        {...props}
        className="mt-3 w-full border-b border-border bg-transparent pb-3 text-base outline-none transition focus:border-foreground"
      />
    </div>
  );
}