import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";

const links = [
  { to: "/", key: "nav.index" },
  { to: "/projects", key: "nav.projects" },
  { to: "/estimator", key: "nav.estimator" },
  { to: "/about", key: "nav.studio" },
  { to: "/contact", key: "nav.contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { t } = useTranslation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const transparent = isHome && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        transparent
          ? "bg-transparent text-bone"
          : "bg-background/80 backdrop-blur-xl text-foreground border-b border-border/60"
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl tracking-tight">RAAR</span>
          <span className="hidden text-[10px] uppercase tracking-[0.32em] opacity-70 md:inline">
            Architecture
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="group relative text-[11px] uppercase tracking-[0.28em] transition-opacity hover:opacity-100"
              activeProps={{ className: "opacity-100" }}
              inactiveProps={{ className: "opacity-70" }}
            >
              {t(l.key)}
              <span className="absolute -bottom-2 left-0 h-px w-0 bg-current transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
          <LanguageSwitcher variant={transparent ? "light" : "dark"} />
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <LanguageSwitcher variant={transparent ? "light" : "dark"} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-background text-foreground border-t border-border">
          <nav className="flex flex-col px-6 py-6 gap-5">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm uppercase tracking-[0.28em]"
              >
                {t(l.key)}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}