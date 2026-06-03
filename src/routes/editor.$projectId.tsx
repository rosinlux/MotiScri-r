import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import previewFrame from "@/assets/preview-frame.jpg";
import {
  Play, Pause, SkipBack, SkipForward, Scissors, Wand2, ChevronLeft, ChevronDown,
  X, ArrowLeft, Type, AudioLines, Sliders, Download, Lock, Eye, Volume2,
  Maximize2, Minimize2, Mic, Send, Sparkles, Gauge, PenTool, Plus,
  Captions, Trash2, Copy, Snowflake, Rewind, Link2, Square, FileVideo,
  Palette, Image as ImageIcon, Music2, Wand, ChevronUp,
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

type ToolMode = "select" | "split" | "text" | "speed" | "mask";
type Deck = "tools" | "inspector" | "ai" | "library";
type AgentMode = "text" | "voice";

function EditorPage() {
  const { projectId } = useParams({ from: "/editor/$projectId" });
  const isNew = projectId === "new";

  const [name, setName] = useState(isNew ? "Untitled · 001" : projectId.replace(/-/g, " · "));
  const [aspect, setAspect] = useState("16:9");
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(isNew ? 0 : 252);
  const [selectedClip, setSelectedClip] = useState<string | null>(isNew ? null : "v1-2");
  const [tool, setTool] = useState<ToolMode>("select");
  const [deck, setDeck] = useState<Deck>("tools");
  const [fullscreen, setFullscreen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="relative flex flex-col h-[100dvh] w-full max-w-md mx-auto overflow-hidden text-foreground">
      <Zone1Header
        name={name}
        setName={setName}
        aspect={aspect}
        setAspect={setAspect}
        onExport={() => setExportOpen(true)}
      />

      {/* Viewport — collapses when fullscreen */}
      {!fullscreen && (
        <Zone2Viewport
          playing={playing}
          aspect={aspect}
          time={time}
          onToggleFullscreen={() => setFullscreen(true)}
        />
      )}

      {/* Scrollable lower stack (timeline + deck) */}
      <div className="flex-1 min-h-0 flex flex-col">
        <Transport
          playing={playing}
          onToggle={() => setPlaying((p) => !p)}
          time={time}
          onSeek={setTime}
          fullscreen={fullscreen}
          onExitFullscreen={() => setFullscreen(false)}
          isNew={isNew}
        />

        {/* Timeline — OUTSIDE rounded card, flat edges so corners don't clip */}
        <TimelineBlock
          time={time}
          selected={selectedClip}
          onSelect={setSelectedClip}
          tool={tool}
          isNew={isNew}
        />

        {/* Deck */}
        <div className="relative shrink-0">
          <Zone5Deck
            deck={deck}
            setDeck={setDeck}
            tool={tool}
            setTool={setTool}
            selectedClip={selectedClip}
            onClearSelection={() => setSelectedClip(null)}
            isNew={isNew}
            fullscreen={fullscreen}
          />
          <AgentAnchor open={agentOpen} setOpen={setAgentOpen} />
        </div>
      </div>

      {exportOpen && <ExportTerminal onClose={() => setExportOpen(false)} />}
    </div>
  );
}

/* ──────────────────────── ZONE 1 — Editable header ──────────────────────── */

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

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

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

/* ──────────────────────── ZONE 2 — Viewport ──────────────────────── */

function Zone2Viewport({
  playing, aspect, time, onToggleFullscreen,
}: { playing: boolean; aspect: string; time: number; onToggleFullscreen: () => void }) {
  const ratio = aspectRatio(aspect);
  return (
    <section className="px-3 shrink-0">
      {/* Capped container so monitor scales DOWN when aspect changes (zones below stay) */}
      <div
        className="relative glass-strong rounded-2xl p-2 mx-auto overflow-hidden"
        style={{ maxHeight: "38dvh" }}
      >
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

          {/* Only timecode kept — H.265/NNAPI/aspect badges removed per spec */}
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

          {/* Fullscreen toggle */}
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
        <button
          onClick={() => onSeek(Math.max(0, time - 5))}
          className="size-7 grid place-items-center rounded-full text-primary active:bg-primary/5"
        >
          <SkipBack className="size-3.5" />
        </button>
        <button
          onClick={onToggle}
          className="size-9 rounded-full bg-primary text-on-primary grid place-items-center shadow-[var(--shadow-glass-lg)] active:scale-95 transition-transform"
        >
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5 translate-x-0.5" />}
        </button>
        <button
          onClick={() => onSeek(Math.min(total, time + 5))}
          className="size-7 grid place-items-center rounded-full text-primary active:bg-primary/5"
        >
          <SkipForward className="size-3.5" />
        </button>

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="flex-1 relative h-1.5 rounded-full bg-surface-container overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full"
              style={{ width: `${(time / total) * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 size-3 rounded-full bg-lime border-2 border-primary shadow-[var(--shadow-lime)]"
              style={{ left: `calc(${(time / total) * 100}% - 6px)` }}
            />
          </div>
          <span className="font-mono text-[9.5px] text-primary tabular shrink-0">{fmt(time)}</span>
        </div>

        {/* Fullscreen toggle on transport card */}
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

/* ──────────────────────── Timeline (OUTSIDE rounded card) ──────────────────────── */

function TimelineBlock({
  time, selected, onSelect, tool, isNew,
}: {
  time: number; selected: string | null; onSelect: (id: string | null) => void;
  tool: ToolMode; isNew: boolean;
}) {
  const total = isNew ? 1 : 417;
  const pct = (time / total) * 100;

  return (
    <div className="shrink-0 mt-2 relative">
      {/* Ruler — flat, full bleed */}
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

      {/* Tracks — flat, scroll x */}
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
                <TransitionDot />
                <FilmstripClip id="v1-2" w={240} label="MVI_0922" hue={20} selected={selected === "v1-2"} onSelect={onSelect} />
                <TransitionDot />
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
            <div
              className="absolute top-0 bottom-0 w-px bg-lime pointer-events-none z-10"
              style={{ left: "calc(12px + (768px * 0.6))" }}
            />
          </div>
        )}

        {/* Active tool chip */}
        {tool !== "select" && (
          <div className="absolute top-1.5 right-2 px-2 py-1 rounded-full bg-lime text-primary text-[8.5px] font-mono font-semibold uppercase tracking-wider z-20">
            {tool} mode
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

function TransitionDot() {
  return (
    <button
      className="self-center size-5 -mx-1 rounded-full bg-secondary text-on-secondary grid place-items-center z-10 active:scale-95"
      aria-label="Transition"
    >
      <Wand2 className="size-2.5" />
    </button>
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

function Clip({
  id, w, label, selected, onSelect,
}: { id: string; w: number; label: string; selected?: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      onClick={() => onSelect(id)}
      style={{ width: w }}
      className={`h-9 rounded-[12px] bg-primary text-on-primary flex items-center px-2.5 gap-1.5 shrink-0 transition-all ${
        selected ? "ring-2 ring-lime shadow-[var(--shadow-lime)]" : ""
      }`}
    >
      <Type className="size-3 text-lime" />
      <span className="text-[9.5px] font-mono font-medium truncate">{label}</span>
    </button>
  );
}

function FilmstripClip({
  id, w, label, hue, selected, onSelect,
}: { id: string; w: number; label: string; hue: number; selected?: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      onClick={() => onSelect(id)}
      style={{ width: w }}
      className={`h-12 rounded-[12px] relative overflow-hidden shrink-0 transition-all ${
        selected ? "ring-2 ring-lime shadow-[var(--shadow-lime)]" : "ring-1 ring-primary/20"
      }`}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${previewFrame})`,
          backgroundSize: "cover",
          backgroundPosition: `${hue}% center`,
          filter: `hue-rotate(${hue}deg) saturate(0.9)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
      <span className="absolute bottom-1 left-1.5 text-[8.5px] font-mono font-medium text-white">{label}</span>
    </button>
  );
}

function WaveClip({
  id, w, label, dim, tone = "audio", selected, onSelect,
}: { id: string; w: number; label: string; dim?: boolean; tone?: "audio" | "lime"; selected?: boolean; onSelect: (id: string) => void }) {
  const bars = Array.from({ length: Math.floor(w / 4) }, (_, i) =>
    3 + Math.abs(Math.sin(i * 0.55) + Math.cos(i * 0.21)) * 7,
  );
  const bg = tone === "lime" ? "bg-lime-soft" : "bg-tertiary-container";
  const bar = tone === "lime" ? "bg-secondary" : "bg-primary/70";
  return (
    <button
      onClick={() => onSelect(id)}
      style={{ width: w }}
      className={`h-9 rounded-[12px] ${bg} relative overflow-hidden shrink-0 transition-all ${
        dim ? "opacity-60" : ""
      } ${selected ? "ring-2 ring-lime shadow-[var(--shadow-lime)]" : "ring-1 ring-primary/15"}`}
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

/* ──────────────────────── ZONE 5 — Deck ────────────────────────
   Restructured per spec:
   - Tools panel: active cursor modes (Split / Text / Speed / Mask)
   - Inspector: per-clip properties (color / audio / spatial)
   - Library: media + transitions + stickers
   - AI: models + captions
   ──────────────────────────────────────────────────────────────── */

const DECK_TABS: { id: Deck; label: string; icon: typeof Sliders }[] = [
  { id: "tools", label: "Tools", icon: PenTool },
  { id: "inspector", label: "Inspect", icon: Sliders },
  { id: "library", label: "Library", icon: ImageIcon },
  { id: "ai", label: "AI", icon: Sparkles },
];

function Zone5Deck({
  deck, setDeck, tool, setTool, selectedClip, onClearSelection, isNew, fullscreen,
}: {
  deck: Deck; setDeck: (d: Deck) => void;
  tool: ToolMode; setTool: (t: ToolMode) => void;
  selectedClip: string | null; onClearSelection: () => void;
  isNew: boolean; fullscreen: boolean;
}) {
  // Inspector requires a selected clip — fall back to tools when none
  const effective: Deck = deck === "inspector" && !selectedClip ? "tools" : deck;
  return (
    <section className={`px-3 pb-3 pt-1 ${fullscreen ? "flex-1 min-h-0" : ""}`}>
      <div className={`glass-strong rounded-3xl overflow-hidden ${fullscreen ? "h-full flex flex-col" : ""}`}>
        {/* Tab bar */}
        <div className="flex items-center justify-between px-3 pt-3">
          <div className="flex items-center gap-2 min-w-0">
            {(() => {
              const isDefault = effective === "tools" && tool === "select" && !selectedClip;
              if (isDefault) return null;
              return (
                <button
                  onClick={() => {
                    if (tool !== "select") setTool("select");
                    if (selectedClip) onClearSelection();
                    if (effective !== "tools") setDeck("tools");
                  }}
                  className="h-8 px-3 rounded-full bg-primary text-on-primary flex items-center gap-1.5 shadow-[var(--shadow-glass)] active:scale-95 shrink-0"
                  aria-label="Return"
                >
                  <ArrowLeft className="size-3 text-lime" />
                  <span className="text-[9px] font-mono font-semibold tracking-wider">RETURN</span>
                </button>
              );
            })()}
            <div className="leading-tight min-w-0">
              <div className="font-display text-[11.5px] font-semibold text-primary capitalize truncate">
                {effective}
              </div>
              <div className="text-[8.5px] font-mono text-on-surface-variant uppercase tracking-wider truncate">
                {tool !== "select" ? `${tool} mode` : selectedClip ?? (isNew ? "empty sequence" : "no selection")}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {DECK_TABS.map((t) => {
              const disabled = t.id === "inspector" && !selectedClip;
              return (
                <button
                  key={t.id}
                  onClick={() => !disabled && setDeck(t.id)}
                  className={`size-9 rounded-xl grid place-items-center transition-colors ${
                    effective === t.id ? "bg-primary text-on-primary" : "text-primary/70"
                  } ${disabled ? "opacity-30" : ""}`}
                  aria-label={t.label}
                >
                  <t.icon className="size-3.5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel body */}
        <div className={`p-3 ${fullscreen ? "flex-1 overflow-y-auto no-scrollbar" : ""}`}>
          {effective === "tools" && <ToolsPanel tool={tool} setTool={setTool} isNew={isNew} />}
          {effective === "inspector" && selectedClip && <InspectorPanel clipId={selectedClip} />}
          {effective === "library" && <LibraryPanel isNew={isNew} />}
          {effective === "ai" && <AiPanel />}
        </div>
      </div>
    </section>
  );
}

/* ── Tools panel — active cursor modes ── */

function ToolsPanel({
  tool, setTool, isNew,
}: { tool: ToolMode; setTool: (t: ToolMode) => void; isNew: boolean }) {
  const tools: { id: ToolMode; label: string; icon: typeof Scissors; hint: string }[] = [
    { id: "select", label: "Select", icon: ArrowLeft, hint: "default" },
    { id: "split", label: "Split", icon: Scissors, hint: "razor" },
    { id: "text", label: "Text", icon: Type, hint: "type tool" },
    { id: "speed", label: "Speed", icon: Gauge, hint: "rate stretch" },
    { id: "mask", label: "Mask", icon: PenTool, hint: "pen" },
  ];

  return (
    <div>
      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
              tool === t.id ? "bg-primary text-on-primary shadow-[var(--shadow-glass-lg)]" : "glass text-primary"
            }`}
          >
            <t.icon className="size-4" />
            <span className="text-[9px] font-semibold">{t.label}</span>
            <span className={`text-[7.5px] font-mono ${tool === t.id ? "text-lime" : "text-on-surface-variant"}`}>
              {t.hint}
            </span>
          </button>
        ))}
      </div>

      {/* Track-level / contextual commands (live on timeline; surfaced here too) */}
      <div className="text-[8.5px] font-mono uppercase tracking-wider text-on-surface-variant mb-1.5 px-1">
        Track commands
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { l: "Captions", i: Captions },
          { l: "Freeze", i: Snowflake },
          { l: "Reverse", i: Rewind },
          { l: "Unlink", i: Link2 },
          { l: "Duplicate", i: Copy },
          { l: "Delete", i: Trash2 },
          { l: "Canvas", i: Square },
          { l: "VO Rec", i: Mic },
        ].map((c) => (
          <button
            key={c.l}
            disabled={isNew}
            className="h-12 rounded-xl glass flex flex-col items-center justify-center gap-0.5 text-primary disabled:opacity-40 active:scale-95"
          >
            <c.i className="size-3.5" />
            <span className="text-[8.5px] font-semibold">{c.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Inspector panel — clip property drawer ── */

function InspectorPanel({ clipId }: { clipId: string }) {
  const isAudio = clipId.startsWith("a");
  const [tab, setTab] = useState<"color" | "audio" | "spatial">(isAudio ? "audio" : "color");
  const tabs = [
    { id: "color" as const, label: "Color", icon: Palette },
    { id: "audio" as const, label: "Audio", icon: AudioLines },
    { id: "spatial" as const, label: "Spatial", icon: Wand },
  ];

  return (
    <div>
      <div className="flex gap-1 mb-3">
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
  const bands = [60, 250, 500, "1k", "4k", "8k"];
  const [eq, setEq] = useState([40, 70, 55, 80, 45, 60]);
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2 h-20">
        {bands.map((b, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="relative w-full h-16 rounded-lg bg-surface-container overflow-hidden">
              <div className="absolute bottom-0 inset-x-0 bg-secondary transition-all" style={{ height: `${eq[i]}%` }} />
              <input
                type="range" min={0} max={100} value={eq[i]}
                onChange={(e) => { const next = [...eq]; next[i] = +e.target.value; setEq(next); }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-[8px] font-mono text-on-surface-variant">{b}</span>
          </div>
        ))}
      </div>
      <SliderRow label="Volume" value="-3 dB" v={70} onChange={() => {}} min={0} max={100} />
      <SliderRow label="Fade" value="120 ms" v={28} onChange={() => {}} min={0} max={100} />
      <SliderRow label="DeNoise" value="40%" v={40} onChange={() => {}} min={0} max={100} />
    </div>
  );
}

function SpatialInspector() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1.5">
        {["Scale", "Pos X", "Pos Y", "Rotation", "Mirror", "Chroma"].map((l) => (
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
      <div>
        <Label>Stickers · FX overlays</Label>
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <button key={i} className="aspect-square rounded-xl glass grid place-items-center text-secondary">
              <Sparkles className="size-4" />
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

/* ── Library panel ── */

function LibraryPanel({ isNew }: { isNew: boolean }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: isNew ? 0 : 6 }).map((_, i) => (
          <button key={i} className="relative aspect-square rounded-xl overflow-hidden ring-1 ring-primary/10 active:scale-95">
            <img src={previewFrame} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: `hue-rotate(${i * 40}deg)` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
            <span className="absolute bottom-1 left-1 font-mono text-[8px] text-white">MVI_092{i}</span>
          </button>
        ))}
        {isNew && (
          <div className="col-span-3 glass rounded-2xl py-6 text-center">
            <div className="text-[10px] font-mono text-on-surface-variant">No media yet</div>
          </div>
        )}
      </div>
      <button className="w-full h-10 rounded-full bg-lime text-primary text-[10.5px] font-mono font-semibold tracking-wider active:scale-[0.98]">
        + INGEST FROM MEDIASTORE
      </button>
    </div>
  );
}

/* ── AI panel ── */

function AiPanel() {
  return (
    <div className="space-y-2">
      <button className="w-full h-12 rounded-2xl bg-primary text-on-primary px-3 flex items-center justify-between active:scale-[0.98]">
        <div className="flex items-center gap-2">
          <Captions className="size-4 text-lime" />
          <div className="leading-tight text-left">
            <div className="text-[11px] font-display font-bold">Whisper · Transcribe</div>
            <div className="text-[9px] font-mono text-lime/80">Tiny · 39M · NNAPI</div>
          </div>
        </div>
        <Play className="size-3.5 text-lime" />
      </button>
      <div className="grid grid-cols-2 gap-2">
        <AiCard icon={<Mic className="size-3.5" />} title="Kokoro TTS" sub="Bella v1.2" />
        <AiCard icon={<Music2 className="size-3.5" />} title="MusicGen" sub="Ambient · 0:42" />
        <AiCard icon={<Sparkles className="size-3.5" />} title="Scene" sub="14 cuts found" />
        <AiCard icon={<ImageIcon className="size-3.5" />} title="VLM Index" sub="1 fps · ready" />
      </div>
    </div>
  );
}

function AiCard({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <button className="glass rounded-2xl p-2.5 flex flex-col gap-1.5 text-left active:scale-95">
      <div className="flex items-center justify-between">
        <span className="text-primary">{icon}</span>
        <span className="size-1.5 rounded-full bg-lime shadow-[var(--shadow-lime)]" />
      </div>
      <div className="leading-tight">
        <div className="text-[10.5px] font-display font-semibold text-primary">{title}</div>
        <div className="text-[9px] font-mono text-on-surface-variant">{sub}</div>
      </div>
    </button>
  );
}

/* ──────────────────────── Agent — text-first ──────────────────────── */

function AgentAnchor({ open, setOpen }: { open: boolean; setOpen: (b: boolean) => void }) {
  const [mode, setMode] = useState<AgentMode>("text");
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && mode === "text") inputRef.current?.focus();
  }, [open, mode]);

  const send = () => {
    if (!text.trim()) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setText("");
      setOpen(false);
    }, 1400);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => { setMode("text"); setOpen(true); }}
          className="absolute left-5 -top-5 z-30 size-11 rounded-full bg-primary grid place-items-center shadow-[var(--shadow-glass-lg)] active:scale-95 transition-transform ring-2 ring-white/70"
          aria-label="AI Agent"
        >
          <SparkIcon />
        </button>
      )}

      {open && (
        <div className="absolute left-3 right-3 -top-7 z-30">
          <div className="relative h-14 rounded-full bg-primary px-2 pl-3 flex items-center gap-2 shadow-[var(--shadow-glass-lg)] ring-2 ring-lime/40">
            <div className="size-9 rounded-full bg-lime grid place-items-center shrink-0">
              <SparkIcon dark />
            </div>

            {processing ? (
              <div className="flex-1 flex items-center gap-2">
                <div className="size-5 rounded-full border-2 border-lime/30 border-t-lime animate-spin" />
                <span className="text-[11px] font-mono text-lime">Routing to local matrix…</span>
              </div>
            ) : mode === "voice" ? (
              <div className="flex-1 flex items-center gap-2">
                <Waveform />
                <span className="text-[10.5px] font-mono text-lime/80 shrink-0">Listening…</span>
              </div>
            ) : (
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder="Ask the agent…"
                className="flex-1 bg-transparent outline-none text-[12px] text-lime placeholder:text-lime/40 min-w-0"
              />
            )}

            {/* Right action: swaps based on text presence */}
            {!processing && (
              text.trim() && mode === "text" ? (
                <button
                  onClick={send}
                  className="size-9 rounded-full bg-lime text-primary grid place-items-center active:scale-95"
                  aria-label="Send"
                >
                  <Send className="size-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setMode(mode === "voice" ? "text" : "voice")}
                  className={`size-9 rounded-full grid place-items-center active:scale-95 ${
                    mode === "voice" ? "bg-error text-on-error animate-pulse" : "bg-lime text-primary"
                  }`}
                  aria-label="Voice"
                >
                  <Mic className="size-3.5" />
                </button>
              )
            )}

            <button
              onClick={() => { setOpen(false); setMode("text"); setText(""); }}
              className="size-9 rounded-full bg-primary-container/30 text-lime grid place-items-center"
              aria-label="Close"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

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

function Waveform() {
  const bars = [4, 7, 12, 18, 14, 9, 16, 22, 18, 11, 8, 14, 20, 16, 10, 6, 12, 18, 15, 9];
  return (
    <div className="flex-1 h-8 flex items-center gap-[3px]">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-lime rounded-full origin-center animate-pulse"
          style={{ height: `${h * 4}%`, animationDelay: `${i * 60}ms`, animationDuration: "900ms" }}
        />
      ))}
    </div>
  );
}

/* ──────────────────────── Export ──────────────────────── */

function ExportTerminal({ onClose }: { onClose: () => void }) {
  const [bitrate, setBitrate] = useState(48);
  const [scale, setScale] = useState(100);
  const presets = ["Low", "Med", "High", "Ultra"];
  const [preset, setPreset] = useState(2);
  const estSize = Math.round((bitrate * 1.4 + scale * 0.3) * 1.2);

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
                <button
                  key={p}
                  onClick={() => setPreset(i)}
                  className={`h-10 rounded-xl text-[10.5px] font-mono font-semibold tracking-wider transition-colors ${
                    preset === i ? "bg-primary text-on-primary" : "glass text-primary"
                  }`}
                >
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
          <div
            className="absolute inset-y-0 left-0 bg-primary rounded-full"
            style={{ width: `${((v - min) / (max - min)) * 100}%` }}
          />
        </div>
        <input
          type="range" min={min} max={max} value={v}
          onChange={(e) => onChange(+e.target.value)}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute size-4 rounded-full bg-lime border-2 border-primary pointer-events-none shadow-[var(--shadow-lime)]"
          style={{ left: `calc(${((v - min) / (max - min)) * 100}% - 8px)` }}
        />
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
