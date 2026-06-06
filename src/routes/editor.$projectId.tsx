import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import previewFrame from "@/assets/preview-frame.jpg";
import {
  Play, Pause, SkipBack, SkipForward, Scissors, ChevronLeft, ChevronDown,
  X, ArrowLeft, Type, AudioLines, Sliders, Download, Lock, Eye, Volume2,
  Maximize2, Minimize2, Mic, Send, Sparkles, Gauge, PenTool,
  Captions, FileVideo, Palette, Image as ImageIcon, Wand, ChevronUp,
  Activity, GitBranch, Layers, ArrowLeftRight, Diamond, Hand,
  Rewind, Snowflake, Shuffle, Copy, Trash2, AudioWaveform, Frame,
  Square, Circle as CircleIcon, AlignLeft, AlignCenter, AlignRight,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/editor/$projectId")({
  head: () => ({
    meta: [
      { title: "MotScri — Editor" },
      { name: "description", content: "Mobile NLE workspace." },
    ],
  }),
  component: EditorPage,
});

/* ──────────────────────────────────────────────────────────────────────────
   Adaptive toolset registry.
   Categories surface in the default tool-strip. Each category exposes a
   short list of tools. A tool either toggles a cursor mode on the timeline,
   or opens a dedicated visual interface that takes over Z4+Z5. This is a
   representative set, intentionally non-exhaustive so new tools can be
   appended without touching the deck logic.
   ────────────────────────────────────────────────────────────────────────── */

type CursorMode = "select" | "split" | "text" | "trim" | "hand";
type InterfaceId =
  | "agent"
  | "parametric-eq"
  | "keyframes"
  | "color-curves"
  | "speed-curve"
  | "mask-pen"
  | "text-properties"
  | "split-precision"
  | "speed-constant"
  | "reverse"
  | "freeze"
  | "transition"
  | "duplicate-delete"
  | "extract-audio"
  | "vo"
  | "captions"
  | "canvas"
  | "mask-precision";

type Tool =
  | { id: string; label: string; icon: LucideIcon; kind: "cursor"; cursor: CursorMode }
  | { id: string; label: string; icon: LucideIcon; kind: "interface"; interfaceId: InterfaceId }
  | { id: string; label: string; icon: LucideIcon; kind: "action" };

type Category = { id: string; label: string; icon: LucideIcon; tools: Tool[] };

