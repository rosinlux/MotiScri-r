import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MotScri" },
      { name: "description", content: "Organic intelligence mobile NLE. On-device AI, hardware-accelerated rendering." },
    ],
  }),
  component: SplashPage,
});

function SplashPage() {
  const navigate = useNavigate();
  const [boot, setBoot] = useState(0);

  useEffect(() => {
    const steps = [
      "Mounting MOtISCEI runtime…",
      "Probing SoC · NNAPI / Hexagon…",
      "Linking MediaCodec H.265…",
      "Scoped storage · ready",
    ];
    const id = setInterval(() => {
      setBoot((b) => (b + 1 < steps.length ? b + 1 : b));
    }, 650);
    const t = setTimeout(() => navigate({ to: "/projects" }), 3200);
    return () => { clearInterval(id); clearTimeout(t); };
  }, [navigate]);

  const steps = [
    "Mounting MOtISCEI runtime…",
    "Probing SoC · NNAPI / Hexagon…",
    "Linking MediaCodec H.265…",
    "Scoped storage · ready",
  ];

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[100dvh] w-full max-w-md mx-auto px-6 pt-20 pb-12">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-[44px] bg-lime blur-3xl opacity-50 animate-pulse" />
          <div className="relative size-28 rounded-[36px] bg-primary grid place-items-center shadow-[var(--shadow-glass-lg)]">
            <SparkLogo size={48} />
          </div>
        </div>
        <h1 className="mt-8 font-display text-[44px] leading-none font-bold text-primary tracking-tight">
          MotScri
        </h1>
        <p className="mt-3 text-[11px] font-mono uppercase tracking-[0.3em] text-on-surface-variant text-center">
          Organic Intelligence · NLE
        </p>
      </div>

      <div className="w-full space-y-4">
        <div className="glass rounded-2xl px-4 py-3 font-mono text-[10.5px] text-primary tabular min-h-[42px] flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-lime animate-pulse shadow-[var(--shadow-lime)]" />
          <span className="truncate">{steps[boot]}</span>
        </div>
        <Link
          to="/projects"
          className="block w-full h-14 rounded-full bg-primary text-on-primary text-center grid place-items-center font-display font-semibold text-[14px] tracking-wide active:scale-[0.98] transition-transform shadow-[var(--shadow-glass-lg)]"
        >
          ENTER WORKSPACE
        </Link>
        <p className="text-center text-[9.5px] font-mono text-on-surface-variant/70 uppercase tracking-wider">
          v1.0 · build 24·06 · edge-compute
        </p>
      </div>
    </div>
  );
}

function SparkLogo({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }} fill="none">
      <path
        d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M5.6 18.4l4.2-4.2M14.2 9.8l4.2-4.2"
        stroke="#c5e1a5" strokeWidth="1.5" strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2" fill="#c5e1a5" />
    </svg>
  );
}
