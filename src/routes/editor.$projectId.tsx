import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import previewFrame from "@/assets/preview-frame.jpg";
import {
  Play, Pause, SkipBack, SkipForward, Scissors, Magnet, Maximize2,
  Volume2, Wand2, Sparkles, Mic, Music2, Captions, Plus, Lock,
  Eye, ChevronLeft, Settings, Layers, Film, Folder, ZoomIn, ZoomOut,
} from "lucide-react";

export const Route = createFileRoute("/editor/$projectId")({
  head: () => ({
    meta: [
      { title: "MotScri — Editor" },
      { name: "description", content: "Tactile mobile NLE workspace." },
    ],
  }),
  component: EditorPage,
});

type Deck = "edit" | "vfx" | "audio" | "ai" | "export";

function EditorPage() {
  const { projectId } = useParams({ from: "/editor/$projectId" });
  const [deck, setDeck] = useState<Deck>("edit");
  const [playing, setPlaying] = useState(false);
  const [selectedClip, setSelectedClip] = useState<string | null>("v1-2");
  const [time, setTime] = useState(252); // seconds

  return (
    <div className="flex flex-col min-h-[100dvh] w-full max-w-md mx-auto bg-background text-foreground">
      <TopBar projectId={projectId} />
      <Viewport playing={playing} />
      <Transport
        playing={playing}
        onToggle={() => setPlaying((p) => !p)}
        time={time}
        onSeek={setTime}
      />
      <Timeline selected={selectedClip} onSelect={setSelectedClip} />
      <ControlDeck deck={deck} setDeck={setDeck} selectedClip={selectedClip} />
      <div className="h-14" />
      <EditorBottomNav />
    </div>
  );
}

function TopBar({ projectId }: { projectId: string }) {
  const name = projectId === "new" ? "Untitled_001" : projectId.replace(/-/g, "_");
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 h-11 border-b border-border bg-panel/95 backdrop-blur">
      <Link to="/" className="size-8 -ml-1 grid place-items-center text-muted-foreground active:bg-panel-elevated rounded-md">
        <ChevronLeft className="size-4" />
      </Link>
      <div className="flex flex-col items-center leading-none">
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Project</span>
        <span className="text-[11px] font-semibold text-foreground/90">{name}</span>
      </div>
      <button className="text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-md bg-foreground text-background active:bg-foreground/80">
        EXPORT
      </button>
    </header>
  );
}