const CATEGORIES: Category[] = [
  {
    id: "edit", label: "Edit", icon: Scissors,
    tools: [
      { id: "split", label: "Split", icon: Scissors, kind: "interface", interfaceId: "split-precision" },
      { id: "trim", label: "Trim", icon: ArrowLeftRight, kind: "cursor", cursor: "trim" },
      { id: "hand", label: "Hand", icon: Hand, kind: "cursor", cursor: "hand" },
      { id: "speed-c", label: "Speed", icon: Gauge, kind: "interface", interfaceId: "speed-constant" },
      { id: "speed", label: "Speed Curve", icon: Activity, kind: "interface", interfaceId: "speed-curve" },
      { id: "reverse", label: "Reverse", icon: Rewind, kind: "interface", interfaceId: "reverse" },
      { id: "freeze", label: "Freeze", icon: Snowflake, kind: "interface", interfaceId: "freeze" },
      { id: "transition", label: "Transition", icon: Shuffle, kind: "interface", interfaceId: "transition" },
      { id: "dupdel", label: "Duplicate / Delete", icon: Copy, kind: "interface", interfaceId: "duplicate-delete" },
      { id: "keyframes", label: "Keyframes", icon: Diamond, kind: "interface", interfaceId: "keyframes" },
    ],
  },
  {
    id: "audio", label: "Audio", icon: AudioLines,
    tools: [
      { id: "eq", label: "Parametric EQ", icon: Activity, kind: "interface", interfaceId: "parametric-eq" },
      { id: "extract", label: "Extract Audio", icon: AudioWaveform, kind: "interface", interfaceId: "extract-audio" },
      { id: "vo", label: "VO Record", icon: Mic, kind: "interface", interfaceId: "vo" },
      { id: "denoise", label: "DeNoise", icon: Wand, kind: "action" },
    ],
  },
  {
    id: "color", label: "Color", icon: Palette,
    tools: [
      { id: "curves", label: "Curves", icon: GitBranch, kind: "interface", interfaceId: "color-curves" },
      { id: "luts", label: "LUTs", icon: Layers, kind: "action" },
      { id: "canvas", label: "Canvas", icon: Frame, kind: "interface", interfaceId: "canvas" },
    ],
  },
  {
    id: "text", label: "Text", icon: Type,
    tools: [
      { id: "add-text", label: "Add Text", icon: Type, kind: "cursor", cursor: "text" },
      { id: "text-props", label: "Text Properties", icon: Sliders, kind: "interface", interfaceId: "text-properties" },
      { id: "captions", label: "Auto Captions", icon: Captions, kind: "interface", interfaceId: "captions" },
    ],
  },
  {
    id: "effects", label: "Effects", icon: Sparkles,
    tools: [
      { id: "mask-pen", label: "Mask Pen", icon: PenTool, kind: "interface", interfaceId: "mask-pen" },
      { id: "mask-prec", label: "Precision Mask", icon: CircleIcon, kind: "interface", interfaceId: "mask-precision" },
      { id: "blend", label: "Blend", icon: Layers, kind: "action" },
    ],
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   Deck state — drives Z5 (and Z4 merging for interface tools).
   ────────────────────────────────────────────────────────────────────────── */

type DeckState =
  | { kind: "default" }
  | { kind: "category"; categoryId: string }
  | { kind: "inspector"; clipId: string }
  | { kind: "interface"; interfaceId: InterfaceId; fromCategory?: string };

function EditorPage() {
  const { projectId } = useParams({ from: "/editor/$projectId" });
  const isNew = projectId === "new";

  const [name, setName] = useState(isNew ? "Untitled · 001" : projectId.replace(/-/g, " · "));
  const [aspect, setAspect] = useState("16:9");
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(isNew ? 0 : 252);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [cursor, setCursor] = useState<CursorMode>("select");
  const [deck, setDeck] = useState<DeckState>({ kind: "default" });
  const [fullscreen, setFullscreen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [agentBackground, setAgentBackground] = useState(false);

  // Tapping a clip surfaces inspector unless an interface owns the screen.
  const handleSelectClip = (id: string | null) => {
    setSelectedClip(id);
    if (id && deck.kind !== "interface") setDeck({ kind: "inspector", clipId: id });
    if (!id && deck.kind === "inspector") setDeck({ kind: "default" });
  };

  // Return button target — context aware.
  const onReturn = () => {
    if (cursor !== "select") setCursor("select");
    if (deck.kind === "interface" && deck.fromCategory) {
      setDeck({ kind: "category", categoryId: deck.fromCategory });
    } else if (deck.kind === "inspector") {
      setSelectedClip(null);
      setDeck({ kind: "default" });
    } else {
      setDeck({ kind: "default" });
    }
  };

  const inInterface = deck.kind === "interface";

  return (
    <div className="relative flex flex-col h-[100dvh] w-full max-w-md mx-auto overflow-hidden text-foreground">
      <Zone1Header
        name={name}
        setName={setName}
        aspect={aspect}
        setAspect={setAspect}
        onExport={() => setExportOpen(true)}
      />

      {/* Z2 viewport hidden when fullscreen or when an interface owns the canvas */}
      {!fullscreen && !inInterface && (
        <Zone2Viewport
          playing={playing}
          aspect={aspect}
          time={time}
          onToggleFullscreen={() => setFullscreen(true)}
        />
      )}

      {/* Transport (Z3) — always visible */}
      <Transport
        playing={playing}
        onToggle={() => setPlaying((p) => !p)}
        time={time}
        onSeek={setTime}
        fullscreen={fullscreen}
        onExitFullscreen={() => setFullscreen(false)}
        isNew={isNew}
      />

      <div className="flex-1 min-h-0 flex flex-col">
        {/* Z4 timeline — hidden when an interface owns the canvas */}
        {!inInterface && (
          <TimelineBlock
            time={time}
            selected={selectedClip}
            onSelect={handleSelectClip}
            cursor={cursor}
            isNew={isNew}
          />
        )}

        {/* Z5 (or merged Z4+Z5 when interface) */}
        <Zone5
          deck={deck}
          setDeck={setDeck}
          cursor={cursor}
          setCursor={setCursor}
          onReturn={onReturn}
          isNew={isNew}
          agentBackground={agentBackground}
          setAgentBackground={setAgentBackground}
          fullscreen={fullscreen}
        />
      </div>

      {exportOpen && <ExportTerminal onClose={() => setExportOpen(false)} />}
    </div>
  );
}

/* ──────────────────────── ZONE 1 — header ──────────────────────── */

function Zone1Header({
  name, setName, aspect, setAspect, onExport,
}: {
  name: string; setName: (s: string) => void;
  aspect: string; setAspect: (s: string) => void;
  onExport: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const aspects = ["16:9", "9:16", "1:1", "4:5", "21:9"];

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  return (
    <header className="relative z-30 px-3 pt-3 pb-2 shrink-0">
      <div className="glass-strong rounded-2xl h-12 px-2 flex items-center justify-between gap-2">
        <Link
          to="/projects"
          className="size-9 grid place-items-center rounded-xl text-primary active:bg-primary/5"
        >
          <ChevronLeft className="size-4" />
        </Link>

        <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
          <button
            onClick={() => setOpen((o) => !o)}
            className="h-7 px-2.5 rounded-full bg-primary text-on-primary text-[10px] font-mono font-semibold flex items-center gap-1.5 shrink-0"
          >
            {aspect}
            <ChevronDown className="size-3" />
          </button>
          <div className="leading-tight text-center min-w-0 flex-1">
            {editing ? (
              <input
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setEditing(false)}
                onKeyDown={(e) => { if (e.key === "Enter") setEditing(false); }}
                className="w-full text-center bg-transparent outline-none font-display text-[12px] font-semibold text-primary border-b border-lime"
              />
            ) : (
              <button onClick={() => setEditing(true)} className="w-full">
                <div className="font-display text-[12px] font-semibold text-primary truncate capitalize">
                  {name}
                </div>
                <div className="text-[8.5px] font-mono text-on-surface-variant uppercase tracking-wider flex items-center justify-center gap-1">
                  <span className="size-1 rounded-full bg-lime" /> tap to rename
                </div>
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onExport}
          className="h-9 px-3.5 rounded-xl bg-primary text-on-primary text-[10.5px] font-mono font-semibold tracking-wider flex items-center gap-1.5 shadow-[var(--shadow-glass)]"
        >
          <Download className="size-3.5" /> EXPORT
        </button>
      </div>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[58px] glass-strong rounded-2xl p-2 grid grid-cols-5 gap-1 z-40">
          {aspects.map((a) => (
            <button
              key={a}
              onClick={() => { setAspect(a); setOpen(false); }}
              className={`h-8 w-12 rounded-lg text-[10px] font-mono font-semibold ${
                a === aspect ? "bg-primary text-on-primary" : "text-primary hover:bg-primary/5"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

/* ──────────────────────── ZONE 2 — viewport ──────────────────────── */

function Zone2Viewport({
  playing, aspect, time, onToggleFullscreen,
}: { playing: boolean; aspect: string; time: number; onToggleFullscreen: () => void }) {
  const ratio = aspectRatio(aspect);
  return (
    <section className="px-3 shrink-0">
      <div className="relative glass-strong rounded-2xl p-2 mx-auto overflow-hidden" style={{ maxHeight: "38dvh" }}>
        <div
          className="relative w-full max-h-full rounded-xl overflow-hidden bg-primary mx-auto"
          style={{ aspectRatio: ratio, maxHeight: "calc(38dvh - 16px)" }}
        >
          <img src={previewFrame} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/30" />
          <div className="absolute inset-5 border border-lime/60 rounded-md pointer-events-none">
            {[
              "top-0 left-0 -translate-x-1 -translate-y-1",
              "top-0 right-0 translate-x-1 -translate-y-1",
              "bottom-0 left-0 -translate-x-1 translate-y-1",
              "bottom-0 right-0 translate-x-1 translate-y-1",
            ].map((c) => (
              <div key={c} className={`absolute ${c} size-2 rounded-sm bg-lime shadow-[var(--shadow-lime)]`} />
            ))}
          </div>
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="glass-dark rounded-full px-2.5 py-1 font-mono text-[9.5px] text-lime tabular">
              {fmt(time)}
            </span>
            {playing && (
              <span className="glass-dark rounded-full px-2 py-1 font-mono text-[9px] text-lime flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-lime animate-pulse" /> LIVE
              </span>
            )}
          </div>
          <button
            onClick={onToggleFullscreen}
            className="absolute top-3 right-3 size-8 rounded-full glass-dark text-lime grid place-items-center active:scale-95 transition-transform"
            aria-label="Expand timeline"
          >
            <Maximize2 className="size-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function aspectRatio(a: string) {
  const [w, h] = a.split(":").map(Number);
  return `${w} / ${h}`;
}

/* ──────────────────────── Transport ──────────────────────── */

function Transport({
  playing, onToggle, time, onSeek, fullscreen, onExitFullscreen, isNew,
}: {
  playing: boolean; onToggle: () => void; time: number; onSeek: (n: number) => void;
  fullscreen: boolean; onExitFullscreen: () => void; isNew: boolean;
}) {
  const total = isNew ? 1 : 417;
  return (
    <div className="px-3 pt-1.5 shrink-0">
      <div className="glass rounded-2xl h-11 px-3 flex items-center gap-2.5">
        <button onClick={() => onSeek(Math.max(0, time - 5))} className="size-7 grid place-items-center rounded-full text-primary active:bg-primary/5">
          <SkipBack className="size-3.5" />
        </button>
        <button
          onClick={onToggle}
          className="size-9 rounded-full bg-primary text-on-primary grid place-items-center shadow-[var(--shadow-glass-lg)] active:scale-95 transition-transform"
        >
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5 translate-x-0.5" />}
        </button>
        <button onClick={() => onSeek(Math.min(total, time + 5))} className="size-7 grid place-items-center rounded-full text-primary active:bg-primary/5">
          <SkipForward className="size-3.5" />
        </button>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="flex-1 relative h-1.5 rounded-full bg-surface-container overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-primary rounded-full" style={{ width: `${(time / total) * 100}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 size-3 rounded-full bg-lime border-2 border-primary shadow-[var(--shadow-lime)]" style={{ left: `calc(${(time / total) * 100}% - 6px)` }} />
          </div>
          <span className="font-mono text-[9.5px] text-primary tabular shrink-0">{fmt(time)}</span>
        </div>
        <button
          onClick={fullscreen ? onExitFullscreen : undefined}
          className="size-7 grid place-items-center rounded-full text-primary active:bg-primary/5"
          aria-label="Toggle viewport"
        >
          {fullscreen ? <Minimize2 className="size-3.5" /> : <ChevronUp className="size-3.5 opacity-40" />}
        </button>
      </div>
    </div>
  );
}

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  const f = Math.floor((s % 1) * 24).toString().padStart(2, "0");
  return `${m}:${sec}:${f}`;
}

/* ──────────────────────── ZONE 4 — timeline (flat, edge-to-edge) ──────────────────────── */

function TimelineBlock({
  time, selected, onSelect, cursor, isNew,
}: {
  time: number; selected: string | null; onSelect: (id: string | null) => void;
  cursor: CursorMode; isNew: boolean;
}) {
  const total = isNew ? 1 : 417;
  const pct = (time / total) * 100;

  return (
    <div className="shrink-0 mt-2 relative">
      <div className="relative h-6 bg-surface-low border-y border-outline-variant/40 overflow-hidden">
        <div className="absolute inset-0 flex items-end px-3 pb-1">
          {Array.from({ length: 24 }).map((_, i) => {
            const major = i % 4 === 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-start justify-end gap-0.5">
                {major && (
                  <span className="font-mono text-[7.5px] text-primary/60 tabular leading-none">
                    {String(i).padStart(2, "0")}s
                  </span>
                )}
                <div className="w-px bg-primary/50" style={{ height: major ? "8px" : "4px" }} />
              </div>
            );
          })}
        </div>
        {!isNew && (
          <div className="absolute top-0 bottom-0 z-10" style={{ left: `${pct}%` }}>
            <div className="absolute -top-px -left-1.5 size-3 rotate-45 bg-lime shadow-[var(--shadow-lime)]" />
          </div>
        )}
      </div>

      <div className="relative bg-surface-container/40 border-b border-outline-variant/40">
        {isNew ? (
          <EmptyTimeline />
        ) : (
          <div className="relative overflow-x-auto overflow-y-hidden no-scrollbar">
            <div style={{ minWidth: "780px" }} className="py-2 pl-3 pr-3 space-y-1.5">
              <TrackRow label="V2" kind="video">
                <Clip id="v2-1" w={160} label="TITLE · Kinetic" selected={selected === "v2-1"} onSelect={onSelect} />
              </TrackRow>
              <TrackRow label="V1" kind="video" primary>
                <FilmstripClip id="v1-1" w={180} label="MVI_0921" hue={0} selected={selected === "v1-1"} onSelect={onSelect} />
                <FilmstripClip id="v1-2" w={240} label="MVI_0922" hue={20} selected={selected === "v1-2"} onSelect={onSelect} />
                <FilmstripClip id="v1-3" w={140} label="MVI_0923" hue={200} selected={selected === "v1-3"} onSelect={onSelect} />
              </TrackRow>
              <TrackRow label="A1" kind="audio">
                <WaveClip id="a1-1" w={340} label="DIALOG.wav" selected={selected === "a1-1"} onSelect={onSelect} />
                <WaveClip id="a1-2" w={180} label="ROOM_TONE.wav" dim selected={selected === "a1-2"} onSelect={onSelect} />
              </TrackRow>
              <TrackRow label="A2" kind="audio" hasVO>
                <WaveClip id="a2-1" w={500} label="MUSICGEN_v3.wav" tone="lime" selected={selected === "a2-1"} onSelect={onSelect} />
              </TrackRow>
            </div>
            <div className="absolute top-0 bottom-0 w-px bg-lime pointer-events-none z-10" style={{ left: "calc(12px + (768px * 0.6))" }} />
          </div>
        )}

        {cursor !== "select" && (
          <div className="absolute top-1.5 right-2 px-2 py-1 rounded-full bg-lime text-primary text-[8.5px] font-mono font-semibold uppercase tracking-wider z-20">
            {cursor} mode
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyTimeline() {
  return (
    <div className="px-4 py-8 text-center">
      <div className="size-12 rounded-2xl bg-surface-container mx-auto grid place-items-center text-primary/60">
        <FileVideo className="size-5" />
      </div>
      <div className="mt-3 font-display text-[12px] font-semibold text-primary">Empty sequence</div>
      <div className="text-[10px] font-mono text-on-surface-variant mt-1">
        Ingest media from the Library to start
      </div>
    </div>
  );
}

function TrackRow({
  label, kind, primary, hasVO, children,
}: { label: string; kind: "video" | "audio"; primary?: boolean; hasVO?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2 ${primary ? "h-14" : "h-10"}`}>
      <div className="sticky left-0 z-10 w-10 h-full flex flex-col items-start justify-center gap-1 pl-1 bg-gradient-to-r from-surface-container/90 to-transparent">
        <span className="font-mono text-[9px] font-bold text-primary tracking-wider">{label}</span>
        <div className="flex gap-1 text-primary/40 items-center">
          <Lock className="size-2.5" />
          {kind === "video" ? <Eye className="size-2.5" /> : <Volume2 className="size-2.5" />}
          {hasVO && (
            <button className="ml-0.5 size-3.5 rounded-full bg-error text-on-error grid place-items-center" aria-label="VO record">
              <Mic className="size-2" />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 h-full">{children}</div>
    </div>
  );
}

function Clip({ id, w, label, selected, onSelect }: { id: string; w: number; label: string; selected?: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      onClick={() => onSelect(id)}
      style={{ width: w }}
      className={`h-9 rounded-[12px] bg-primary text-on-primary flex items-center px-2.5 gap-1.5 shrink-0 transition-all ${selected ? "ring-2 ring-lime shadow-[var(--shadow-lime)]" : ""}`}
    >
      <Type className="size-3 text-lime" />
      <span className="text-[9.5px] font-mono font-medium truncate">{label}</span>
    </button>
  );
}

function FilmstripClip({ id, w, label, hue, selected, onSelect }: { id: string; w: number; label: string; hue: number; selected?: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      onClick={() => onSelect(id)}
      style={{ width: w }}
      className={`h-12 rounded-[12px] relative overflow-hidden shrink-0 transition-all ${selected ? "ring-2 ring-lime shadow-[var(--shadow-lime)]" : "ring-1 ring-primary/20"}`}
    >
      <div className="absolute inset-0" style={{ backgroundImage: `url(${previewFrame})`, backgroundSize: "cover", backgroundPosition: `${hue}% center`, filter: `hue-rotate(${hue}deg) saturate(0.9)` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
      <span className="absolute bottom-1 left-1.5 text-[8.5px] font-mono font-medium text-white">{label}</span>
    </button>
  );
}

function WaveClip({ id, w, label, dim, tone = "audio", selected, onSelect }: { id: string; w: number; label: string; dim?: boolean; tone?: "audio" | "lime"; selected?: boolean; onSelect: (id: string) => void }) {
  const bars = Array.from({ length: Math.floor(w / 4) }, (_, i) => 3 + Math.abs(Math.sin(i * 0.55) + Math.cos(i * 0.21)) * 7);
  const bg = tone === "lime" ? "bg-lime-soft" : "bg-tertiary-container";
  const bar = tone === "lime" ? "bg-secondary" : "bg-primary/70";
  return (
    <button
      onClick={() => onSelect(id)}
      style={{ width: w }}
      className={`h-9 rounded-[12px] ${bg} relative overflow-hidden shrink-0 transition-all ${dim ? "opacity-60" : ""} ${selected ? "ring-2 ring-lime shadow-[var(--shadow-lime)]" : "ring-1 ring-primary/15"}`}
    >
      <div className="absolute inset-x-1.5 inset-y-1.5 flex items-center gap-[1px]">
        {bars.map((h, i) => (
          <div key={i} className={`flex-1 ${bar} rounded-[1px]`} style={{ height: `${h * 9}%` }} />
        ))}
      </div>
      <span className="absolute bottom-0.5 left-1.5 text-[8px] font-mono text-primary/80">{label}</span>
    </button>
  );
}

/* ──────────────────────── ZONE 5 — adaptive deck ──────────────────────── */

function Zone5({
  deck, setDeck, cursor, setCursor, onReturn, isNew, agentBackground, setAgentBackground, fullscreen,
}: {
  deck: DeckState; setDeck: (d: DeckState) => void;
  cursor: CursorMode; setCursor: (c: CursorMode) => void;
  onReturn: () => void;
  isNew: boolean;
  agentBackground: boolean; setAgentBackground: (b: boolean) => void;
  fullscreen: boolean;
}) {
  const isDefault = deck.kind === "default";
  const isInterface = deck.kind === "interface";

  const openTool = (categoryId: string, tool: Tool) => {
    if (tool.kind === "cursor") {
      setCursor(tool.cursor);
      setDeck({ kind: "default" });
    } else if (tool.kind === "interface") {
      setDeck({ kind: "interface", interfaceId: tool.interfaceId, fromCategory: categoryId });
    }
  };

  return (
    <section className={`px-3 pb-3 pt-1 ${isInterface || fullscreen ? "flex-1 min-h-0" : ""}`}>
      <div className={`glass-strong rounded-3xl overflow-hidden flex flex-col ${isInterface || fullscreen ? "h-full" : ""}`}>
        {/* Default state — AI starter + category strip */}
        {isDefault && (
          <DefaultDeck
            onOpenAgent={() => { setAgentBackground(false); setDeck({ kind: "interface", interfaceId: "agent" }); }}
            onOpenCategory={(id) => setDeck({ kind: "category", categoryId: id })}
            agentBackground={agentBackground}
            isNew={isNew}
          />
        )}

        {deck.kind === "category" && (
          <CategoryDeck
            category={CATEGORIES.find((c) => c.id === deck.categoryId)!}
            onReturn={onReturn}
            onPickTool={(t) => openTool(deck.categoryId, t)}
          />
        )}

        {deck.kind === "inspector" && (
          <InspectorDeck clipId={deck.clipId} onReturn={onReturn} />
        )}

        {isInterface && (
          <InterfaceCanvas
            id={deck.interfaceId}
            onReturn={onReturn}
            onMinimizeAgent={
              deck.interfaceId === "agent"
                ? () => { setAgentBackground(true); setDeck({ kind: "default" }); }
                : undefined
            }
          />
        )}
      </div>
    </section>
  );
}

/* ── Default deck: compact horizontal strip (height ≈ transport) ── */

function DefaultDeck({
  onOpenAgent, onOpenCategory, agentBackground, isNew,
}: {
  onOpenAgent: () => void;
  onOpenCategory: (id: string) => void;
  agentBackground: boolean;
  isNew: boolean;
}) {
  return (
    <div className="px-2 py-1.5 flex items-center gap-1.5 h-12">
      <button
        onClick={onOpenAgent}
        className="shrink-0 h-9 px-2.5 rounded-full bg-primary text-on-primary flex items-center gap-1.5 active:scale-95 transition-transform"
      >
        <div className="size-5 rounded-full bg-lime grid place-items-center">
          <SparkIcon dark small />
        </div>
        <span className="text-[10px] font-mono font-semibold tracking-wider text-lime">AGENT</span>
        {agentBackground && (
          <span className="size-1.5 rounded-full bg-lime animate-pulse" />
        )}
      </button>
      <div className="w-px h-5 bg-outline-variant/50 shrink-0" />
      <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            disabled={isNew && c.id !== "edit"}
            onClick={() => onOpenCategory(c.id)}
            className="shrink-0 h-9 px-3 rounded-full glass text-primary flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-40"
          >
            <c.icon className="size-3.5" />
            <span className="text-[10px] font-semibold">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Category deck — linear horizontal scrollable tool strip ── */

function CategoryDeck({
  category, onReturn, onPickTool,
}: { category: Category; onReturn: () => void; onPickTool: (t: Tool) => void }) {
  return (
    <div className="px-2 py-1.5 flex items-center gap-1.5 h-12">
      <button
        onClick={onReturn}
        className="shrink-0 size-9 rounded-full bg-primary text-on-primary grid place-items-center active:scale-95"
        aria-label="Return"
      >
        <ArrowLeft className="size-3.5 text-lime" />
      </button>
      <div className="shrink-0 flex items-center gap-1.5 pr-1.5 border-r border-outline-variant/50 h-7">
        <category.icon className="size-3.5 text-primary" />
        <span className="text-[10px] font-mono font-semibold tracking-wider text-primary uppercase">
          {category.label}
        </span>
      </div>
      <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {category.tools.map((t) => (
          <button
            key={t.id}
            onClick={() => onPickTool(t)}
            className="shrink-0 h-9 px-3 rounded-full glass text-primary flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <t.icon className="size-3.5" />
            <span className="text-[10px] font-semibold whitespace-nowrap">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Inspector deck — clip property drawer ── */

function InspectorDeck({ clipId, onReturn }: { clipId: string; onReturn: () => void }) {
  const isAudio = clipId.startsWith("a");
  const [tab, setTab] = useState<"color" | "audio" | "spatial">(isAudio ? "audio" : "color");
  const tabs = [
    { id: "color" as const, label: "Color", icon: Palette },
    { id: "audio" as const, label: "Audio", icon: AudioLines },
    { id: "spatial" as const, label: "Spatial", icon: Wand },
  ];

  return (
    <div className="p-3 space-y-3">
      <DeckHeader
        onReturn={onReturn}
        icon={Sliders}
        title={clipId.toUpperCase()}
        subtitle="inspector"
        rightSlot={
          <button className="h-7 px-2.5 rounded-full glass text-[9px] font-mono font-semibold tracking-wider text-primary">
            RESET
          </button>
        }
      />
      <div className="flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
              tab === t.id ? "bg-primary text-on-primary" : "glass text-primary"
            }`}
          >
            <t.icon className="size-3.5" />
            <span className="text-[10px] font-semibold">{t.label}</span>
          </button>
        ))}
      </div>
      {tab === "color" && <ColorInspector />}
      {tab === "audio" && <AudioInspector />}
      {tab === "spatial" && <SpatialInspector />}
    </div>
  );
}

function ColorInspector() {
  return (
    <div className="space-y-3">
      <div>
        <Label>Filters (LUTs)</Label>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {["NONE", "K-12", "FILM 4K", "TEAL", "NOIR", "ORG", "DAYLIGHT"].map((l, i) => (
            <button key={l} className={`shrink-0 h-12 w-16 rounded-xl glass grid place-items-end p-1 ${i === 1 ? "ring-2 ring-lime" : ""}`}>
              <span className="text-[8.5px] font-mono font-semibold text-primary">{l}</span>
            </button>
          ))}
        </div>
      </div>
      <SliderRow label="Exposure" value="+0.4" v={64} onChange={() => {}} min={0} max={100} />
      <SliderRow label="Contrast" value="22" v={58} onChange={() => {}} min={0} max={100} />
      <SliderRow label="Saturation" value="-8" v={42} onChange={() => {}} min={0} max={100} />
    </div>
  );
}

function AudioInspector() {
  return (
    <div className="space-y-3">
      <SliderRow label="Volume" value="-3 dB" v={70} onChange={() => {}} min={0} max={100} />
      <SliderRow label="Fade in" value="120 ms" v={28} onChange={() => {}} min={0} max={100} />
      <SliderRow label="Fade out" value="240 ms" v={42} onChange={() => {}} min={0} max={100} />
      <div className="text-[9px] font-mono text-on-surface-variant px-1">
        For parametric shaping open Audio → Parametric EQ.
      </div>
    </div>
  );
}

function SpatialInspector() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1.5">
        {["Scale", "Pos X", "Pos Y", "Rotation", "Mirror", "Anchor"].map((l) => (
          <div key={l} className="glass rounded-xl p-2 text-center">
            <div className="text-[8.5px] font-mono uppercase tracking-wider text-on-surface-variant">{l}</div>
            <div className="font-display text-[12px] font-semibold text-primary tabular">100</div>
          </div>
        ))}
      </div>
      <div>
        <Label>Blend mode</Label>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {["Normal", "Multiply", "Screen", "Overlay", "Add"].map((b, i) => (
            <button key={b} className={`shrink-0 h-9 px-3 rounded-full text-[10px] font-mono font-semibold ${i === 0 ? "bg-primary text-on-primary" : "glass text-primary"}`}>
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[8.5px] font-mono uppercase tracking-wider text-on-surface-variant mb-1.5 px-0.5">
      {children}
    </div>
  );
}

/* ──────────────────────── Interface canvas (merged Z4+Z5) ──────────────────────── */

function InterfaceCanvas({
  id, onReturn, onMinimizeAgent,
}: { id: InterfaceId; onReturn: () => void; onMinimizeAgent?: () => void }) {
  const meta: Record<InterfaceId, { title: string; subtitle: string; icon: LucideIcon }> = {
    "agent": { title: "Intelligent Agent", subtitle: "conversational editing", icon: Sparkles },
    "parametric-eq": { title: "Parametric EQ", subtitle: "6-band shaping", icon: Activity },
    "keyframes": { title: "Keyframe Editor", subtitle: "animation curves", icon: Diamond },
    "color-curves": { title: "Color Curves", subtitle: "RGB · luma", icon: GitBranch },
    "speed-curve": { title: "Speed Curve", subtitle: "rate stretch", icon: Gauge },
    "mask-pen": { title: "Mask Pen", subtitle: "vector mask", icon: PenTool },
  };
  const m = meta[id];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 pt-3 pb-2 flex items-center justify-between border-b border-outline-variant/40">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-9 rounded-xl bg-primary text-on-primary grid place-items-center shrink-0">
            <m.icon className="size-4" />
          </div>
          <div className="leading-tight min-w-0">
            <div className="font-display text-[12px] font-semibold text-primary truncate">{m.title}</div>
            <div className="text-[8.5px] font-mono text-on-surface-variant uppercase tracking-wider truncate">{m.subtitle}</div>
          </div>
        </div>
        {onMinimizeAgent && (
          <button
            onClick={onMinimizeAgent}
            className="h-8 px-3 rounded-full glass text-primary text-[9px] font-mono font-semibold tracking-wider flex items-center gap-1.5"
          >
            <Minimize2 className="size-3" /> BACKGROUND
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-3">
        {id === "agent" && <AgentChat />}
        {id === "parametric-eq" && <ParametricEqStage />}
        {id === "keyframes" && <KeyframesStage />}
        {id === "color-curves" && <CurvesStage />}
        {id === "speed-curve" && <SpeedCurveStage />}
        {id === "mask-pen" && <MaskPenStage />}
      </div>

      {/* Return button — bottom-left "escapement" */}
      <div className="px-3 pb-3 pt-2 border-t border-outline-variant/40 flex items-center justify-between">
        <button
          onClick={onReturn}
          className="h-10 px-4 rounded-full bg-primary text-on-primary flex items-center gap-2 active:scale-95 transition-transform shadow-[var(--shadow-glass)]"
        >
          <ArrowLeft className="size-3.5 text-lime" />
          <span className="text-[10px] font-mono font-semibold tracking-wider">RETURN</span>
        </button>
        <span className="text-[8.5px] font-mono text-on-surface-variant uppercase tracking-wider">
          interface mode
        </span>
      </div>
    </div>
  );
}

/* ── Stage stubs — adaptive, conceptual surfaces (not exhaustive). ── */

function ParametricEqStage() {
  const bands = [60, 180, 500, "1k", "3k", "8k"];
  const [eq, setEq] = useState([42, 70, 55, 80, 45, 60]);
  return (
    <div className="space-y-4">
      <div className="relative h-40 rounded-2xl bg-surface-low/60 ring-1 ring-outline-variant/40 overflow-hidden">
        <svg viewBox="0 0 240 100" className="absolute inset-0 w-full h-full">
          <path
            d={`M 0 ${100 - eq[0]} ${eq.map((v, i) => `L ${(i + 1) * 34} ${100 - v}`).join(" ")} L 240 ${100 - eq[5]}`}
            fill="none" stroke="var(--secondary)" strokeWidth="2"
          />
          <path
            d={`M 0 ${100 - eq[0]} ${eq.map((v, i) => `L ${(i + 1) * 34} ${100 - v}`).join(" ")} L 240 100 L 0 100 Z`}
            fill="var(--lime)" opacity="0.25"
          />
        </svg>
        {eq.map((v, i) => (
          <div key={i} className="absolute size-3 rounded-full bg-lime border-2 border-primary -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${((i + 1) * 34 / 240) * 100}%`, top: `${100 - v}%` }} />
        ))}
      </div>
      <div className="flex items-end gap-2 h-32">
        {bands.map((b, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="relative w-full h-24 rounded-lg bg-surface-container overflow-hidden">
              <div className="absolute bottom-0 inset-x-0 bg-secondary transition-all" style={{ height: `${eq[i]}%` }} />
              <input type="range" min={0} max={100} value={eq[i]}
                onChange={(e) => { const n = [...eq]; n[i] = +e.target.value; setEq(n); }}
                className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <span className="text-[9px] font-mono text-on-surface-variant">{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KeyframesStage() {
  const keys = [12, 28, 55, 70, 88];
  const props = ["Opacity", "Scale", "Rotation"];
  return (
    <div className="space-y-3">
      {props.map((p, pi) => (
        <div key={p}>
          <div className="flex justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">{p}</span>
            <span className="text-[10px] font-mono text-primary tabular">{keys.length} keys</span>
          </div>
          <div className="relative h-12 rounded-xl bg-surface-low/60 ring-1 ring-outline-variant/40 overflow-hidden">
            <div className="absolute inset-x-3 top-1/2 h-px bg-primary/20" />
            {keys.map((k, i) => (
              <button key={i}
                className="absolute size-3 rounded-sm rotate-45 bg-lime border border-primary -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${k}%`, top: `${30 + ((pi + i) % 3) * 20}%` }} />
            ))}
          </div>
        </div>
      ))}
      <button className="w-full h-10 rounded-full bg-lime text-primary text-[10.5px] font-mono font-semibold tracking-wider">
        + ADD KEY AT PLAYHEAD
      </button>
    </div>
  );
}

function CurvesStage() {
  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full max-w-xs mx-auto rounded-2xl bg-surface-low/60 ring-1 ring-outline-variant/40 overflow-hidden">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 25} y1="0" x2={i * 25} y2="100" stroke="var(--outline-variant)" strokeWidth="0.3" />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 25} x2="100" y2={i * 25} stroke="var(--outline-variant)" strokeWidth="0.3" />
          ))}
          <path d="M 0 100 C 30 80, 70 20, 100 0" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
          {[[0, 100], [30, 80], [70, 20], [100, 0]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.2" fill="var(--lime)" stroke="var(--primary)" strokeWidth="0.6" />
          ))}
        </svg>
      </div>
      <div className="flex gap-1.5 justify-center">
        {["L", "R", "G", "B"].map((c, i) => (
          <button key={c} className={`size-9 rounded-full font-mono text-[10px] font-bold ${i === 0 ? "bg-primary text-on-primary" : "glass text-primary"}`}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

function SpeedCurveStage() {
  return (
    <div className="space-y-3">
      <div className="relative h-40 rounded-2xl bg-surface-low/60 ring-1 ring-outline-variant/40 overflow-hidden">
        <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full">
          <path d="M 0 50 Q 50 50, 80 20 T 200 80" fill="none" stroke="var(--secondary)" strokeWidth="2" />
          {[[0, 50], [80, 20], [140, 60], [200, 80]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="var(--lime)" stroke="var(--primary)" strokeWidth="1" />
          ))}
        </svg>
      </div>
      <SliderRow label="Master rate" value="1.4×" v={70} onChange={() => {}} min={0} max={100} />
      <SliderRow label="Ramp duration" value="0.6 s" v={30} onChange={() => {}} min={0} max={100} />
    </div>
  );
}

function MaskPenStage() {
  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden ring-1 ring-outline-variant/40">
        <img src={previewFrame} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <svg viewBox="0 0 100 56" className="absolute inset-0 w-full h-full">
          <path d="M 25 18 L 55 12 L 70 30 L 60 45 L 30 42 Z" fill="rgba(197,225,165,0.25)" stroke="var(--lime)" strokeWidth="0.6" strokeDasharray="2 1.5" />
          {[[25, 18], [55, 12], [70, 30], [60, 45], [30, 42]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.6" fill="var(--lime)" stroke="var(--primary)" strokeWidth="0.4" />
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {["Feather", "Invert", "Track"].map((l) => (
          <button key={l} className="h-10 rounded-xl glass text-primary text-[10px] font-mono font-semibold">{l}</button>
        ))}
      </div>
    </div>
  );
}

/* ── Agent chat (full interface) ── */

function AgentChat() {
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<{ role: "user" | "agent"; body: string; steps?: string[] }[]>([
    { role: "agent", body: "Ready. Describe an edit and I'll perform it on the active sequence." },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const send = () => {
    const v = text.trim();
    if (!v) return;
    setMsgs((m) => [
      ...m,
      { role: "user", body: v },
      {
        role: "agent",
        body: "Applied your request to the timeline.",
        steps: ["Resolved scope to V1 · 00:00 → 01:00", "Generated 3 cuts at silence markers", "Synced to A1 dialog onsets"],
      },
    ]);
    setText("");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-1">
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary text-on-primary px-3 py-2 text-[12px]">
                {m.body}
              </div>
            </div>
          ) : (
            <div key={i} className="max-w-[88%]">
              <div className="text-[12px] text-primary leading-snug">{m.body}</div>
              {m.steps && (
                <ul className="mt-1.5 space-y-1">
                  {m.steps.map((s, j) => (
                    <li key={j} className="flex items-start gap-2 text-[10.5px] font-mono text-on-surface-variant">
                      <span className="size-1 rounded-full bg-lime mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ),
        )}
      </div>

      <div className="mt-2 h-12 rounded-full bg-primary px-2 pl-3 flex items-center gap-2 ring-1 ring-lime/40">
        <SparkIcon />
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Describe an edit…"
          className="flex-1 bg-transparent outline-none text-[12px] text-lime placeholder:text-lime/40 min-w-0"
        />
        {text.trim() ? (
          <button onClick={send} className="size-9 rounded-full bg-lime text-primary grid place-items-center active:scale-95" aria-label="Send">
            <Send className="size-3.5" />
          </button>
        ) : (
          <button className="size-9 rounded-full bg-lime text-primary grid place-items-center" aria-label="Voice">
            <Mic className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────── Shared header for category / inspector ──────────────────────── */

function DeckHeader({
  onReturn, icon: Icon, title, subtitle, rightSlot,
}: { onReturn: () => void; icon: LucideIcon; title: string; subtitle: string; rightSlot?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onReturn}
          className="h-8 px-3 rounded-full bg-primary text-on-primary flex items-center gap-1.5 active:scale-95 shrink-0"
          aria-label="Return"
        >
          <ArrowLeft className="size-3 text-lime" />
          <span className="text-[9px] font-mono font-semibold tracking-wider">RETURN</span>
        </button>
        <div className="size-8 rounded-xl glass grid place-items-center text-primary shrink-0">
          <Icon className="size-3.5" />
        </div>
        <div className="leading-tight min-w-0">
          <div className="font-display text-[11.5px] font-semibold text-primary truncate">{title}</div>
          <div className="text-[8.5px] font-mono text-on-surface-variant uppercase tracking-wider truncate">{subtitle}</div>
        </div>
      </div>
      {rightSlot}
    </div>
  );
}

/* ──────────────────────── Icons + shared ──────────────────────── */

function SparkIcon({ dark }: { dark?: boolean }) {
  const c = dark ? "#00180d" : "#c5e1a5";
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none">
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <circle cx="12" cy="12" r="1.8" fill={c} />
    </svg>
  );
}

/* ──────────────────────── Export ──────────────────────── */

function ExportTerminal({ onClose }: { onClose: () => void }) {
  const [bitrate, setBitrate] = useState(48);
  const [scale, setScale] = useState(100);
  const presets = ["Low", "Med", "High", "Ultra"];
  const [preset, setPreset] = useState(2);
  const estSize = useMemo(() => Math.round((bitrate * 1.4 + scale * 0.3) * 1.2), [bitrate, scale]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button onClick={onClose} className="flex-1 bg-primary/20 backdrop-blur-sm" />
      <div className="glass-strong rounded-t-3xl p-5 h-[60%] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[9.5px] font-mono uppercase tracking-wider text-secondary">Export Terminal</div>
            <h2 className="font-display text-[20px] font-bold text-primary">Render to MediaCodec</h2>
          </div>
          <button onClick={onClose} className="size-10 rounded-full bg-primary text-on-primary grid place-items-center">
            <ChevronDown className="size-4" />
          </button>
        </div>
        <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant mb-2">Quality preset</div>
            <div className="grid grid-cols-4 gap-2">
              {presets.map((p, i) => (
                <button key={p} onClick={() => setPreset(i)}
                  className={`h-10 rounded-xl text-[10.5px] font-mono font-semibold tracking-wider transition-colors ${preset === i ? "bg-primary text-on-primary" : "glass text-primary"}`}>
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <SliderRow label="Bitrate" value={`${bitrate} Mbps`} v={bitrate} onChange={setBitrate} min={4} max={120} />
          <SliderRow label="Output scale" value={`${scale}%`} v={scale} onChange={setScale} min={25} max={100} />
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Codec" value="H.265" />
            <Stat label="Format" value="MP4" />
            <Stat label="Audio" value="AAC" />
          </div>
        </div>
        <div className="mt-4 glass rounded-2xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[9.5px] font-mono uppercase tracking-wider text-on-surface-variant">Estimated size</div>
            <div className="font-display text-[18px] font-bold text-primary tabular">{estSize} MB</div>
          </div>
          <button className="h-11 px-5 rounded-full bg-primary text-on-primary text-[11px] font-mono font-semibold tracking-wider flex items-center gap-2 shadow-[var(--shadow-glass-lg)]">
            <span className="size-2 rounded-full bg-lime shadow-[var(--shadow-lime)]" />
            START RENDER
          </button>
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label, value, v, onChange, min, max,
}: { label: string; value: string; v: number; onChange: (n: number) => void; min: number; max: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">{label}</span>
        <span className="text-[11px] font-mono font-semibold text-primary tabular">{value}</span>
      </div>
      <div className="relative h-8 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-surface-container">
          <div className="absolute inset-y-0 left-0 bg-primary rounded-full" style={{ width: `${((v - min) / (max - min)) * 100}%` }} />
        </div>
        <input type="range" min={min} max={max} value={v} onChange={(e) => onChange(+e.target.value)} className="absolute inset-0 w-full opacity-0 cursor-pointer" />
        <div className="absolute size-4 rounded-full bg-lime border-2 border-primary pointer-events-none shadow-[var(--shadow-lime)]" style={{ left: `calc(${((v - min) / (max - min)) * 100}% - 8px)` }} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-2.5 text-center">
      <div className="text-[9px] font-mono uppercase tracking-wider text-on-surface-variant">{label}</div>
      <div className="font-display text-[13px] font-bold text-primary mt-0.5">{value}</div>
    </div>
  );
}
