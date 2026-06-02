import { createFileRoute, Link } from "@tanstack/react-router";
import previewFrame from "@/assets/preview-frame.jpg";
import { Plus, Clock, ChevronRight, Layers, HardDrive } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "MotScri — Workspace" },
      { name: "description", content: "Active projects and new sequence cold-start." },
    ],
  }),
  component: ProjectsPage,
});

const EXISTING = {
  id: "neon-city",
  name: "Neon City · Cut 04",
  duration: "06:57",
  res: "4K · 23.98",
  updated: "2m ago",
  tracks: 7,
  size: "1.84 GB",
};

function ProjectsPage() {
  return (
    <div className="relative flex flex-col min-h-[100dvh] w-full max-w-md mx-auto text-foreground">
      <header className="sticky top-0 z-30 px-4 pt-3 pb-3">
        <div className="glass rounded-2xl px-3 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative size-9 rounded-xl bg-primary grid place-items-center shadow-[var(--shadow-lime)]">
              <SparkLogo />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[15px] font-bold text-primary">MotScri</div>
              <div className="text-[9.5px] font-mono text-on-surface-variant/80">workspace · scoped storage</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-lime-soft text-primary text-[9px] font-mono font-semibold tracking-wider">
            2 ACTIVE
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 space-y-5">
        <section>
          <SectionHeader title="Current Workspace" hint="resume editing" />
          <Link
            to="/editor/$projectId"
            params={{ projectId: EXISTING.id }}
            className="block glass rounded-3xl p-3 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="relative size-20 rounded-2xl overflow-hidden shrink-0">
                <img src={previewFrame} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                <div className="absolute bottom-1 left-1.5 right-1.5 font-mono text-[8.5px] text-white/95 tabular flex justify-between">
                  <span>{EXISTING.duration}</span>
                  <span className="size-1.5 rounded-full bg-lime shadow-[var(--shadow-lime)]" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-[15px] font-semibold text-primary truncate">{EXISTING.name}</div>
                <div className="text-[10px] font-mono text-on-surface-variant flex items-center gap-2 mt-1 flex-wrap">
                  <span>{EXISTING.res}</span>
                  <Dot />
                  <span className="flex items-center gap-1"><Layers className="size-2.5" />{EXISTING.tracks}</span>
                  <Dot />
                  <span className="flex items-center gap-1"><HardDrive className="size-2.5" />{EXISTING.size}</span>
                </div>
                <div className="text-[9.5px] font-mono text-on-surface-variant/70 mt-0.5 flex items-center gap-1">
                  <Clock className="size-2.5" /> {EXISTING.updated}
                </div>
              </div>
              <div className="size-9 rounded-full bg-primary text-on-primary grid place-items-center shrink-0">
                <ChevronRight className="size-4" />
              </div>
            </div>
          </Link>
        </section>

        <section>
          <SectionHeader title="Cold-Start" hint="empty sequence" />
          <Link
            to="/editor/$projectId"
            params={{ projectId: "new" }}
            className="block glass-tint rounded-3xl p-5 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[9.5px] font-mono uppercase tracking-[0.18em] text-secondary mb-2">
                  Untitled · SAF
                </div>
                <h1 className="font-display text-[26px] leading-[30px] font-bold text-primary">
                  New<br />Project
                </h1>
                <p className="text-[12px] text-on-surface-variant mt-2 max-w-[200px]">
                  Empty timeline · pick aspect on entry
                </p>
              </div>
              <div className="size-12 rounded-full bg-primary text-on-primary grid place-items-center shadow-[var(--shadow-glass-lg)] shrink-0">
                <Plus className="size-5" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-5">
              {[
                { l: "4K · 60", k: "16:9" },
                { l: "1080p · 30", k: "16:9" },
                { l: "Vertical", k: "9:16" },
              ].map((p) => (
                <div key={p.l} className="glass rounded-xl h-12 flex flex-col items-center justify-center">
                  <span className="text-[10.5px] font-semibold text-primary">{p.l}</span>
                  <span className="text-[8.5px] font-mono text-on-surface-variant/80">{p.k}</span>
                </div>
              ))}
            </div>
          </Link>
        </section>

        <section>
          <SectionHeader title="Render Queue" hint="1 active · foreground svc" />
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-display text-[13px] font-semibold text-primary">Neon City · Ultra</div>
                <div className="text-[9.5px] font-mono text-on-surface-variant">H.265 · MP4 · AAC 320k</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-lime text-primary text-[10px] font-mono font-semibold">
                34%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div className="h-full w-1/3 bg-primary rounded-full" />
            </div>
            <div className="flex justify-between mt-2 text-[9.5px] font-mono text-on-surface-variant">
              <span>MediaCodec · HW</span>
              <span>ETA 02:11</span>
            </div>
          </div>
        </section>
      </main>

      <BottomNav active="projects" />
    </div>
  );
}

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-end justify-between mb-3 px-1">
      <h2 className="font-display text-[16px] font-semibold text-primary tracking-tight">{title}</h2>
      {hint && (
        <span className="text-[9.5px] font-mono text-on-surface-variant uppercase tracking-wider">{hint}</span>
      )}
    </div>
  );
}

function Dot() {
  return <span className="size-0.5 rounded-full bg-on-surface-variant/50" />;
}

function SparkLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none">
      <path
        d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M5.6 18.4l4.2-4.2M14.2 9.8l4.2-4.2"
        stroke="#c5e1a5" strokeWidth="1.5" strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2" fill="#c5e1a5" />
    </svg>
  );
}