function Viewport({ playing }: { playing: boolean }) {
  return (
    <section className="relative bg-black shrink-0">
      <div className="relative w-full aspect-video">
        <img
          src={previewFrame}
          alt="Preview"
          className="w-full h-full object-cover opacity-95"
          width={1088}
          height={608}
        />
        <div className="absolute inset-6 border border-accent/50 pointer-events-none">
          {[
            "top-0 left-0 border-t-2 border-l-2",
            "top-0 right-0 border-t-2 border-r-2",
            "bottom-0 left-0 border-b-2 border-l-2",
            "bottom-0 right-0 border-b-2 border-r-2",
          ].map((c) => (
            <div key={c} className={`absolute ${c} size-2.5 border-accent`} />
          ))}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-2 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
        </div>
        <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/55 backdrop-blur-md border border-white/5">
          <span className="font-mono text-[10px] tracking-tight text-foreground/90 tabular">00:04:12:18</span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/55 backdrop-blur-md border border-white/5">
          {playing && <span className="size-1.5 rounded-full bg-rec animate-pulse" />}
          <span className="font-mono text-[10px] text-foreground/80">4K · 23.98</span>
        </div>
        <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/55 border border-white/5">
          <span className="font-mono text-[9px] tracking-tight text-accent">H.265 · HW</span>
        </div>
        <div className="absolute bottom-3 right-3 h-10 w-20 rounded bg-black/55 border border-white/5 p-1 backdrop-blur-md">
          <div className="h-full w-full flex items-end gap-[1.5px]">
            {[3, 6, 4, 8, 5, 9, 7, 5, 6, 4, 7, 8, 5, 3].map((h, i) => (
              <div key={i} className="flex-1 bg-accent/70" style={{ height: `${h * 10}%` }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Transport({
  playing, onToggle, time, onSeek,
}: { playing: boolean; onToggle: () => void; time: number; onSeek: (n: number) => void }) {
  const total = 417;
  const pct = (time / total) * 100;
  return (
    <div className="bg-panel border-b border-border shrink-0">
      <div className="flex items-center justify-between px-4 h-12">
        <div className="flex items-center gap-2">
          <TransportBtn onClick={() => onSeek(Math.max(0, time - 5))}><SkipBack className="size-4" /></TransportBtn>
          <button
            onClick={onToggle}
            className="size-9 rounded-full bg-foreground text-background grid place-items-center active:scale-95 transition-transform shadow-lg"
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4 translate-x-0.5" />}
          </button>
          <TransportBtn onClick={() => onSeek(Math.min(total, time + 5))}><SkipForward className="size-4" /></TransportBtn>
        </div>
        <div className="flex flex-col items-end leading-none">
          <span className="font-mono text-[10px] text-muted-foreground tabular">DUR 06:57:00</span>
          <span className="font-mono text-[11px] text-foreground tabular">{fmt(time)}</span>
        </div>
      </div>
      <div className="px-4 pb-2">
        <input
          type="range"
          min={0}
          max={total}
          value={time}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="w-full h-1 accent-[var(--color-accent)] cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--color-accent) ${pct}%, var(--color-surface) ${pct}%)`,
          }}
        />
      </div>
    </div>
  );
}

function fmt(s: number) {
  const h = Math.floor(s / 3600).toString().padStart(2, "0");
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${h}:${m}:${sec}:00`;
}

function TransportBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="size-8 grid place-items-center rounded-md bg-surface ring-1 ring-border text-muted-foreground active:bg-panel-elevated active:text-foreground"
    >
      {children}
    </button>
  );
}

function Timeline({
  selected, onSelect,
}: { selected: string | null; onSelect: (id: string) => void }) {
  const [zoom, setZoom] = useState(1);
  return (
    <section className="relative bg-background flex flex-col shrink-0">
      <div className="flex items-center justify-between px-3 h-7 border-b border-border bg-surface/60">
        <span className="text-[9px] font-bold tracking-wider text-muted-foreground">TIMELINE</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="size-6 grid place-items-center rounded text-muted-foreground active:bg-panel-elevated">
            <ZoomOut className="size-3" />
          </button>
          <span className="text-[9px] font-mono text-muted-foreground tabular w-8 text-center">{zoom.toFixed(2)}x</span>
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="size-6 grid place-items-center rounded text-muted-foreground active:bg-panel-elevated">
            <ZoomIn className="size-3" />
          </button>
        </div>
      </div>

      <div className="relative overflow-x-auto no-scrollbar">
        <div style={{ minWidth: `${800 * zoom}px` }}>
          {/* Ruler */}
          <div className="h-6 border-b border-border bg-surface/40 flex items-end px-12 gap-0 relative">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-start gap-0.5">
                <span className="font-mono text-[8px] text-muted-foreground/70 tabular">
                  {String(i * 2).padStart(2, "0")}s
                </span>
                <div className="w-px h-1 bg-border-strong" />
              </div>
            ))}
          </div>

          <div className="py-1">
            <TrackRow label="V2" kind="video">
              <Clip id="v2-1" width={140 * zoom} kind="fx" label="Adjustment · Curves" selected={selected === "v2-1"} onSelect={onSelect} />
            </TrackRow>
            <TrackRow label="V1" kind="video" primary>
              <FilmstripClip id="v1-1" width={190 * zoom} label="MVI_0921" hue={200} selected={selected === "v1-1"} onSelect={onSelect} />
              <FilmstripClip id="v1-2" width={250 * zoom} label="MVI_0922" hue={20} selected={selected === "v1-2"} onSelect={onSelect} />
              <FilmstripClip id="v1-3" width={120 * zoom} label="MVI_0923" hue={280} selected={selected === "v1-3"} onSelect={onSelect} />
            </TrackRow>
            <div className="h-1.5" />
            <TrackRow label="A1" kind="audio">
              <WaveClip id="a1-1" width={360 * zoom} label="DIALOG.wav" selected={selected === "a1-1"} onSelect={onSelect} />
              <WaveClip id="a1-2" width={180 * zoom} label="ROOM_TONE.wav" dim selected={selected === "a1-2"} onSelect={onSelect} />
            </TrackRow>
            <TrackRow label="A2" kind="audio">
              <WaveClip id="a2-1" width={520 * zoom} label="SCORE_MUSICGEN_v3.wav" tone="fx" selected={selected === "a2-1"} onSelect={onSelect} />
            </TrackRow>
            <TrackRow label="A3" kind="audio" empty />
          </div>
        </div>

        {/* Playhead */}
        <div className="absolute top-6 bottom-0 left-1/2 w-px bg-accent z-30 shadow-[0_0_10px_var(--color-accent)] pointer-events-none">
          <div className="absolute -top-0 -left-1.5 size-3 rotate-45 bg-accent shadow-md" />
        </div>
      </div>

      <div className="absolute right-3 top-10 flex flex-col gap-2 z-40">
        <FloatTool active><Scissors className="size-4" /></FloatTool>
        <FloatTool><Magnet className="size-4" /></FloatTool>
        <FloatTool><Maximize2 className="size-4" /></FloatTool>
      </div>
    </section>
  );
}

function FloatTool({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className={`size-9 rounded-full grid place-items-center ring-1 shadow-lg active:scale-95 transition-transform backdrop-blur-md ${
        active ? "bg-foreground text-background ring-white/20" : "bg-panel/90 text-muted-foreground ring-border"
      }`}
    >
      {children}
    </button>
  );
}

function TrackRow({
  label, kind, primary, empty, children,
}: {
  label: string;
  kind: "video" | "audio";
  primary?: boolean;
  empty?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={`flex items-center gap-1 ${primary ? "h-16" : "h-12"} px-3`}>
      <div className="sticky left-0 z-20 w-10 h-full flex flex-col justify-center items-start gap-1 pr-1 bg-background">
        <span className="text-[9px] font-bold text-muted-foreground tracking-wider">{label}</span>
        <div className="flex gap-1">
          <Lock className="size-2.5 text-muted-foreground/60" />
          {kind === "video" ? (
            <Eye className="size-2.5 text-muted-foreground/60" />
          ) : (
            <Volume2 className="size-2.5 text-muted-foreground/60" />
          )}
        </div>
      </div>
      {empty ? (
        <div className="h-9 flex-1 rounded-md border border-dashed border-border grid place-items-center">
          <span className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider">
            <Plus className="size-3 inline -translate-y-px mr-1" /> Drop media
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1 h-full">{children}</div>
      )}
    </div>
  );
}

function Clip({
  id, width, label, selected, onSelect,
}: { id: string; width: number; kind: "fx"; label: string; selected?: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      onClick={() => onSelect(id)}
      style={{ width }}
      className={`h-9 rounded-md border bg-track-fx/15 border-track-fx/40 text-track-fx flex items-center px-2 gap-1.5 shrink-0 ${
        selected ? "ring-2 ring-accent" : ""
      }`}
    >
      <Wand2 className="size-3" />
      <span className="text-[9px] font-semibold truncate">{label}</span>
    </button>
  );
}

function FilmstripClip({
  id, width, label, hue, selected, onSelect,
}: { id: string; width: number; label: string; hue: number; selected?: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      onClick={() => onSelect(id)}
      style={{ width }}
      className={`h-14 rounded-md ring-1 ring-black/40 border-l-2 border-l-accent overflow-hidden relative shrink-0 shadow-md ${
        selected ? "outline outline-2 outline-accent" : ""
      }`}
    >
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: `url(${previewFrame})`,
          backgroundSize: "cover",
          backgroundPosition: `${hue}% center`,
          filter: `hue-rotate(${hue}deg) saturate(0.85)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-between p-1.5">
        <div className="flex gap-1 opacity-50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 h-3 bg-white/10 rounded-[2px]" />
          ))}
        </div>
        <span className="text-[8.5px] font-semibold font-mono bg-black/40 self-start px-1 rounded text-foreground/90">
          {label}
        </span>
      </div>
    </button>
  );
}

