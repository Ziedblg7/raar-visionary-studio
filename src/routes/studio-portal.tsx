import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/studio-portal")({
  validateSearch: (search: Record<string, unknown>): { key?: string } => {
    return { key: typeof search.key === "string" ? search.key : undefined };
  },
  beforeLoad: ({ search }) => {
    if (search.key !== "raar2026") {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({ meta: [{ title: "Sign in — RAAR" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("ziedbouallagui@gmail.com");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin/projects` },
        });
        if (error) throw error;
        toast.success("Account created. You can sign in now.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin/projects" });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink text-bone px-6">
      <Toaster />
      <div className="w-full max-w-md">
        <Link to="/" className="text-[10px] uppercase tracking-[0.32em] opacity-60">← Back to site</Link>
        <h1 className="mt-8 font-display text-5xl">Studio access</h1>
        <p className="mt-3 text-sm opacity-60">
          {mode === "signin" ? "Sign in to manage projects." : "Create the admin account."}
        </p>
        <form onSubmit={onSubmit} className="mt-10 space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.32em] opacity-60">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border-b border-bone/30 bg-transparent pb-2 text-base outline-none focus:border-bone"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.32em] opacity-60">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border-b border-bone/30 bg-transparent pb-2 text-base outline-none focus:border-bone"
            />
          </div>
          <button
            type="submit" disabled={busy}
            className="w-full bg-bone py-4 text-[11px] uppercase tracking-[0.28em] text-ink transition hover:bg-sandstone disabled:opacity-50"
          >
            {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 text-[11px] uppercase tracking-[0.28em] opacity-60 hover:opacity-100"
        >
          {mode === "signin" ? "Need to create the admin account?" : "Already have an account? Sign in"}
        </button>
        <p className="mt-10 text-[10px] uppercase tracking-[0.28em] opacity-40">
          First time? Create the account, then ask the developer to grant the admin role.
        </p>
      </div>
    </div>
  );
}