import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import previewFrame from "@/assets/preview-frame.jpg";
import {
  Play, Pause, SkipBack, SkipForward, Scissors, Wand2, Sparkles,
  Mic, Music2, Captions, ChevronLeft, ChevronDown, X, ArrowLeft,
  Layers, Type, Image as ImageIcon, AudioLines, Film, Library,
  Sliders, Download, Lock, Eye, Volume2, Magnet, Maximize2,
} from "lucide-react";

export const Route = createFileRoute("/editor/$projectId")({
  head: () => ({
    meta: [
      { title: "MotScri — Editor" },
      { name: "description", content: "5-zone tactile workspace with on-device AI agent." },
    ],
  }),
  component: EditorPage,
});

type Deck =
  | "default"
  | "media"
  | "text"
  | "audio"
  | "effects"
  | "transitions"
  | "ai"
  | "agent";

function EditorPage() {
  const { projectId } = useParams({ from: "/editor/$projectId" });
  const [deck, setDeck] = useState<Deck>("default");
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(252);
  const [selectedClip, setSelectedClip] = useState<string | null>("v1-2");
  const [aspect, setAspect] = useState("16:9");
  const [agentOpen, setAgentOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="relative flex flex-col h-[100dvh] w-full max-w-md mx-auto overflow-hidden text-foreground">
      <Zone1Header
        projectId={projectId}
        aspect={aspect}
        setAspect={setAspect}
        onExport={() => setExportOpen(true)}
      />

      <Zone2Viewport playing={playing} aspect={aspect} time={time} />

      <Transport
        playing={playing}
        onToggle={() => setPlaying((p) => !p)}
        time={time}
        onSeek={setTime}
      />

      <Zone3Ruler time={time} />

      <Zone4Canvas selected={selectedClip} onSelect={setSelectedClip} />

      {/* Zone 4 / Zone 5 seam — AI Agent anchor lives here */}
      <div className="relative shrink-0">
        <Zone5Deck
          deck={deck}
          setDeck={setDeck}
          selectedClip={selectedClip}
          onEscape={() => {
            setDeck("default");
            setSelectedClip(null);
          }}
        />
        <AgentAnchor open={agentOpen} setOpen={setAgentOpen} />
      </div>

      {exportOpen && <ExportTerminal onClose={() => setExportOpen(false)} />}
    </div>
  );
}

/* ─────────────────────────── ZONE 1 ─────────────────────────── */