function WaveClip({
  id, width, label, dim, tone = "audio", selected, onSelect,
}: { id: string; width: number; label: string; dim?: boolean; tone?: "audio" | "fx"; selected?: boolean; onSelect: (id: string) => void }) {
  const bars = Array.from({ length: Math.floor(width / 4) }, (_, i) =>
    3 + Math.abs(Math.sin(i * 0.6) + Math.cos(i * 0.21)) * 7,
  );
  const colorClass = tone === "fx" ? "bg-track-fx/60" : "bg-track-audio/70";
  const ringClass = tone === "fx" ? "border-track-fx/40 bg-track-fx/10" : "border-track-audio/40 bg-track-audio/10";
  return (
    <button
      onClick={() => onSelect(id)}
      style={{ width }}
      className={`h-9 rounded-md border ${ringClass} relative overflow-hidden shrink-0 ${dim ? "opacity-60" : ""} ${
        selected ? "ring-2 ring-accent" : ""
      }`}
    >
      <div className="absolute inset-x-1 inset-y-1 flex items-center gap-[1px]">
        {bars.map((h, i) => (
          <div key={i} className={`flex-1 ${colorClass} rounded-[1px]`} style={{ height: `${h * 10}%` }} />
        ))}
      </div>
      <span className="absolute bottom-0.5 left-1.5 text-[8px] font-mono text-foreground/80 bg-black/30 px-1 rounded">
        {label}
      </span>
    </button>
  );
}

