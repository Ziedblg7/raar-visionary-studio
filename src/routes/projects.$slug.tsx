import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin } from "lucide-react";
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
  concept: string | null;
  materials: string | null;
  map_url: string | null;
  hero_image: string | null;
  gallery: string[];
  tags: string[];
};

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — RAAR Architecture` },
    ],
  }),
  component: ProjectDetailPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background pt-32">
      <div className="text-center">
        <h1 className="font-display text-5xl">Project not found / Projet introuvable / المشروع غير موجود</h1>
        <Link to="/projects" className="mt-6 inline-block text-[11px] uppercase tracking-[0.28em] underline">
          ← Back / Retour / العودة
        </Link>
      </div>
    </div>
  ),
});

function ProjectDetailPage() {
  const { t } = useTranslation();
  const { slug } = Route.useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        setProject(data as Project | null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-background pt-32 px-6"><p className="text-muted-foreground text-sm">{t("common.loading")}</p></div>;
  }
  if (!project) throw notFound();

  return (
    <article className="bg-background">
      {/* Hero */}
      <div className="relative h-[80vh] w-full overflow-hidden bg-ink">
        {project.hero_image && (
          <img
            src={project.hero_image}
            alt={project.title}
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-16 md:px-10 md:pb-24">
          <div className="mx-auto w-full max-w-[1600px] text-bone">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] opacity-80 hover:opacity-100"
            >
              <ArrowLeft size={14} /> {t("common.back_projects")}
            </Link>
            <p className="mt-6 text-[11px] uppercase tracking-[0.32em] opacity-70">
              {t(`categories.${project.category}`, project.category)} · {project.year}
            </p>
            <h1 className="mt-3 font-display text-6xl leading-[0.95] md:text-[8vw]">
              {project.title}
            </h1>
            {project.location && (
              <p className="mt-4 inline-flex items-center gap-2 text-sm opacity-80">
                <MapPin size={14} /> {project.location}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[1600px] px-6 py-24 md:px-10 md:py-36">
        <div className="grid gap-16 md:grid-cols-12">
          <aside className="md:col-span-4 md:sticky md:top-32 md:self-start space-y-10">
            <Meta label={t("projects.category")} value={t(`categories.${project.category}`, project.category)} />
            <Meta label={t("projects.year")} value={String(project.year ?? "—")} />
            <Meta label={t("projects.location")} value={project.location ?? "—"} />
            <Meta label={t("projects.materials")} value={project.materials ?? "—"} />
            {project.tags?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                  {t("projects.tags")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((t) => (
                    <span key={t} className="border border-border px-3 py-1 text-[10px] uppercase tracking-[0.24em]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <div className="md:col-span-8 space-y-10">
            <p className="font-display text-3xl leading-[1.2] text-foreground md:text-4xl">
              {project.short_description}
            </p>
            {project.concept && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
                  {t("projects.concept")}
                </p>
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/90">
                  {project.concept}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Gallery */}
        {project.gallery?.length > 0 && (
          <div className="mt-24 grid gap-6 md:grid-cols-2 md:gap-10">
            {project.gallery.map((src, i) => (
              <div
                key={i}
                className={`relative overflow-hidden bg-muted ${i % 3 === 0 ? "md:col-span-2 aspect-[21/9]" : "aspect-[4/5]"}`}
              >
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Map */}
        {project.map_url && (
          <div className="mt-24">
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              {t("projects.location")}
            </p>
            <a
              href={project.map_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 underline"
            >
              {t("common.view_map")}
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm text-foreground capitalize">{value}</p>
    </div>
  );
}