import { Link } from "@tanstack/react-router";
import { Folder, Settings, Sparkles } from "lucide-react";

type ActiveTab = "projects" | "settings" | "agent";

export function BottomNav({ active }: { active: ActiveTab }) {
  const items: { id: ActiveTab; icon: typeof Folder; label: string; to: string }[] = [
    { id: "projects", icon: Folder, label: "Projects", to: "/projects" },
    { id: "agent", icon: Sparkles, label: "Agent", to: "/agent" },
    { id: "settings", icon: Settings, label: "Settings", to: "/settings" },
  ];
  return (
    <nav className="fixed bottom-3 inset-x-0 max-w-md mx-auto px-4 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="glass-strong rounded-full h-14 grid grid-cols-3 px-2 gap-1">
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <Link
              key={it.id}
              to={it.to}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-full transition-colors ${
                isActive ? "bg-primary text-on-primary" : "text-primary/70"
              }`}
            >
              <it.icon className="size-4" />
              <span className="text-[9px] font-semibold tracking-wide">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
