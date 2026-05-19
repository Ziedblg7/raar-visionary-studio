import { createFileRoute } from "@tanstack/react-router";
import portrait from "@/assets/portrait-rabeb.jpg";
import { useReveal } from "@/hooks/use-reveal";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Studio — RAAR Architecture" },
      { name: "description", content: "The studio of Rabeb Chekir — biography, philosophy and vision." },
      { property: "og:title", content: "Studio — RAAR Architecture" },
      { property: "og:description", content: "The studio of Rabeb Chekir — biography, philosophy and vision." },
      { property: "og:image", content: "/projects/project-3.jpg" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useTranslation();
  const ref1 = useReveal<HTMLDivElement>();
  const ref2 = useReveal<HTMLDivElement>();
  const ref3 = useReveal<HTMLDivElement>();

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="px-6 pt-36 pb-20 md:px-10 md:pt-48 md:pb-32">
        <div className="mx-auto max-w-[1600px]">
          <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            {t("about.label")}
          </p>
          <h1 className="mt-6 max-w-5xl font-display text-6xl leading-[0.96] md:text-[8vw]">
            {t("about.title_l1")} <span className="italic text-sandstone-deep">{t("about.title_em")}</span><br />
            {t("about.title_l2")}
          </h1>
        </div>
      </section>

      {/* Portrait + intro */}
      <section className="px-6 pb-24 md:px-10 md:pb-36">
        <div ref={ref1} className="reveal mx-auto grid max-w-[1600px] grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-6">
            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
              <img src={portrait} alt="Rabeb Chekir" loading="lazy" className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="md:col-span-6 md:pt-12">
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              {t("about.founder")}
            </p>
            <h2 className="mt-4 font-display text-4xl leading-[1.06] md:text-5xl">
              {t("about.intro_h")}
            </h2>
            <div className="mt-10 space-y-6 text-base leading-relaxed text-muted-foreground">
              <p>{t("about.intro_p1")}</p>
              <p>{t("about.intro_p2")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy block */}
      <section className="bg-ink text-bone py-32 md:py-44 grain">
        <div ref={ref2} className="reveal mx-auto max-w-5xl px-6 text-center md:px-10">
          <p className="text-[11px] uppercase tracking-[0.32em] text-bone/50">{t("about.philosophy_label")}</p>
          <p className="mt-10 font-display text-3xl leading-[1.25] text-balance md:text-5xl">
            {t("about.philosophy_q")}
          </p>
        </div>
      </section>

      {/* Three pillars */}
      <section className="px-6 py-24 md:px-10 md:py-36">
        <div ref={ref3} className="reveal mx-auto grid max-w-[1600px] grid-cols-1 gap-12 md:grid-cols-3 md:gap-16">
          {[
            { n: "01", t: t("about.pillar1_t"), d: t("about.pillar1_d") },
            { n: "02", t: t("about.pillar2_t"), d: t("about.pillar2_d") },
            { n: "03", t: t("about.pillar3_t"), d: t("about.pillar3_d") },
          ].map((p) => (
            <div key={p.n}>
              <p className="font-display text-7xl text-sandstone-deep">{p.n}</p>
              <h3 className="mt-6 font-display text-3xl">{p.t}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}