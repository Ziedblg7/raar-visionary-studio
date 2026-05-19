import { Outlet, createRootRoute, useLocation, Link, HeadContent } from "@tanstack/react-router";
import { useEffect } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import "@/i18n";
import { applyDir } from "@/i18n";
import i18n from "@/i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">Error 404</p>
        <h1 className="mt-4 font-display text-6xl text-foreground">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for has shifted or no longer exists.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center border border-foreground px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-foreground transition hover:bg-foreground hover:text-background"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const location = useLocation();
  const hideChrome = location.pathname.startsWith("/admin") || location.pathname === "/studio-portal";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  useEffect(() => {
    applyDir(i18n.resolvedLanguage || "en");
  }, []);

  return (
    <>
      <HeadContent />
      <div className="min-h-screen flex flex-col bg-transparent text-foreground">
        <AnimatedBackground />
        {!hideChrome && <Navbar />}
        <main className="flex-1">
          <Outlet />
        </main>
        {!hideChrome && <Footer />}
      </div>
    </>
  );
}
