import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Cpu, HardDrive, Zap, Volume2, Bell, Shield, Info,
  ChevronRight, Smartphone, Vibrate, Gauge,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "MotScri — Settings" },
      { name: "description", content: "Runtime, hardware acceleration, storage and haptics." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [nnapi, setNnapi] = useState(true);
  const [hwDecode, setHwDecode] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [snap, setSnap] = useState(true);
  const [notif, setNotif] = useState(false);
  const [quality, setQuality] = useState<"low" | "balanced" | "ultra">("balanced");

  return (
    <div className="relative flex flex-col min-h-[100dvh] w-full max-w-md mx-auto text-foreground">
      <header className="sticky top-0 z-30 px-4 pt-3 pb-3">
        <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-display text-[18px] font-bold text-primary leading-none">Settings</h1>
            <div className="text-[9.5px] font-mono text-on-surface-variant mt-1 uppercase tracking-wider">
              runtime · hardware · agent
            </div>
          </div>
          <div className="size-10 rounded-xl bg-primary text-on-primary grid place-items-center">
            <Smartphone className="size-4" />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 space-y-4">
        {/* Hardware Acceleration */}
        <Group title="Hardware Acceleration" hint="SoC capability">
          <Toggle
            icon={<Cpu className="size-4" />}
            title="NNAPI / Hexagon"
            sub="On-device model routing"
            value={nnapi} onChange={setNnapi}
          />
          <Toggle
            icon={<Zap className="size-4" />}
            title="MediaCodec HW Decode"
            sub="H.264 · H.265 · VP9 · AV1"
            value={hwDecode} onChange={setHwDecode}
          />
          <Row
            icon={<Gauge className="size-4" />}
            title="Render quality preset"
            value={quality.toUpperCase()}
          >
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              {(["low", "balanced", "ultra"] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`h-9 rounded-lg text-[10px] font-mono font-semibold uppercase tracking-wider ${
                    quality === q ? "bg-primary text-on-primary" : "glass text-primary"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </Row>
        </Group>

        {/* Editor */}
        <Group title="Editor" hint="haptics · gestures">
          <Toggle
            icon={<Vibrate className="size-4" />}
            title="Haptic feedback"
            sub="Frame snap · clip split"
            value={haptics} onChange={setHaptics}
          />
          <Toggle
            icon={<Volume2 className="size-4" />}
            title="Magnetic snap"
            sub="Snap to playhead / clip edges"
            value={snap} onChange={setSnap}
          />
        </Group>

        {/* Storage */}
        <Group title="Storage" hint="scoped · SAF">
          <Row icon={<HardDrive className="size-4" />} title="Cache used" value="412 MB">
            <button className="mt-2 h-9 px-3 rounded-full bg-primary text-on-primary text-[10px] font-mono font-semibold tracking-wider">
              CLEAR CACHE
            </button>
          </Row>
          <Link2 icon={<HardDrive className="size-4" />} title="Project storage" sub="2.86 GB / 64 GB" />
        </Group>

        {/* Notifications */}
        <Group title="Notifications">
          <Toggle
            icon={<Bell className="size-4" />}
            title="Background export"
            sub="Foreground svc · OS persistent"
            value={notif} onChange={setNotif}
          />
        </Group>

        {/* About */}
        <Group title="About">
          <Link2 icon={<Shield className="size-4" />} title="Privacy" sub="On-device · no telemetry" />
          <Link2 icon={<Info className="size-4" />} title="Version" sub="MotScri v1.0 · build 24·06" />
        </Group>
      </main>

      <BottomNav active="settings" />
    </div>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-end justify-between mb-2 px-1">
        <h2 className="font-display text-[13px] font-semibold text-primary">{title}</h2>
        {hint && <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider">{hint}</span>}
      </div>
      <div className="glass rounded-2xl divide-y divide-outline-variant/30">
        {children}
      </div>
    </section>
  );
}

function Toggle({
  icon, title, sub, value, onChange,
}: { icon: React.ReactNode; title: string; sub?: string; value: boolean; onChange: (b: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 p-3.5">
      <div className="size-9 rounded-xl bg-surface-container text-primary grid place-items-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-display font-semibold text-primary">{title}</div>
        {sub && <div className="text-[9.5px] font-mono text-on-surface-variant mt-0.5">{sub}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-primary" : "bg-surface-high"}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Row({
  icon, title, value, children,
}: { icon: React.ReactNode; title: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="p-3.5">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-xl bg-surface-container text-primary grid place-items-center shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-display font-semibold text-primary">{title}</div>
        </div>
        <span className="text-[10px] font-mono text-secondary font-semibold">{value}</span>
      </div>
      {children}
    </div>
  );
}

function Link2({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <button className="w-full flex items-center gap-3 p-3.5 active:bg-primary/5 transition-colors">
      <div className="size-9 rounded-xl bg-surface-container text-primary grid place-items-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0 text-left">
        <div className="text-[12.5px] font-display font-semibold text-primary">{title}</div>
        {sub && <div className="text-[9.5px] font-mono text-on-surface-variant mt-0.5">{sub}</div>}
      </div>
      <ChevronRight className="size-4 text-on-surface-variant" />
    </button>
  );
}
