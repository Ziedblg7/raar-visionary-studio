import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Save, Trash2, Mail, Phone, MapPin, Calendar } from "lucide-react";

type Quotation = {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  project_type: string | null;
  project_size: string | null;
  project_style: string | null;
  project_location: string | null;
  message: string | null;
  currency: string;
  ai_draft: string | null;
  admin_notes: string | null;
  final_quotation: string | null;
  status: "pending" | "reviewing" | "sent" | "rejected";
  created_at: string;
};

export const Route = createFileRoute("/admin/quotations")({
  head: () => ({ meta: [{ title: "Quotations — RAAR Admin" }] }),
  component: AdminQuotationsPage,
});

const STATUS_COLORS: Record<Quotation["status"], string> = {
  pending: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  reviewing: "bg-blue-500/20 text-blue-200 border-blue-500/40",
  sent: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  rejected: "bg-red-500/20 text-red-200 border-red-500/40",
};

function AdminQuotationsPage() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<Quotation[]>([]);
  const [editing, setEditing] = useState<Quotation | null>(null);

  const refresh = () =>
    supabase.from("quotation_requests").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as Quotation[]));

  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin]);

  if (!isAdmin) return null;

  const remove = async (q: Quotation) => {
    if (!confirm(`Delete request from ${q.client_name}?`)) return;
    const { error } = await supabase.from("quotation_requests").delete().eq("id", q.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); refresh(); }
  };

  return (
    <main className="px-6 py-10 md:px-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl">Quotation requests ({items.length})</h2>
          <p className="mt-1 text-[11px] uppercase tracking-[0.28em] opacity-60">Review, draft, and mark as sent</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm opacity-60">No quotation requests yet.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((q) => (
            <div key={q.id} className="border border-bone/10 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-display text-xl">{q.client_name}</p>
                    <span className={`text-[10px] uppercase tracking-[0.28em] border px-2 py-0.5 ${STATUS_COLORS[q.status]}`}>
                      {q.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-[11px] opacity-70 flex-wrap">
                    <span className="inline-flex items-center gap-1"><Mail size={11} />{q.client_email}</span>
                    {q.client_phone && <span className="inline-flex items-center gap-1"><Phone size={11} />{q.client_phone}</span>}
                    {q.project_location && <span className="inline-flex items-center gap-1"><MapPin size={11} />{q.project_location}</span>}
                    <span className="inline-flex items-center gap-1"><Calendar size={11} />{new Date(q.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.24em] opacity-60">
                    {q.project_type} · {q.project_size} · {q.project_style} · {q.currency}
                  </p>
                  {q.message && <p className="mt-3 text-sm opacity-80 line-clamp-2">{q.message}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(q)} className="border border-bone/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] hover:bg-bone hover:text-ink">
                    Open
                  </button>
                  <button onClick={() => remove(q)} className="p-2 text-destructive hover:bg-destructive/10"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <QuotationEditor q={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </main>
  );
}

function QuotationEditor({ q, onClose, onSaved }: { q: Quotation; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState<Quotation>(q);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("quotation_requests").update({
      status: draft.status,
      admin_notes: draft.admin_notes,
      final_quotation: draft.final_quotation,
    }).eq("id", draft.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); onSaved(); }
  };

  const mailto = `mailto:${draft.client_email}?subject=${encodeURIComponent("Your RAAR quotation")}&body=${encodeURIComponent(draft.final_quotation || "")}`;

  return (
    <div className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="mx-auto max-w-3xl my-12 bg-bone text-ink p-8" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-3xl mb-2">{draft.client_name}</h3>
        <p className="text-sm opacity-60">{draft.client_email}{draft.client_phone && ` · ${draft.client_phone}`}</p>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Brief label="Type" value={draft.project_type} />
          <Brief label="Size" value={draft.project_size} />
          <Brief label="Style" value={draft.project_style} />
          <Brief label="Currency" value={draft.currency} />
          <Brief label="Location" value={draft.project_location} />
        </div>

        {draft.message && (
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.28em] opacity-60">Client message</p>
            <p className="mt-2 text-sm whitespace-pre-wrap">{draft.message}</p>
          </div>
        )}

        <div className="mt-6">
          <label className="block text-[10px] uppercase tracking-[0.28em] opacity-60">Status</label>
          <select
            value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value as Quotation["status"] })}
            className="mt-2 w-full border-b border-ink/30 bg-transparent pb-1.5 text-sm outline-none focus:border-ink"
          >
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="sent">Sent</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="mt-6">
          <label className="block text-[10px] uppercase tracking-[0.28em] opacity-60">Internal notes</label>
          <textarea
            rows={3}
            value={draft.admin_notes ?? ""}
            onChange={(e) => setDraft({ ...draft, admin_notes: e.target.value })}
            className="mt-2 w-full border border-ink/20 bg-transparent p-3 text-sm outline-none focus:border-ink"
          />
        </div>

        <div className="mt-6">
          <label className="block text-[10px] uppercase tracking-[0.28em] opacity-60">Final quotation (sent to client)</label>
          <textarea
            rows={10}
            value={draft.final_quotation ?? ""}
            onChange={(e) => setDraft({ ...draft, final_quotation: e.target.value })}
            placeholder="Draft the full quotation here. You can copy this into your email."
            className="mt-2 w-full border border-ink/20 bg-transparent p-3 text-sm outline-none focus:border-ink font-mono"
          />
        </div>

        <div className="mt-8 flex gap-3 justify-end flex-wrap">
          <a href={mailto} className="border border-ink/30 px-5 py-2.5 text-[11px] uppercase tracking-[0.28em] inline-flex items-center gap-2 hover:bg-ink hover:text-bone">
            <Mail size={12} /> Email client
          </a>
          <button onClick={onClose} className="border border-ink/30 px-5 py-2.5 text-[11px] uppercase tracking-[0.28em]">Cancel</button>
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 bg-ink text-bone px-5 py-2.5 text-[11px] uppercase tracking-[0.28em] disabled:opacity-50">
            <Save size={12} /> {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Brief({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.28em] opacity-60">{label}</p>
      <p className="mt-1 font-display">{value}</p>
    </div>
  );
}
