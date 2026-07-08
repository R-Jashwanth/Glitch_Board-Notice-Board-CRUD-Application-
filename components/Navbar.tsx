import React from "react";
import { Cpu, Plus } from "lucide-react";

interface NavbarProps {
  currentRoute?: string;
  setRoute?: (route: string) => void;
  dbMode?: "cloud" | "fallback" | string;
}

export default function Navbar({ currentRoute, setRoute, dbMode }: NavbarProps) {
  const navigate = (route: string) => {
    if (setRoute) {
      setRoute(route);
    } else {
      window.location.href = route === "/" ? "/" : `/notice/${route.split("/").pop()}`;
    }
  };

  return (
    <header className="border-b border-zinc-800 bg-black/90 sticky top-0 z-40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* BRAND/TITLE TERMINAL */}
          <div 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="p-1 border border-[#00f0ff] bg-[#00f0ff]/10 group-hover:bg-[#ff00ff]/10 group-hover:border-[#ff00ff] transition-all">
              <Cpu className="w-6 h-6 text-[#00f0ff] group-hover:text-[#ff00ff]" />
            </div>
            <div className="font-sans text-xl font-bold tracking-widest text-[#00f0ff] group-hover:text-[#ff00ff] transition-colors relative">
              GLITCH_BOARD
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#ff00ff] group-hover:w-full transition-all duration-300" />
            </div>
          </div>

          {/* ACCESS MATRIX ACTIONS */}
          <div className="flex items-center gap-4">
            {/* SYSTEM STATUS */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 border border-zinc-800 bg-zinc-950 text-xs font-mono">
              {dbMode === "fallback" ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse animate-duration-1000" />
                  <span className="text-amber-500 font-extrabold tracking-widest">FAILSAFE::LOCAL_STORE</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-emerald-500 font-extrabold tracking-widest">TERMINAL::ONLINE</span>
                </>
              )}
            </div>

            {/* ACTION: COMPOSE BULLETIN */}
            <button
              onClick={() => navigate("/notice/new")}
              className="relative px-4 py-2 border-2 border-[#00f0ff] bg-black text-xs font-bold uppercase tracking-wider text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black hover:glitch-shadow-cyan transition-all duration-300 flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast Node</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
