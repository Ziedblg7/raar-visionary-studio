import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Sparkles, Send } from "lucide-react";
import heroImage from "@/assets/hero-architecture.jpg";
import portraitImage from "@/assets/portrait-rabeb.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useReveal } from "@/hooks/use-reveal";
import { useTranslation } from "react-i18next";

type Project = {
  id: string;
  title: string;
  slug: string;
  category: string;
  year: number | null;
  location: string | null;
  short_description: string | null;
  hero_image: string | null;
  gallery: string[];
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RAAR Architecture — Designing Space, Shaping Emotion" },
      { name: "description", content: "RAAR is the architecture practice of Rabeb Chekir. Cinematic, material, considered." },
      { property: "og:title", content: "RAAR Architecture — Rabeb Chekir" },
      { property: "og:description", content: "Designing space, shaping emotion." },
      { property: "og:image", content: "/projects/project-1.jpg" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* Persistent cinematic film layer — the whole page rides over it */}
      <CinematicFilmLayer />
      <div className="relative z-10">
        <Hero />
        <Marquee />
        <FeaturedProjects />
        <PhilosophyStrip />
        <EstimatorHUD />
        <StudioPreview />
        <ContactCTA />
      </div>
    </>
  );
}

/**
 * A fixed-position video that lives behind the entire page.
 * As the user scrolls, scenes (sections) cross-fade over it,
 * creating the "watching a documentary" feeling.
 */
function CinematicFilmLayer() {
  const { scrollYProgress } = useScroll();
  // Subtle global tint shift across the document
  const tintOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.1, 0.55, 0.85]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-ink">
      <img
        src={heroImage}
        alt="RAAR Architecture"
        className="cine-zoom h-full w-full object-cover"
      />
      {/* Cinematic letterbox vignette + tint that deepens as we scroll */}
      <motion.div
        style={{ opacity: tintOpacity }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/55 to-ink"
      />
      {/* Soft sandstone glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,color-mix(in_oklab,var(--sandstone)_18%,transparent),transparent_70%)]" />
    </div>
  );
}

function Hero() {
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);
  const subtitleY = useTransform(scrollY, [0, 600], [0, -40]);

  return (
    <section className="relative h-screen w-full overflow-hidden text-bone">
      {/* Cinematic letterbox bars — appear like a film opening */}
      <motion.div
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0.4 }}
        transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ originY: 0 }}
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-ink"
      />
      <motion.div
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0.4 }}
        transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ originY: 1 }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-ink"
      />

      <motion.div
        style={{ opacity, y: subtitleY }}
        className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-6 pb-24 md:px-10 md:pb-32"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-[11px] uppercase tracking-[0.32em] text-bone/70"
        >
          {t("home.established")}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-5xl font-display text-[12vw] leading-[0.92] md:text-[7.2vw]"
        >
          {t("home.title_l1")}<br />
          <span className="italic text-sandstone">{t("home.title_l2")}</span>
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-10 flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between"
        >
          <p className="max-w-md text-sm leading-relaxed text-bone/70">
            {t("home.intro")}
          </p>
          <Link
            to="/projects"
            className="group inline-flex items-center gap-3 border border-bone/40 px-7 py-4 text-[11px] uppercase tracking-[0.28em] transition hover:bg-bone hover:text-ink"
          >
            {t("home.explore")}
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2 text-bone/60">
        <span className="text-[10px] uppercase tracking-[0.32em]">{t("common.scroll")}</span>
        <ArrowDown size={14} className="animate-scroll-cue" />
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Residential", "Commercial", "Interior", "Concept", "Hospitality", "Cultural"];
  return (
    <section className="relative overflow-hidden border-y border-bone/10 py-8 backdrop-blur-md bg-ink/40">
      <div className="marquee flex gap-16 whitespace-nowrap font-display text-4xl text-bone/70 md:text-6xl">
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-16">
            {item}
            <span className="text-terracotta">◆</span>
          </span>
        ))}
      </div>
    </section>
  );
}

