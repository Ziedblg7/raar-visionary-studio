import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Star, StarOff, Trash2, Plus, Save, Upload } from "lucide-react";

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
  hero_image: string | null;
  gallery: string[];
  tags: string[];
  featured: boolean;
  display_order: number;
};

export const Route = createFileRoute("/admin/projects")({
  head: () => ({ meta: [{ title: "Projects — RAAR Admin" }] }),
  component: AdminProjectsPage,
});

function AdminProjectsPage() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);

  const refresh = () =>
    supabase.from("projects").select("*").order("display_order")
      .then(({ data }) => setProjects((data ?? []) as Project[]));

  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin]);

  if (!isAdmin) return null;

  const toggleFeatured = async (p: Project) => {
    const { error } = await supabase.from("projects").update({ featured: !p.featured }).eq("id", p.id);
    if (error) toast.error(error.message);
    else { toast.success(p.featured ? "Removed from featured" : "Marked as featured"); refresh(); }
  };

  const remove = async (p: Project) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); refresh(); }
  };

  return (
    <main className="px-6 py-10 md:px-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl">Projects ({projects.length})</h2>
        <button
          onClick={() => setEditing({
            id: "", title: "", slug: "", category: "residential", year: new Date().getFullYear(),
            location: "", short_description: "", concept: "", materials: "",
            hero_image: "", gallery: [], tags: [], featured: false, display_order: projects.length + 1,
          })}
          className="inline-flex items-center gap-2 bg-bone text-ink px-5 py-2.5 text-[11px] uppercase tracking-[0.28em]"
        >
          <Plus size={12} /> New project
        </button>
      </div>

      <div className="grid gap-3">
        {projects.map((p) => (
          <div key={p.id} className="flex items-center gap-4 border border-bone/10 p-4">
            <div className="h-16 w-24 overflow-hidden bg-bone/5 shrink-0">
              {p.hero_image && <img src={p.hero_image} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-xl truncate">{p.title}</p>
              <p className="text-[10px] uppercase tracking-[0.28em] opacity-60">
                {p.category} · {p.year} · {p.location}
              </p>
            </div>
            <button onClick={() => toggleFeatured(p)} title="Toggle featured" className="p-2 hover:bg-bone/10">
              {p.featured ? <Star size={16} className="fill-sandstone text-sandstone" /> : <StarOff size={16} className="opacity-50" />}
            </button>
            <button onClick={() => setEditing(p)} className="border border-bone/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] hover:bg-bone hover:text-ink">Edit</button>
            <button onClick={() => remove(p)} className="p-2 text-destructive hover:bg-destructive/10"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      {editing && <ProjectEditor project={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </main>
  );
}

function ProjectEditor({ project, onClose, onSaved }: { project: Project; onClose: () => void; onSaved: () => void }) {
  const [p, setP] = useState<Project>(project);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const slug = p.slug || p.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const payload = {
      title: p.title, slug, category: p.category, year: p.year,
      location: p.location, short_description: p.short_description, concept: p.concept,
      materials: p.materials, hero_image: p.hero_image, gallery: p.gallery, tags: p.tags,
      featured: p.featured, display_order: p.display_order,
    };
    const { error } = p.id
      ? await supabase.from("projects").update(payload).eq("id", p.id)
      : await supabase.from("projects").insert(payload);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); onSaved(); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="mx-auto max-w-3xl my-12 bg-bone text-ink p-8" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-3xl mb-6">{p.id ? "Edit project" : "New project"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <In label="Title" value={p.title} onChange={(v) => setP({ ...p, title: v })} />
          <In label="Slug (auto if blank)" value={p.slug} onChange={(v) => setP({ ...p, slug: v })} />
          <Sel label="Category" value={p.category} options={["residential", "commercial", "interior", "concept"]} onChange={(v) => setP({ ...p, category: v })} />
          <In label="Year" type="number" value={String(p.year ?? "")} onChange={(v) => setP({ ...p, year: v ? Number(v) : null })} />
          <In label="Location" value={p.location ?? ""} onChange={(v) => setP({ ...p, location: v })} />
          <ImgField label="Hero image URL" value={p.hero_image ?? ""} onChange={(v) => setP({ ...p, hero_image: v })} onUpload={(urls) => setP((prev) => ({ ...prev, hero_image: urls[0] }))} />
          <In label="Materials" value={p.materials ?? ""} onChange={(v) => setP({ ...p, materials: v })} />
          <In label="Display order" type="number" value={String(p.display_order)} onChange={(v) => setP({ ...p, display_order: Number(v) || 0 })} />
          <In label="Tags (comma)" value={p.tags.join(", ")} onChange={(v) => setP({ ...p, tags: v.split(",").map((t) => t.trim()).filter(Boolean) })} />
          <ImgField label="Gallery URLs (comma or newline)" value={p.gallery.join(",\n")} onChange={(v) => setP({ ...p, gallery: v.split(/,|\n/).map((t) => t.trim()).filter(Boolean) })} onUpload={(urls) => setP((prev) => ({ ...prev, gallery: [...(prev.gallery || []), ...urls] }))} multiple={true} />
        </div>
        <Ta label="Short description" value={p.short_description ?? ""} onChange={(v) => setP({ ...p, short_description: v })} />
        <Ta label="Concept" value={p.concept ?? ""} onChange={(v) => setP({ ...p, concept: v })} rows={6} />
        <label className="mt-4 inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={p.featured} onChange={(e) => setP({ ...p, featured: e.target.checked })} />
          Featured on homepage
        </label>
        <div className="mt-8 flex gap-3 justify-end">
          <button onClick={onClose} className="border border-ink/30 px-5 py-2.5 text-[11px] uppercase tracking-[0.28em]">Cancel</button>
          <button onClick={save} disabled={busy || !p.title} className="inline-flex items-center gap-2 bg-ink text-bone px-5 py-2.5 text-[11px] uppercase tracking-[0.28em] disabled:opacity-50">
            <Save size={12} /> {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function In({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.28em] opacity-60">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border-b border-ink/30 bg-transparent pb-1.5 text-sm outline-none focus:border-ink" />
    </div>
  );
}
function Ta({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="mt-4">
      <label className="block text-[10px] uppercase tracking-[0.28em] opacity-60">{label}</label>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border border-ink/20 bg-transparent p-3 text-sm outline-none focus:border-ink" />
    </div>
  );
}
function Sel({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.28em] opacity-60">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border-b border-ink/30 bg-transparent pb-1.5 text-sm outline-none focus:border-ink">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function ImgField({ label, value, onChange, onUpload, multiple = false }: { label: string; value: string; onChange: (v: string) => void; onUpload: (urls: string[]) => void; multiple?: boolean }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      
      const uploadedUrls: string[] = [];
      const files = Array.from(e.target.files);

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      onUpload(uploadedUrls);
    } catch (error: any) {
      toast.error(error.message || 'Error uploading image(s)');
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-end justify-between">
        <label className="block text-[10px] uppercase tracking-[0.28em] opacity-60">{label}</label>
        <label className={`cursor-pointer inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] font-medium text-ink hover:opacity-70 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <input 
            type="file" 
            accept="image/*" 
            multiple={multiple}
            onChange={handleFileChange} 
            disabled={uploading}
            className="hidden" 
          />
          <Upload size={10} />
          {uploading ? 'Uploading...' : (multiple ? 'Upload Files' : 'Upload File')}
        </label>
      </div>
      {multiple ? (
        <textarea 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          rows={4} 
          className="mt-1 w-full border border-ink/20 bg-transparent p-2 text-sm outline-none focus:border-ink break-all" 
        />
      ) : (
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="mt-1 w-full border-b border-ink/30 bg-transparent pb-1.5 text-sm outline-none focus:border-ink" 
        />
      )}
    </div>
  );
}

