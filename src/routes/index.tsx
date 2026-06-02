import { createFileRoute, Link } from "@tanstack/react-router";
import previewFrame from "@/assets/preview-frame.jpg";
import {
  Plus, Sparkles, Mic, Music2, Captions, Folder, Clock,
  ChevronRight, Settings, Layers, Search, HardDrive,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MotScri — Workspace" },
      { name: "description", content: "Organic intelligence mobile NLE. On-device AI, hardware-accelerated rendering." },
    ],
  }),
  component: HomePage,
});

const PROJECTS = [
  { id: "neon-city", name: "Neon City · Cut 04", duration: "06:57", res: "4K · 23.98", updated: "2m ago", tracks: 7, size: "1.84 GB" },
  { id: "rain-mono", name: "Rain · Mono Short", duration: "01:42", res: "1080p · 30", updated: "1h ago", tracks: 4, size: "420 MB" },
  { id: "studio-c4", name: "C4 Studio Promo", duration: "00:58", res: "1080p · 60", updated: "Yesterday", tracks: 5, size: "612 MB" },
  { id: "doc-interview", name: "Doc · Interview 03", duration: "12:11", res: "1080p · 24", updated: "2 days", tracks: 9, size: "3.21 GB" },
];

const QUICK_AI = [
  { id: "whisper", icon: Captions, label: "Transcribe", sub: "Whisper · 39M" },
  { id: "kokoro", icon: Mic, label: "Voiceover", sub: "Kokoro TTS" },
  { id: "musicgen", icon: Music2, label: "Compose", sub: "MusicGen" },
  { id: "scene", icon: Sparkles, label: "Scene Detect", sub: "On-device VLM" },
];

function HomePage() {
  return (
    <div className="relative flex flex-col min-h-[100dvh] w-full max-w-md mx-auto text-foreground">
      {/* Zone 1: Header */}
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
          <button className="size-9 grid place-items-center rounded-full glass-strong text-primary">
            <Settings className="size-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 space-y-5">
        {/* Search */}
        <div className="glass rounded-full h-11 px-4 flex items-center gap-2.5">
          <Search className="size-4 text-on-surface-variant" />
          <input
            placeholder="Search projects, media, scenes…"
            className="bg-transparent flex-1 outline-none text-[13px] placeholder:text-on-surface-variant/60"
          />
          <span className="text-[9.5px] font-mono uppercase tracking-wider text-on-surface-variant/70">⌘ K</span>
        </div>

        {/* New project — primary pill action */}
        <Link
          to="/editor/$projectId"
          params={{ projectId: "new" }}
          className="block glass-tint rounded-3xl p-5 active:scale-[0.99] transition-transform"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[9.5px] font-mono uppercase tracking-[0.18em] text-secondary mb-2">
                Cold-start · SAF
              </div>
              <h1 className="font-display text-[26px] leading-[30px] font-bold text-primary">
                New<br />Project
              </h1>
              <p className="text-[12px] text-on-surface-variant mt-2 max-w-[200px]">
                MOtISCEI runtime · MediaCodec H.265 · NNAPI / Hexagon ready
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

        {/* On-Device Intelligence */}
        <section>
          <SectionHeader title="On-Device Intelligence" hint="NNAPI · Hexagon" />
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_AI.map((q) => (
              <button
                key={q.id}
                className="glass rounded-2xl p-3.5 text-left active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="size-9 rounded-xl bg-primary text-on-primary grid place-items-center">
                    <q.icon className="size-4" />
                  </div>
                  <span className="size-2 rounded-full bg-lime shadow-[var(--shadow-lime)]" />
                </div>
                <div className="font-display text-[13px] font-semibold text-primary leading-tight">{q.label}</div>
                <div className="text-[9.5px] font-mono text-on-surface-variant mt-0.5">{q.sub}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Recent projects */}
        <section>
          <SectionHeader title="Workspaces" hint={`${PROJECTS.length} active`} />
          <div className="space-y-2.5">
            {PROJECTS.map((p) => (
              <Link
                key={p.id}
                to="/editor/$projectId"
                params={{ projectId: p.id }}
                className="glass rounded-3xl p-2.5 flex items-center gap-3 active:scale-[0.99] transition-transform"
              >
                <div className="relative size-16 rounded-2xl overflow-hidden shrink-0">
                  <img src={previewFrame} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                  <div className="absolute bottom-1 left-1.5 right-1.5 font-mono text-[8.5px] text-white/95 tabular flex justify-between">
                    <span>{p.duration}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-[14px] font-semibold text-primary truncate">{p.name}</div>
                  <div className="text-[10px] font-mono text-on-surface-variant flex items-center gap-2 mt-1 flex-wrap">
                    <span>{p.res}</span>
                    <Dot />
                    <span className="flex items-center gap-1"><Layers className="size-2.5" />{p.tracks}</span>
                    <Dot />
                    <span className="flex items-center gap-1"><HardDrive className="size-2.5" />{p.size}</span>
                  </div>
                  <div className="text-[9.5px] font-mono text-on-surface-variant/70 mt-0.5 flex items-center gap-1">
                    <Clock className="size-2.5" /> {p.updated}
                  </div>
                </div>
                <div className="size-8 rounded-full bg-primary text-on-primary grid place-items-center shrink-0">
                  <ChevronRight className="size-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Render queue */}
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

      <BottomNav active="home" />
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

export function BottomNav({ active }: { active: "home" | "media" | "workspace" | "ai" | "settings" }) {
  const items = [
    { id: "home", icon: Folder, label: "Projects" },
    { id: "media", icon: Layers, label: "Media" },
    { id: "workspace", icon: Sparkles, label: "Editor", editor: true },
    { id: "ai", icon: Mic, label: "Agent" },
    { id: "settings", icon: Settings, label: "Settings" },
  ] as const;
  return (
    <nav className="fixed bottom-3 inset-x-0 max-w-md mx-auto px-4 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="glass-strong rounded-full h-14 grid grid-cols-5 px-2">
        {items.map((it) => {
          const isActive = it.id === active;
          const inner = (
            <div className={`flex flex-col items-center justify-center gap-0.5 h-full rounded-full transition-colors ${
              isActive ? "bg-primary text-on-primary" : "text-primary/70"
            }`}>
              <it.icon className="size-4" />
              <span className="text-[8.5px] font-semibold tracking-wide">{it.label}</span>
            </div>
          );
          if ("editor" in it && it.editor) {
            return (
              <Link key={it.id} to="/editor/$projectId" params={{ projectId: "neon-city" }}>
                {inner}
              </Link>
            );
          }
          return <Link key={it.id} to="/">{inner}</Link>;
        })}
      </div>
    </nav>
  );
}