function FeaturedProjects() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const ref = useReveal<HTMLDivElement>();

  useEffect(() => {
    supabase
      .from("projects")
      .select("id,title,slug,category,year,location,short_description,hero_image,gallery")
      .eq("featured", true)
      .order("display_order", { ascending: true })
      .then(({ data }) => setProjects((data ?? []) as Project[]));
  }, []);

  const cats = ["all", "residential", "commercial", "interior", "concept"] as const;
  const filtered = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section className="relative py-24 md:py-36 bg-background/92 backdrop-blur-xl">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div ref={ref} className="reveal mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              {t("home.selected")}
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-5xl leading-[1.02] md:text-7xl">
              {t("home.selected_h")}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`border px-4 py-2 text-[10px] uppercase tracking-[0.28em] transition ${
                  filter === c
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {t(`categories.${c}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {filtered.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>

        <div className="mt-20 flex justify-center">
          <Link
            to="/projects"
            className="group inline-flex items-center gap-3 border border-foreground px-7 py-4 text-[11px] uppercase tracking-[0.28em] transition hover:bg-foreground hover:text-background"
          >
            {t("home.view_full")}
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  // Vary card spans for editorial layout
  const span = index % 3 === 0 ? "md:col-span-7" : index % 3 === 1 ? "md:col-span-5" : "md:col-span-12";
  const aspect = index % 3 === 2 ? "aspect-[21/9]" : "aspect-[4/5]";
  const localFallback = `/projects/project-${(index % 6) + 1}.jpg`;
  
  const images = [];
  if (project.hero_image) images.push(project.hero_image);
  if (project.gallery && project.gallery.length > 0) {
    images.push(...project.gallery);
  }
  if (images.length === 0) images.push(localFallback);

  return (
    <div className={`group block ${span}`}>
      <div className={`relative overflow-hidden bg-muted ${aspect}`}>
        <div className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
          {images.map((src, i) => (
            <div key={i} className="relative h-full w-full shrink-0 snap-center">
              <Link to="/projects/$slug" params={{ slug: project.slug }} className="absolute inset-0 z-10" />
              <img
                src={src.startsWith("http") ? src : localFallback}
                alt={`${project.title} - ${i + 1}`}
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = localFallback; }}
                className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-4 p-6 text-bone opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.32em] opacity-70">
                  {project.category} · {project.year ?? ""}
                </p>
                <p className="mt-2 font-display text-2xl">{project.title}</p>
              </div>
            </div>
          ))}
        </div>
        
        {images.length > 1 && (
          <div className="pointer-events-none absolute bottom-4 right-4 z-20 flex gap-1.5">
            {images.map((_, i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full bg-bone/70 mix-blend-overlay" />
            ))}
          </div>
        )}
      </div>
      <Link to="/projects/$slug" params={{ slug: project.slug }} className="mt-5 flex items-baseline justify-between hover:opacity-80">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
            {String(index + 1).padStart(2, "0")} / {project.category}
          </p>
          <h3 className="mt-2 font-display text-2xl text-foreground md:text-3xl">{project.title}</h3>
          {project.location && (
            <p className="mt-1 text-sm text-muted-foreground">{project.location}</p>
          )}
        </div>
        <span className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
          {project.year}
        </span>
      </Link>
    </div>
  );
}

function PhilosophyStrip() {
  const { t } = useTranslation();
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative bg-ink/70 text-bone py-32 md:py-44 grain backdrop-blur-sm">
      <div ref={ref} className="reveal mx-auto max-w-5xl px-6 text-center md:px-10">
        <p className="text-[11px] uppercase tracking-[0.32em] text-bone/50">
          {t("home.philosophy_label")}
        </p>
        <p className="mt-10 font-display text-3xl leading-[1.25] text-balance md:text-5xl">
          {t("home.philosophy_quote")}
        </p>
        <p className="mt-12 text-[11px] uppercase tracking-[0.32em] text-bone/50">
          — Rabeb Chekir
        </p>
      </div>
    </section>
  );
}

