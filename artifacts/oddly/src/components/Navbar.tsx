import { useGame } from "@/App";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { navTab, setNavTab } = useGame();

  const tabs = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "rules", label: "Rules" },
    { id: "developer", label: "Developer" },
  ] as const;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="font-black text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          ODDLY
        </div>
        <nav className="flex items-center gap-1 sm:gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setNavTab(tab.id)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-300",
                navTab === tab.id
                  ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