/* ---------- Control deck ---------- */

const DECK_TABS: { id: Deck; label: string; badge?: string }[] = [
  { id: "edit", label: "EDIT" },
  { id: "vfx", label: "VFX" },
  { id: "audio", label: "AUDIO" },
  { id: "ai", label: "MODELS", badge: "AI" },
  { id: "export", label: "RENDER" },
];

function ControlDeck({
  deck, setDeck, selectedClip,
}: { deck: Deck; setDeck: (d: Deck) => void; selectedClip: string | null }) {
  return (
    <section className="bg-panel border-t border-border shrink-0">
      <div className="flex border-b border-border/60 overflow-x-auto no-scrollbar">
        {DECK_TABS.map((t) => {
          const active = deck === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setDeck(t.id)}
              className={`flex-1 min-w-[70px] h-9 text-[10px] font-bold tracking-wider flex items-center justify-center gap-1 border-b-2 transition-colors ${
                active ? "text-foreground border-foreground bg-panel-elevated/40" : "text-muted-foreground border-transparent"
              }`}
            >
              {t.badge && (
                <span className="text-[8px] px-1 py-px rounded bg-border-strong text-foreground/90">{t.badge}</span>
              )}
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="pb-3">
        {deck === "edit" && <EditDeck selectedClip={selectedClip} />}
        {deck === "vfx" && <VfxDeck />}
        {deck === "audio" && <AudioDeck />}
        {deck === "ai" && <AiDeck />}
        {deck === "export" && <ExportDeck />}
      </div>
    </section>
  );
}

function DeckHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-2">
      <h3 className="text-[11px] font-semibold tracking-wide text-foreground">{title}</h3>
      {hint && <span className="text-[9px] text-muted-foreground font-mono">{hint}</span>}
    </div>
  );
}

