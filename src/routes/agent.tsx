import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Send, Mic } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/agent")({
  head: () => ({
    meta: [
      { title: "MotScri — Agent" },
      { name: "description", content: "Chat with the editing agent. Coming soon." },
    ],
  }),
  component: AgentPage,
});

function AgentPage() {
  return (
    <div className="relative flex flex-col min-h-[100dvh] w-full max-w-md mx-auto text-foreground">
      <header className="sticky top-0 z-30 px-4 pt-3 pb-3">
        <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-display text-[18px] font-bold text-primary leading-none">Agent · Chat</h1>
            <div className="text-[9.5px] font-mono text-on-surface-variant mt-1 uppercase tracking-wider">
              prompt-driven editing
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-lime text-primary text-[9px] font-mono font-semibold tracking-wider">
            COMING SOON
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 pb-32 flex flex-col items-center justify-center text-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-lime blur-2xl opacity-60 animate-pulse" />
          <div className="relative size-24 rounded-full bg-primary grid place-items-center shadow-[var(--shadow-glass-lg)]">
            <Sparkles className="size-10 text-lime" />
          </div>
        </div>
        <div className="space-y-2 max-w-[280px]">
          <h2 className="font-display text-[22px] font-bold text-primary leading-tight">
            Talk to your timeline
          </h2>
          <p className="text-[12px] text-on-surface-variant leading-relaxed">
            Describe the edit. The agent runs MOtISCEI commands on your behalf and
            streams each step it took — split, transcribe, balance, render.
          </p>
        </div>

        <div className="w-full glass rounded-3xl p-4 space-y-3 text-left">
          <div className="text-[9.5px] font-mono uppercase tracking-wider text-secondary">
            Sample prompts
          </div>
          {[
            "Cut all silences > 0.8s and tighten dialog",
            "Generate captions and place at safe zone",
            "Match-grade B-roll to interview clip",
            "Score a 30s ambient bed under V1",
          ].map((p) => (
            <div key={p} className="glass-strong rounded-2xl px-3 py-2.5 text-[11.5px] text-primary">
              {p}
            </div>
          ))}
        </div>

        {/* Disabled composer preview */}
        <div className="w-full glass-strong rounded-full h-14 px-2 flex items-center gap-2 opacity-70">
          <input
            disabled
            placeholder="Ask the agent…"
            className="flex-1 bg-transparent outline-none px-3 text-[12.5px] placeholder:text-on-surface-variant/60"
          />
          <button disabled className="size-11 rounded-full bg-primary/40 text-on-primary grid place-items-center">
            <Mic className="size-4" />
          </button>
        </div>
      </main>

      <BottomNav active="agent" />
    </div>
  );
}
