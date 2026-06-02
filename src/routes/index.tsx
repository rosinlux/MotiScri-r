import { createFileRoute, Link } from "@tanstack/react-router";
import previewFrame from "@/assets/preview-frame.jpg";
import {
  Plus, Sparkles, Mic, Music2, Captions, Film, Folder, Clock,
  ChevronRight, Settings, Layers, Search, Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MotScri — Mobile NLE" },
      { name: "description", content: "Hardware-accelerated mobile video editor with on-device AI." },
    ],
  }),
  component: HomePage,
});

const PROJECTS = [
  { id: "neon-city", name: "Neon_City_Cut_04", duration: "06:57", res: "4K · 23.98", updated: "2m ago", tracks: 7 },
  { id: "rain-mono", name: "Rain · Mono Short", duration: "01:42", res: "1080p · 30", updated: "1h ago", tracks: 4 },
  { id: "studio-c4", name: "C4 Studio Promo", duration: "00:58", res: "1080p · 60", updated: "Yesterday", tracks: 5 },
  { id: "doc-interview", name: "Doc · Interview 03", duration: "12:11", res: "1080p · 24", updated: "2 days", tracks: 9 },
];

const QUICK_AI = [
  { id: "whisper", icon: Captions, label: "Transcribe", sub: "Whisper · 39M", tint: "accent" as const },
  { id: "kokoro", icon: Mic, label: "Voiceover", sub: "Kokoro TTS", tint: "audio" as const },
  { id: "musicgen", icon: Music2, label: "Compose", sub: "MusicGen", tint: "fx" as const },
  { id: "scene", icon: Sparkles, label: "Scene Detect", sub: "On-device", tint: "ok" as const },
];

function HomePage() {
  return (
    <div className="flex flex-col min-h-[100dvh] w-full max-w-md mx-auto bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-accent grid place-items-center shadow-[0_0_18px_var(--color-accent)]">
              <Film className="size-4 text-background" />
            </div>
            <div className="leading-none">
              <div className="text-[13px] font-bold tracking-tight">MotScri</div>
              <div className="text-[9px] font-mono text-muted-foreground">v2.4 · NNAPI · Hexagon</div>
            </div>
          </div>
          <button className="size-8 grid place-items-center rounded-md bg-surface ring-1 ring-border text-muted-foreground active:bg-panel-elevated">
            <Settings className="size-4" />
          </button>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 h-9 px-3 rounded-md bg-surface ring-1 ring-border">
            <Search className="size-3.5 text-muted-foreground" />
            <input
              placeholder="Search projects, media, presets…"
              className="bg-transparent flex-1 outline-none text-[12px] placeholder:text-muted-foreground/60"
            />
            <kbd className="text-[9px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-panel-elevated">⌘K</kbd>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pt-4 pb-24 space-y-6">
        {/* New project CTA */}
        <Link
          to="/editor/$projectId"
          params={{ projectId: "new" }}
          className="group block rounded-xl border border-accent/40 bg-gradient-to-br from-accent/15 via-panel to-background p-4 active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-lg bg-accent text-background grid place-items-center shadow-lg">
                <Plus className="size-5" />
              </div>
              <div className="leading-tight">
                <div className="text-[13px] font-bold">New Project</div>
                <div className="text-[10px] font-mono text-muted-foreground">H.265 · HW · MediaCodec</div>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-active:translate-x-0.5 transition-transform" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {["4K · 60", "1080p · 30", "9:16 Vert"].map((p) => (
              <div
                key={p}
                className="h-9 rounded-md bg-background/60 ring-1 ring-border grid place-items-center text-[10px] font-mono text-foreground/80"
              >
                {p}
              </div>
            ))}
          </div>
        </Link>

        {/* AI Quick actions */}
        <section>
          <SectionHeader title="On-Device Intelligence" hint="NNAPI · Ready" hintDot />
          <div className="grid grid-cols-2 gap-2">
            {QUICK_AI.map((q) => (
              <button
                key={q.id}
                className="p-3 rounded-lg bg-surface border border-border text-left active:bg-panel-elevated transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`size-8 rounded-md grid place-items-center ${tintBg(q.tint)}`}>
                    <q.icon className="size-4" />
                  </div>
                  <Zap className="size-3 text-muted-foreground/60" />
                </div>
                <div className="text-[11.5px] font-semibold leading-tight">{q.label}</div>
                <div className="text-[9px] font-mono text-muted-foreground mt-0.5">{q.sub}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Recent projects */}
        <section>
          <SectionHeader title="Recent Projects" hint={`${PROJECTS.length} files`} />
          <div className="space-y-2">
            {PROJECTS.map((p) => (
              <Link
                key={p.id}
                to="/editor/$projectId"
                params={{ projectId: p.id }}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-surface border border-border active:bg-panel-elevated transition-colors"
              >
                <div className="relative size-14 rounded-md overflow-hidden ring-1 ring-black/40 shrink-0 border-l-2 border-l-accent">
                  <img src={previewFrame} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-1 left-1 right-1 font-mono text-[8px] text-foreground/90 tabular">
                    {p.duration}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold truncate">{p.name}</div>
                  <div className="text-[9.5px] font-mono text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>{p.res}</span>
                    <span className="size-0.5 rounded-full bg-muted-foreground/50" />
                    <span className="flex items-center gap-1"><Layers className="size-2.5" />{p.tracks}</span>
                    <span className="size-0.5 rounded-full bg-muted-foreground/50" />
                    <span className="flex items-center gap-1"><Clock className="size-2.5" />{p.updated}</span>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* Render queue */}
        <section>
          <SectionHeader title="Render Queue" hint="1 active" />
          <div className="rounded-lg bg-surface border border-border p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-semibold">Neon_City_Cut_04 · Ultra</div>
              <span className="text-[9px] font-mono text-accent">34%</span>
            </div>
            <div className="h-1.5 rounded-full bg-background overflow-hidden">
              <div className="h-full w-1/3 bg-accent" />
            </div>
            <div className="flex justify-between mt-1.5 text-[9px] font-mono text-muted-foreground">
              <span>H.265 · MP4 · AAC</span>
              <span>ETA 02:11</span>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom nav */}
      <BottomNav active="home" />
    </div>
  );
}

function SectionHeader({ title, hint, hintDot }: { title: string; hint?: string; hintDot?: boolean }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-[11px] font-bold tracking-wider uppercase text-foreground">{title}</h2>
      {hint && (
        <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
          {hintDot && <span className="size-1.5 rounded-full bg-ok animate-pulse" />}
          {hint}
        </span>
      )}
    </div>
  );
}