function EditDeck({ selectedClip }: { selectedClip: string | null }) {
  const tools = ["Split", "Ripple", "Rolling", "Slip", "Slide", "Rate"];
  const [active, setActive] = useState(0);
  return (
    <div>
      <DeckHeader title="Tactile Toolset" hint={selectedClip ?? "no selection"} />
      <div className="grid grid-cols-3 gap-2 px-4">
        {tools.map((t, i) => (
          <button
            key={t}
            onClick={() => setActive(i)}
            className={`h-12 rounded-md border ${
              active === i ? "bg-foreground text-background border-foreground" : "bg-surface border-border text-foreground/90"
            } text-[10px] font-semibold tracking-wide active:scale-95 transition-transform`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 px-4 mt-3">
        <Stat label="In" value="04:11:02" />
        <Stat label="Out" value="04:14:21" />
      </div>
    </div>
  );
}

function VfxDeck() {
  const [active, setActive] = useState<string>("Color · Curves");
  const fx = [
    { n: "Gaussian Blur", v: "12%" },
    { n: "Color · Curves", v: "ON" },
    { n: "RGB Split", v: "3px" },
    { n: "Film Grain", v: "18" },
    { n: "Chroma Key", v: "—" },
    { n: "Vignette", v: "0.4" },
  ];
  return (
    <div>
      <DeckHeader title="Effects · 25 Blend modes" hint="GPU · Vulkan" />
      <div className="px-4 grid grid-cols-2 gap-2">
        {fx.map((f) => (
          <button
            key={f.n}
            onClick={() => setActive(f.n)}
            className={`h-12 rounded-md border px-3 flex items-center justify-between transition-colors ${
              active === f.n ? "bg-panel-elevated border-accent/40" : "bg-surface border-border"
            }`}
          >
            <span className="text-[10px] font-medium">{f.n}</span>
            <span className="text-[9px] font-mono text-accent">{f.v}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AudioDeck() {
  const bands = [60, 250, 500, 1000, 4000, 8000];
  const [eq, setEq] = useState([40, 70, 55, 80, 45, 60]);
  return (
    <div>
      <DeckHeader title="6-Band EQ · Master Bus" hint="-6.2 dB" />
      <div className="px-4 flex items-end gap-2 h-28">
        {bands.map((b, i) => (
          <div key={b} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full h-20 bg-surface rounded border border-border relative overflow-hidden">
              <div
                className="absolute bottom-0 inset-x-0 bg-track-audio/70 transition-all"
                style={{ height: `${eq[i]}%` }}
              />
              <div className="absolute left-0 right-0 top-1/2 h-px bg-border-strong" />
              <input
                type="range"
                min={0}
                max={100}
                value={eq[i]}
                onChange={(e) => {
                  const next = [...eq];
                  next[i] = Number(e.target.value);
                  setEq(next);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
                style={{ writingMode: "vertical-lr" as any }}
              />
            </div>
            <span className="text-[8px] font-mono text-muted-foreground">{b >= 1000 ? `${b / 1000}k` : b}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 px-4 mt-2">
        <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
          <div className="h-full w-3/4 bg-gradient-to-r from-ok via-accent to-rec" />
        </div>
        <span className="text-[9px] font-mono text-muted-foreground tabular">L -3.2 · R -4.1</span>
      </div>
    </div>
  );
}

function AiDeck() {
  const [running, setRunning] = useState<string | null>(null);
  return (
    <div className="px-4 pt-3 pb-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold">On-Device Intelligence</h3>
        <span className="text-[9px] font-mono text-ok flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-ok animate-pulse" /> NNAPI · Hexagon
        </span>
      </div>

      <button
        onClick={() => setRunning("whisper")}
        className="w-full flex items-center justify-between rounded-md bg-foreground text-background px-3 h-10 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-2">
          <Captions className="size-4" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[11px] font-bold">
              {running === "whisper" ? "Transcribing…" : "Run Whisper Transcription"}
            </span>
            <span className="text-[9px] opacity-70">Tiny · 39M params · local</span>
          </div>
        </div>
        <Play className="size-3.5" />
      </button>

      <div className="grid grid-cols-2 gap-2">
        <AiCard icon={<Mic className="size-3.5" />} title="Kokoro TTS" sub="Voice: Bella v1.2" dot="ok" />
        <AiCard icon={<Music2 className="size-3.5" />} title="MusicGen" sub="Ambient · 0:42" dot="audio" />
        <AiCard icon={<Sparkles className="size-3.5" />} title="Scene Detect" sub="14 cuts found" dot="fx" />
        <AiCard icon={<Layers className="size-3.5" />} title="Auto Captions" sub="VLM · 1 fps" dot="accent" />
      </div>
    </div>
  );
}

function AiCard({
  icon, title, sub, dot,
}: { icon: React.ReactNode; title: string; sub: string; dot: "ok" | "audio" | "fx" | "accent" }) {
  const dotClass = {
    ok: "bg-ok", audio: "bg-track-audio", fx: "bg-track-fx", accent: "bg-accent",
  }[dot];
  return (
    <button className="p-2.5 rounded-md bg-surface border border-border flex flex-col gap-1.5 text-left active:bg-panel-elevated">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{icon}</span>
        <span className={`size-1.5 rounded-full ${dotClass}`} />
      </div>
      <div className="leading-tight">
        <div className="text-[10.5px] font-semibold">{title}</div>
        <div className="text-[9px] text-muted-foreground font-mono">{sub}</div>
      </div>
    </button>
  );
}

function ExportDeck() {
  const presets = ["Low", "Med", "High", "Ultra"];
  const [preset, setPreset] = useState(2);
  return (
    <div>
      <DeckHeader title="MediaCodec · Foreground Service" hint="SoC · OK" />
      <div className="px-4 grid grid-cols-4 gap-1.5">
        {presets.map((p, i) => (
          <button
            key={p}
            onClick={() => setPreset(i)}
            className={`h-9 rounded-md text-[10px] font-bold border transition-colors ${
              preset === i ? "bg-foreground text-background border-foreground" : "bg-surface border-border"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="px-4 mt-3 grid grid-cols-3 gap-2">
        <Stat label="Codec" value="H.265" />
        <Stat label="Format" value="MP4" />
        <Stat label="Audio" value="AAC" />
      </div>
      <div className="px-4 mt-3">
        <div className="h-1.5 rounded-full bg-surface overflow-hidden">
          <div className="h-full w-1/3 bg-accent" />
        </div>
        <div className="flex justify-between mt-1.5 text-[9px] font-mono text-muted-foreground">
          <span>RENDERING · 34%</span>
          <span>ETA 02:11</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface border border-border px-2.5 py-1.5">
      <div className="text-[8.5px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-[11px] font-mono font-semibold text-foreground tabular">{value}</div>
    </div>
  );
}

function EditorBottomNav() {
  const items = [
    { icon: Folder, label: "PROJECTS", to: "/" as const },
    { icon: Film, label: "MEDIA" },
    { icon: Layers, label: "EDIT", active: true },
    { icon: Sparkles, label: "EFFECTS" },
    { icon: Settings, label: "SETTINGS" },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 max-w-md mx-auto grid grid-cols-5 h-14 bg-background/95 backdrop-blur border-t border-border z-40 pb-[env(safe-area-inset-bottom)]">
      {items.map(({ icon: Icon, label, active, to }) =>
        to ? (
          <Link
            key={label}
            to={to}
            className={`flex flex-col items-center justify-center gap-1 ${
              active ? "text-foreground" : "text-muted-foreground/70"
            }`}
          >
            <Icon className="size-4" />
            <span className="text-[8px] font-bold tracking-tighter">{label}</span>
          </Link>
        ) : (
          <button
            key={label}
            className={`flex flex-col items-center justify-center gap-1 ${
              active ? "text-foreground" : "text-muted-foreground/70"
            }`}
          >
            <Icon className="size-4" />
            <span className="text-[8px] font-bold tracking-tighter">{label}</span>
          </button>
        ),
      )}
    </nav>
  );
}
