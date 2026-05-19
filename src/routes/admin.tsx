import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";
import { LogOut, Briefcase, DollarSign, FileText } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — RAAR" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/" });
  }, [loading, user, navigate]);

  // Redirect bare /admin to /admin/projects
  useEffect(() => {
    if (isAdmin && location.pathname === "/admin") {
      navigate({ to: "/admin/projects", replace: true });
    }
  }, [isAdmin, location.pathname, navigate]);

  if (loading) return <div className="min-h-screen bg-ink text-bone flex items-center justify-center text-sm">Loading…</div>;
  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-ink text-bone flex items-center justify-center px-6">
        <Toaster />
        <div className="max-w-md text-center">
          <h1 className="font-display text-4xl">Awaiting admin role</h1>
          <p className="mt-4 text-sm opacity-60">
            Your account is signed in ({user.email}) but doesn't have the <code>admin</code> role yet.
          </p>
          <pre className="mt-4 bg-bone/10 p-3 text-xs text-left overflow-x-auto">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('${user.id}', 'admin');`}
          </pre>
          <button
            onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/" }))}
            className="mt-6 border border-bone/30 px-5 py-2 text-[11px] uppercase tracking-[0.28em] hover:bg-bone hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const tab = (to: "/admin/projects" | "/admin/pricing" | "/admin/quotations", icon: React.ReactNode, label: string) => {
    const active = location.pathname === to || (to === "/admin/projects" && location.pathname === "/admin");
    return (
      <Link
        to={to}
        className={`inline-flex items-center gap-2 px-4 py-2 text-[11px] uppercase tracking-[0.28em] border ${active ? "bg-bone text-ink border-bone" : "border-bone/30 hover:border-bone"}`}
      >
        {icon} {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-ink text-bone">
      <Toaster />
      <header className="border-b border-bone/10 px-6 py-5 md:px-10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link to="/" className="text-[10px] uppercase tracking-[0.32em] opacity-60 hover:opacity-100">← Site</Link>
          <h1 className="font-display text-3xl mt-1">RAAR Admin</h1>
        </div>
        <button
          onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/" }))}
          className="inline-flex items-center gap-2 border border-bone/30 px-4 py-2 text-[11px] uppercase tracking-[0.28em] hover:bg-bone hover:text-ink"
        >
          <LogOut size={12} /> Sign out
        </button>
      </header>
      <nav className="border-b border-bone/10 px-6 py-4 md:px-10 flex flex-wrap gap-3">
        {tab("/admin/projects", <Briefcase size={12} />, "Projects")}
        {tab("/admin/pricing", <DollarSign size={12} />, "Pricing & Currency")}
        {tab("/admin/quotations", <FileText size={12} />, "Quotations")}
      </nav>
      <Outlet />
    </div>
  );
}
