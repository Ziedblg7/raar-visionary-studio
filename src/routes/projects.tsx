import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — RAAR Architecture" },
      { name: "description", content: "Selected works by Rabeb Chekir — residential, commercial, interior, and conceptual architecture." },
      { property: "og:title", content: "Projects — RAAR Architecture" },
      { property: "og:description", content: "Selected works — residential, commercial, interior, conceptual." },
      { property: "og:image", content: "/projects/project-2.jpg" },
    ],
  }),
  component: ProjectsPage,
});

const categories = ["all", "residential", "commercial", "interior", "concept"] as const;

function ProjectsPage() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    supabase
      .from("projects")
      .select("id,title,slug,category,year,location,short_description,hero_image,gallery")
      .order("display_order")
      .then(({ data }) => setProjects((data ?? []) as Project[]));
  }, []);

  const filtered = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="bg-background pt-32 pb-24 md:pt-44 md:pb-36">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <header className="mb-16 md:mb-24">
          <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            {t("projects.label")} · {String(projects.length).padStart(3, "0")} {t("projects.works")}
          </p>
          <h1 className="mt-4 font-display text-6xl leading-[0.98] md:text-[10vw]">
            {t("projects.title")}
          </h1>
        </header>

        <div className="mb-12 flex flex-wrap gap-2 border-b border-border pb-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.28em] transition ${
                filter === c
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(`categories.${c}`)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 md:gap-y-24">
          {filtered.map((p, i) => {
            const images = [];
            if (p.hero_image) images.push(p.hero_image);
            if (p.gallery && p.gallery.length > 0) {
              images.push(...p.gallery);
            }
            if (images.length === 0) images.push(`/projects/project-${(i % 6) + 1}.jpg`);

            return (
              <div key={p.id} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <div className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
                    {images.map((src, idx) => (
                      <div key={idx} className="relative h-full w-full shrink-0 snap-center">
                        <Link to="/projects/$slug" params={{ slug: p.slug }} className="absolute inset-0 z-10" />
                        <img
                          src={src.startsWith("http") ? src : `/projects/project-${(i % 6) + 1}.jpg`}
                          alt={`${p.title} - ${idx + 1}`}
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).src = `/projects/project-${(i % 6) + 1}.jpg`; }}
                          className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                  {images.length > 1 && (
                    <div className="pointer-events-none absolute bottom-4 right-4 z-20 flex gap-1.5">
                      {images.map((_, idx) => (
                        <div key={idx} className="h-1.5 w-1.5 rounded-full bg-bone/70 mix-blend-overlay" />
                      ))}
                    </div>
                  )}
                </div>
                <Link to="/projects/$slug" params={{ slug: p.slug }} className="mt-6 flex items-baseline justify-between hover:opacity-80">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                      {String(i + 1).padStart(2, "0")} · {t(`categories.${p.category}`, p.category)}
                    </p>
                    <h2 className="mt-2 font-display text-3xl md:text-4xl">{p.title}</h2>
                    {p.location && <p className="mt-1 text-sm text-muted-foreground">{p.location}</p>}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                    {p.year}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}