function StudioPreview() {
  const { t } = useTranslation();
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative py-24 md:py-36 bg-background/92 backdrop-blur-xl">
      <div ref={ref} className="reveal mx-auto grid max-w-[1600px] grid-cols-1 gap-12 px-6 md:grid-cols-12 md:gap-16 md:px-10">
        <div className="md:col-span-5">
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            <img
              src={portraitImage}
              alt="Portrait of Rabeb Chekir"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="md:col-span-7 md:pt-12">
          <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            {t("home.studio_label")}
          </p>
          <h2 className="mt-4 font-display text-5xl leading-[1.04] md:text-7xl">
            {t("home.studio_h")}
          </h2>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground">
            {t("home.studio_p")}
          </p>
          <div className="mt-10">
            <Link
              to="/about"
              className="group inline-flex items-center gap-3 border-b border-foreground pb-1 text-[11px] uppercase tracking-[0.28em]"
            >
              {t("home.studio_cta")}
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function EstimatorHUD() {
  const { t } = useTranslation();
  const ref = useReveal<HTMLDivElement>();
  const fullText = t("home.ai_demo");
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let started = false;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true;
            let i = 0;
            const tick = () => {
              i += 1;
              setTyped(fullText.slice(0, i));
              if (i < fullText.length) raf = window.setTimeout(tick, 32) as unknown as number;
            };
            tick();
          }
        });
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      if (raf) clearTimeout(raf);
    };
  }, [fullText]);

  return (
    <section className="relative py-32 md:py-44">
      {/* No solid background — the cinematic film shows through, the HUD floats */}
      <div ref={ref} className="reveal mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.32em] text-bone/60 inline-flex items-center gap-2">
              <Sparkles size={12} /> {t("home.ai_label")}
            </p>
            <h2 className="mt-4 font-display text-5xl leading-[1.02] text-bone md:text-6xl">
              {t("home.ai_h_l1")}<br />
              <span className="italic text-sandstone">{t("home.ai_h_l2")}</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-bone/70">
              {t("home.ai_p")}
            </p>
          </div>

          {/* HUD overlay */}
          <div className="md:col-span-8">
            <div className="glass-hud hud-glow relative overflow-hidden p-8 md:p-10">
              {/* HUD chrome */}
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-bone/60">
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sandstone animate-pulse" />
                  RAAR · Estimator v1
                </span>
                <span>{t("common.live")}</span>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-6 text-bone">
                <Stat label={t("home.ai_type")} value={t("categories.villa")} />
                <Stat label={t("home.ai_surface")} value="320 m²" />
                <Stat label={t("home.ai_style")} value="Minimal" />
              </div>
              <div className="mt-10 border-t border-bone/15 pt-6">
                <p className="text-[10px] uppercase tracking-[0.32em] text-bone/50">
                  {t("home.ai_assistant")}
                </p>
                <p className="caret mt-3 font-display text-2xl leading-snug text-bone md:text-3xl">
                  {typed}
                </p>
              </div>
              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-bone/50">
                  <span className="h-px w-10 bg-bone/30" />
                  {t("home.ai_indicative")}
                </div>
                <Link
                  to="/estimator"
                  className="group inline-flex items-center gap-3 border border-bone/40 px-7 py-4 text-[11px] uppercase tracking-[0.28em] text-bone transition hover:bg-bone hover:text-ink"
                >
                  {t("home.ai_open")}
                  <Send size={12} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              {/* Scanline shimmer */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,color-mix(in_oklab,var(--bone)_4%,transparent)_50%,transparent_100%)] [background-size:100%_8px] opacity-30 mix-blend-overlay" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.32em] text-bone/50">{label}</p>
      <p className="mt-2 font-display text-3xl text-bone subtitle-in">{value}</p>
    </div>
  );
}

function ContactCTA() {
  const { t } = useTranslation();
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative bg-sandstone/90 text-ink py-24 md:py-36 backdrop-blur-md">
      <div ref={ref} className="reveal mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="flex flex-col items-start justify-between gap-12 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] opacity-60">
              {t("home.cta_label")}
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-5xl leading-[1.02] md:text-7xl">
              {t("home.cta_h")}
            </h2>
          </div>
          <div className="flex flex-col gap-4 md:flex-row">
            <Link
              to="/estimator"
              className="border border-ink px-7 py-4 text-center text-[11px] uppercase tracking-[0.28em] transition hover:bg-ink hover:text-bone"
            >
              {t("home.cta_estimate")}
            </Link>
            <Link
              to="/quotation"
              className="border border-ink px-7 py-4 text-center text-[11px] uppercase tracking-[0.28em] transition hover:bg-ink hover:text-bone"
            >
              {t("estimator.request_quotation")}
            </Link>
            <Link
              to="/contact"
              className="bg-ink text-bone px-7 py-4 text-center text-[11px] uppercase tracking-[0.28em] transition hover:bg-ink/90"
            >
              {t("home.cta_contact")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
