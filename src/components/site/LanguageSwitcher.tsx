import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { SUPPORTED_LANGS, applyDir } from "@/i18n";

export function LanguageSwitcher({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = SUPPORTED_LANGS.find((l) => l.code === i18n.resolvedLanguage) ?? SUPPORTED_LANGS[0];

  useEffect(() => {
    applyDir(i18n.resolvedLanguage || "en");
  }, [i18n.resolvedLanguage]);

  useEffect(() => {
    const onClick = () => setOpen(false);
    if (open) {
      window.addEventListener("click", onClick);
      return () => window.removeEventListener("click", onClick);
    }
  }, [open]);

  const change = (code: string) => {
    i18n.changeLanguage(code);
    applyDir(code);
    setOpen(false);
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] opacity-80 transition hover:opacity-100"
        aria-label="Change language"
      >
        <Globe size={13} />
        <span>{current.label}</span>
      </button>

      {open && (
        <div
          className={`absolute right-0 mt-3 min-w-[140px] border ${
            variant === "light"
              ? "border-white/20 bg-black/80 text-white backdrop-blur-xl"
              : "border-border bg-background text-foreground"
          }`}
        >
          {SUPPORTED_LANGS.map((l) => {
            const active = l.code === current.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => change(l.code)}
                className="flex w-full items-center justify-between px-4 py-3 text-[11px] uppercase tracking-[0.24em] transition hover:opacity-70"
              >
                <span>{l.name}</span>
                {active && <Check size={12} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}