function Zone1Header({
  projectId, aspect, setAspect, onExport,
}: {
  projectId: string;
  aspect: string;
  setAspect: (s: string) => void;
  onExport: () => void;
}) {
  const name = projectId === "new" ? "Untitled · 001" : projectId.replace(/-/g, " · ");
  const [open, setOpen] = useState(false);
  const aspects = ["16:9", "9:16", "1:1", "4:5", "21:9"];
  return (
    <header className="relative z-30 px-3 pt-3 pb-2 shrink-0">
      <div className="glass-strong rounded-2xl h-12 px-2 flex items-center justify-between gap-2">
        <Link
          to="/"
          className="size-9 grid place-items-center rounded-xl text-primary active:bg-primary/5"
        >
          <ChevronLeft className="size-4" />
        </Link>

        <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
          <button
            onClick={() => setOpen((o) => !o)}
            className="h-7 px-2.5 rounded-full bg-primary text-on-primary text-[10px] font-mono font-semibold flex items-center gap-1.5"
          >
            {aspect}
            <ChevronDown className="size-3" />
          </button>
          <div className="leading-tight text-center min-w-0">
            <div className="font-display text-[12px] font-semibold text-primary truncate capitalize">{name}</div>
            <div className="text-[8.5px] font-mono text-on-surface-variant uppercase tracking-wider flex items-center justify-center gap-1">
              <span className="size-1 rounded-full bg-lime" /> saved · 2s
            </div>
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

/* ─────────────────────────── ZONE 2 ─────────────────────────── */

function Zone2Viewport({ playing, aspect, time }: { playing: boolean; aspect: string; time: number }) {
  const ratio = aspectRatio(aspect);
  return (
    <section className="px-3 shrink-0">
      <div className="relative glass-strong rounded-2xl p-2 overflow-hidden">
        <div
          className="relative w-full rounded-xl overflow-hidden bg-primary"
          style={{ aspectRatio: ratio }}
        >
          <img src={previewFrame} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/30" />

          {/* Selection frame */}
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

          {/* Status badges */}
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
          <div className="absolute top-3 right-3 glass-dark rounded-full px-2.5 py-1 font-mono text-[9.5px] text-lime/90">
            {aspect} · MOtISCEI
          </div>
          <div className="absolute bottom-3 left-3 glass-dark rounded-full px-2.5 py-1 font-mono text-[9px] text-lime/90">
            H.265 · HW · NNAPI
          </div>
        </div>
      </div>
    </section>
  );
}

function aspectRatio(a: string) {
  const [w, h] = a.split(":").map(Number);
  return `${w} / ${h}`;
}

/* ─────────────────────────── Transport ─────────────────────────── */

function Transport({
  playing, onToggle, time, onSeek,
}: { playing: boolean; onToggle: () => void; time: number; onSeek: (n: number) => void }) {
  const total = 417;
  return (
    <div className="px-3 pt-2 shrink-0">
      <div className="glass rounded-2xl h-12 px-3 flex items-center gap-3">
        <button
          onClick={() => onSeek(Math.max(0, time - 5))}
          className="size-8 grid place-items-center rounded-full text-primary active:bg-primary/5"
        >
          <SkipBack className="size-4" />
        </button>
        <button
          onClick={onToggle}
          className="size-10 rounded-full bg-primary text-on-primary grid place-items-center shadow-[var(--shadow-glass-lg)] active:scale-95 transition-transform"
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4 translate-x-0.5" />}
        </button>
        <button
          onClick={() => onSeek(Math.min(total, time + 5))}
          className="size-8 grid place-items-center rounded-full text-primary active:bg-primary/5"
        >
          <SkipForward className="size-4" />
        </button>

        <div className="flex-1 flex items-center gap-2">
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
          <span className="font-mono text-[9.5px] text-primary tabular">{fmt(time)}</span>
        </div>
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

/* ─────────────────────────── ZONE 3 — Ruler ─────────────────────────── */

function Zone3Ruler({ time }: { time: number }) {
  const total = 417;
  const pct = (time / total) * 100;
  return (
    <div className="px-3 pt-2 shrink-0">
      <div className="relative h-6 glass rounded-t-xl rounded-b-none overflow-hidden">
        <div className="absolute inset-0 flex items-end px-2 pb-1">
          {Array.from({ length: 24 }).map((_, i) => {
            const major = i % 4 === 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-start justify-end gap-0.5">
                {major && (
                  <span className="font-mono text-[7.5px] text-primary/60 tabular leading-none">
                    {String(i).padStart(2, "0")}s
                  </span>
                )}
                <div
                  className="w-px bg-primary/50"
                  style={{ height: major ? "8px" : "4px" }}
                />
              </div>
            );
          })}
        </div>
        {/* Playhead diamond */}
        <div className="absolute top-0 bottom-0 z-10" style={{ left: `${pct}%` }}>
          <div className="absolute -top-px -left-1.5 size-3 rotate-45 bg-lime shadow-[var(--shadow-lime)]" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── ZONE 4 — Context Canvas ─────────────────────────── */

function Zone4Canvas({
  selected, onSelect,
}: { selected: string | null; onSelect: (id: string | null) => void }) {
  const total = 417;
  return (
    <section className="flex-1 min-h-0 px-3 pb-1 relative">
      <div className="relative h-full glass rounded-b-xl rounded-t-none overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto overflow-x-auto no-scrollbar">
          <div style={{ minWidth: "780px" }} className="py-2.5 pl-2 pr-3 space-y-1.5">
            <TrackRow label="V2" kind="video">
              <Clip id="v2-1" w={160} kind="text" label="TITLE · Kinetic" selected={selected === "v2-1"} onSelect={onSelect} />
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
            <TrackRow label="A2" kind="audio">
              <WaveClip id="a2-1" w={500} label="MUSICGEN_v3.wav" tone="lime" selected={selected === "a2-1"} onSelect={onSelect} />
            </TrackRow>
          </div>
        </div>

        {/* Playhead column through Z4 */}
        <div
          className="absolute top-0 bottom-0 w-px bg-lime pointer-events-none z-10"
          style={{ left: "calc(12px + (768px * 0.6))" }}
        />

        {/* Floating tool cluster (right) */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 z-20">
          <FloatTool active><Scissors className="size-3.5" /></FloatTool>
          <FloatTool><Magnet className="size-3.5" /></FloatTool>
          <FloatTool><Maximize2 className="size-3.5" /></FloatTool>
        </div>

        {/* Subtle duration label */}
        <div className="absolute bottom-2 right-3 glass-dark rounded-full px-2 py-0.5 text-[8.5px] font-mono text-lime/90">
          {String(Math.floor(total / 60)).padStart(2, "0")}:{String(total % 60).padStart(2, "0")} total
        </div>
      </div>
    </section>
  );
}

function FloatTool({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className={`size-9 rounded-full grid place-items-center transition-transform active:scale-95 ${
        active ? "bg-primary text-on-primary shadow-[var(--shadow-glass-lg)]" : "glass-strong text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function TrackRow({
  label, kind, primary, children,
}: { label: string; kind: "video" | "audio"; primary?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2 ${primary ? "h-14" : "h-10"}`}>
      <div className="sticky left-0 z-10 w-9 h-full flex flex-col items-start justify-center gap-1 pl-1 bg-gradient-to-r from-white/80 to-transparent">
        <span className="font-mono text-[9px] font-bold text-primary tracking-wider">{label}</span>
        <div className="flex gap-1 text-primary/40">
          <Lock className="size-2.5" />
          {kind === "video" ? <Eye className="size-2.5" /> : <Volume2 className="size-2.5" />}
        </div>
      </div>
      <div className="flex items-center gap-1 h-full">{children}</div>
    </div>
  );
}

function Clip({
  id, w, label, selected, onSelect,
}: { id: string; w: number; kind: "text"; label: string; selected?: boolean; onSelect: (id: string) => void }) {
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
      <span className="absolute bottom-1 left-1.5 text-[8.5px] font-mono font-medium text-white">
        {label}
      </span>
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

/* ─────────────────────────── ZONE 5 — Control Deck ─────────────────────────── */

const DECK_TABS: { id: Deck; label: string; icon: typeof Film }[] = [
  { id: "media", label: "Media", icon: Library },
  { id: "text", label: "Text", icon: Type },
  { id: "audio", label: "Audio", icon: AudioLines },
  { id: "effects", label: "Effects", icon: Sparkles },
  { id: "transitions", label: "Transit", icon: ImageIcon },
  { id: "ai", label: "Models", icon: Sliders },
];

function Zone5Deck({
  deck, setDeck, selectedClip, onEscape,
}: {
  deck: Deck;
  setDeck: (d: Deck) => void;
  selectedClip: string | null;
  onEscape: () => void;
}) {
  return (
    <section className="px-3 pb-3 pt-1 relative">
      <div className="glass-strong rounded-3xl overflow-hidden">
        {deck === "default" ? (
          <DefaultDeck setDeck={setDeck} onEscape={onEscape} hasSelection={!!selectedClip} />
        ) : (
          <TuningInterface deck={deck} setDeck={setDeck} onEscape={onEscape} selectedClip={selectedClip} />
        )}
      </div>
    </section>
  );
}

function DefaultDeck({
  setDeck, onEscape, hasSelection,
}: { setDeck: (d: Deck) => void; onEscape: () => void; hasSelection: boolean }) {
  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-2.5 pl-1">
        <EscapementPillar onPress={onEscape} compact />
        <div className="leading-tight">
          <div className="font-display text-[12px] font-semibold text-primary">
            {hasSelection ? "Clip · Selected" : "Workspace · Idle"}
          </div>
          <div className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider">
            Tap a category to morph deck
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {DECK_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setDeck(t.id)}
            className="shrink-0 w-16 h-16 rounded-2xl glass flex flex-col items-center justify-center gap-1 text-primary active:scale-95 transition-transform"
          >
            <t.icon className="size-4" />
            <span className="text-[9.5px] font-semibold">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TuningInterface({
  deck, onEscape, selectedClip,
}: {
  deck: Deck;
  setDeck: (d: Deck) => void;
  onEscape: () => void;
  selectedClip: string | null;
}) {
  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <EscapementPillar onPress={onEscape} />
          <div className="leading-tight">
            <div className="font-display text-[13px] font-semibold text-primary capitalize">{deck}</div>
            <div className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider">
              {selectedClip ?? "no selection"}
            </div>
          </div>
        </div>
        <span className="px-2 py-1 rounded-full bg-lime text-primary text-[9px] font-mono font-semibold tracking-wider">
          TUNING
        </span>
      </div>

      {deck === "media" && <MediaPanel />}
      {deck === "text" && <TextPanel />}
      {deck === "audio" && <AudioPanel />}
      {deck === "effects" && <EffectsPanel />}
      {deck === "transitions" && <TransitionsPanel />}
      {deck === "ai" && <AiPanel />}
    </div>
  );
}

function EscapementPillar({ onPress, compact }: { onPress: () => void; compact?: boolean }) {
  return (
    <button
      onClick={onPress}
      className={`${compact ? "h-9 px-3" : "h-10 px-3.5"} rounded-full bg-primary text-on-primary flex items-center gap-1.5 shadow-[var(--shadow-glass-lg)] active:scale-95 transition-transform`}
      aria-label="Escape · drop one layer"
    >
      <ArrowLeft className="size-3.5 text-lime" />
      <span className="text-[9.5px] font-mono font-semibold tracking-wider">ESC</span>
    </button>
  );
}

/* Tuning panels */

function MediaPanel() {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <button key={i} className="relative aspect-square rounded-xl overflow-hidden ring-1 ring-primary/10 active:scale-95 transition-transform">
            <img src={previewFrame} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: `hue-rotate(${i * 40}deg)` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
            <span className="absolute bottom-1 left-1 font-mono text-[8px] text-white">MVI_092{i}</span>
          </button>
        ))}
      </div>
      <button className="w-full h-10 rounded-full bg-lime text-primary text-[10.5px] font-mono font-semibold tracking-wider active:scale-[0.98]">
        + INGEST FROM MEDIASTORE
      </button>
    </div>
  );
}

function TextPanel() {
  const presets = ["Kinetic", "Lower Third", "Subtitle", "Title Card", "Caption", "Credit"];
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {presets.map((p) => (
          <button key={p} className="h-14 rounded-xl glass flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
            <Type className="size-3.5 text-secondary" />
            <span className="text-[9.5px] font-semibold text-primary">{p}</span>
          </button>
        ))}
      </div>
      <div className="glass rounded-xl p-2.5 flex items-center gap-2">
        <input
          placeholder="Type a title…"
          className="flex-1 bg-transparent outline-none text-[12px] text-primary placeholder:text-on-surface-variant/60"
        />
        <button className="h-8 px-3 rounded-full bg-primary text-on-primary text-[9.5px] font-mono font-semibold">
          COMMIT
        </button>
      </div>
    </div>
  );
}

function AudioPanel() {
  const bands = [60, 250, 500, "1k", "4k", "8k"];
  const [eq, setEq] = useState([40, 70, 55, 80, 45, 60]);
  return (
    <div>
      <div className="flex items-end gap-2 h-24 mb-2">
        {bands.map((b, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="relative w-full h-20 rounded-lg bg-surface-container overflow-hidden">
              <div className="absolute bottom-0 inset-x-0 bg-secondary transition-all" style={{ height: `${eq[i]}%` }} />
              <input
                type="range" min={0} max={100} value={eq[i]}
                onChange={(e) => {
                  const next = [...eq]; next[i] = +e.target.value; setEq(next);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="absolute left-0 right-0 top-1/2 h-px bg-primary/20" />
            </div>
            <span className="text-[8.5px] font-mono text-on-surface-variant">{b}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-surface-container overflow-hidden">
          <div className="h-full w-3/4 bg-gradient-to-r from-lime via-secondary to-error" />
        </div>
        <span className="text-[9px] font-mono text-primary tabular">L -3.2 · R -4.1</span>
      </div>
    </div>
  );
}

function EffectsPanel() {
  const fx = [
    { n: "Curves", v: "ON" },
    { n: "Gaussian", v: "12%" },
    { n: "RGB Split", v: "3px" },
    { n: "Grain", v: "18" },
    { n: "Chroma", v: "—" },
    { n: "Vignette", v: "0.4" },
  ];
  const [active, setActive] = useState("Curves");
  return (
    <div className="grid grid-cols-2 gap-2">
      {fx.map((f) => (
        <button
          key={f.n}
          onClick={() => setActive(f.n)}
          className={`h-12 rounded-xl px-3 flex items-center justify-between transition-colors ${
            active === f.n ? "bg-primary text-on-primary" : "glass text-primary"
          }`}
        >
          <span className="text-[10.5px] font-semibold">{f.n}</span>
          <span className={`text-[9px] font-mono ${active === f.n ? "text-lime" : "text-secondary"}`}>{f.v}</span>
        </button>
      ))}
    </div>
  );
}

function TransitionsPanel() {
  const trs = ["Cut", "Dissolve", "Wipe L→R", "Push", "Zoom", "Glitch", "Whip", "Iris"];
  return (
    <div className="grid grid-cols-4 gap-2">
      {trs.map((t) => (
        <button key={t} className="h-14 rounded-xl glass flex flex-col items-center justify-center gap-1 active:scale-95">
          <div className="size-5 rounded-md bg-gradient-to-br from-secondary to-primary" />
          <span className="text-[9px] font-semibold text-primary">{t}</span>
        </button>
      ))}
    </div>
  );
}

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
        <AiCard icon={<Layers className="size-3.5" />} title="VLM Index" sub="1 fps · ready" />
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

/* ─────────────────────────── AI AGENT — seam anchor ─────────────────────────── */

function AgentAnchor({
  open, setOpen,
}: { open: boolean; setOpen: (b: boolean) => void }) {
  const [processing, setProcessing] = useState(false);

  return (
    <>
      {/* Idle: small circle pinned to extreme left of Z4/Z5 seam */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="absolute left-5 -top-5 z-30 size-11 rounded-full bg-primary grid place-items-center shadow-[var(--shadow-glass-lg)] active:scale-95 transition-transform ring-2 ring-white/70"
          aria-label="AI Agent"
        >
          <SparkIcon />
          <span className="absolute inset-0 rounded-full ring-1 ring-lime/30" />
        </button>
      )}

      {/* Active: expanded full-width capsule */}
      {open && (
        <div className="absolute left-3 right-3 -top-7 z-30">
          <div className="relative h-14 rounded-full bg-primary px-3 flex items-center gap-3 shadow-[var(--shadow-glass-lg)] ring-2 ring-lime/40">
            <div className="size-9 rounded-full bg-lime grid place-items-center shrink-0">
              <SparkIcon dark />
            </div>
            {processing ? (
              <div className="flex-1 flex items-center gap-2">
                <div className="size-5 rounded-full border-2 border-lime/30 border-t-lime animate-spin" />
                <span className="text-[11px] font-mono text-lime">Routing to local matrix…</span>
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <Waveform />
                <span className="text-[10.5px] font-mono text-lime/80 shrink-0">Listening…</span>
              </div>
            )}
            <button
              onClick={() => { setProcessing(true); setTimeout(() => { setProcessing(false); setOpen(false); }, 1600); }}
              className="size-9 rounded-full bg-lime text-primary grid place-items-center text-[9.5px] font-mono font-bold"
            >
              GO
            </button>
            <button
              onClick={() => { setOpen(false); setProcessing(false); }}
              className="size-9 rounded-full bg-primary-container/30 text-lime grid place-items-center"
            >
              <X className="size-3.5" />
            </button>
            <span className="absolute inset-0 rounded-full ring-2 ring-lime/40 animate-pulse pointer-events-none" />
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
          style={{
            height: `${h * 4}%`,
            animationDelay: `${i * 60}ms`,
            animationDuration: "900ms",
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────── Export Terminal (60% overlay) ─────────────────────────── */

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
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-display font-semibold text-primary">{label}</span>
        <span className="text-[10px] font-mono text-secondary tabular">{value}</span>
      </div>
      <input
        type="range" min={min} max={max} value={v}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full h-2 rounded-full bg-surface-container appearance-none cursor-pointer accent-[var(--secondary)]"
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl px-3 py-2">
      <div className="text-[8.5px] uppercase tracking-wider font-mono text-on-surface-variant">{label}</div>
      <div className="text-[12px] font-display font-bold text-primary tabular">{value}</div>
    </div>
  );
}
