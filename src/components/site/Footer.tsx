import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-ink text-bone">
      <div className="mx-auto max-w-[1600px] px-6 py-20 md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-4xl leading-tight md:text-6xl">
              {t("footer.tagline_l1")}<br />{t("footer.tagline_l2")}
            </p>
          </div>
          <div className="md:col-span-3">
            <p className="text-[10px] uppercase tracking-[0.32em] opacity-50 mb-4">
              {t("footer.studio")}
            </p>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/projects" className="hover:opacity-100">{t("nav.projects")}</Link></li>
              <li><Link to="/about" className="hover:opacity-100">{t("nav.studio")}</Link></li>
              <li><Link to="/estimator" className="hover:opacity-100">{t("nav.estimator")}</Link></li>
              <li><Link to="/contact" className="hover:opacity-100">{t("nav.contact")}</Link></li>
            </ul>
          </div>
          <div className="md:col-span-4">
            <p className="text-[10px] uppercase tracking-[0.32em] opacity-50 mb-4">
              {t("footer.contact")}
            </p>
            <a
              href="mailto:contact@raararchitecture.com"
              className="inline-flex items-center gap-2 text-sm hover:underline"
            >
              <Mail size={14} /> contact@raararchitecture.com
            </a>
            <div className="mt-6 flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="rounded-full border border-bone/20 p-2.5 transition hover:bg-bone hover:text-ink"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="rounded-full border border-bone/20 p-2.5 transition hover:bg-bone hover:text-ink"
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-4 border-t border-bone/10 pt-8 text-[11px] uppercase tracking-[0.28em] opacity-60 md:flex-row">
          <span>{t("footer.rights", { year: new Date().getFullYear() })}</span>
        </div>
      </div>
    </footer>
  );
}