function tintBg(t: "accent" | "audio" | "fx" | "ok") {
  return {
    accent: "bg-accent/15 text-accent",
    audio: "bg-track-audio/15 text-track-audio",
    fx: "bg-track-fx/15 text-track-fx",
    ok: "bg-ok/15 text-ok",
  }[t];
}

export function BottomNav({ active }: { active: "home" | "media" | "workspace" | "ai" | "settings" }) {
  const items = [
    { id: "home", icon: Folder, label: "PROJECTS" },
    { id: "media", icon: Film, label: "MEDIA" },
    { id: "workspace", icon: Layers, label: "EDIT", editor: true },
    { id: "ai", icon: Sparkles, label: "AI" },
    { id: "settings", icon: Settings, label: "SETTINGS" },
  ] as const;
  return (
    <nav className="fixed bottom-0 inset-x-0 max-w-md mx-auto grid grid-cols-5 h-14 bg-background/95 backdrop-blur border-t border-border z-40 pb-[env(safe-area-inset-bottom)]">
      {items.map((it) => {
        const isActive = it.id === active;
        const cls = `relative flex flex-col items-center justify-center gap-1 ${
          isActive ? "text-foreground" : "text-muted-foreground/60"
        }`;
        const inner = (
          <>
            <it.icon className="size-4" />
            <span className="text-[8px] font-bold tracking-tighter">{it.label}</span>
            {isActive && <span className="absolute top-0 h-0.5 w-8 bg-accent rounded-b" />}
          </>
        );
        if ("editor" in it && it.editor) {
          return (
            <Link key={it.id} to="/editor/$projectId" params={{ projectId: "neon-city" }} className={cls}>
              {inner}
            </Link>
          );
        }
        return (
          <Link key={it.id} to="/" className={cls}>
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}
