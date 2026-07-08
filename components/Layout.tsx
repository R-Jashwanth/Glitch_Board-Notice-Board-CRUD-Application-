import React from "react";
import Navbar from "./Navbar.tsx";

interface LayoutProps {
  children: React.ReactNode;
  dbMode?: "cloud" | "fallback" | string;
}

export default function Layout({ children, dbMode }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#030305] text-[#00f0ff] font-sans selection:bg-[#ff00ff] selection:text-black">
      {/* GLITCH HEADER CORNER LINES */}
      <div className="fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 via-pink-500 to-cyan-500 z-50 animate-pulse" />
      
      {/* DECENTRALIZED TERMINAL LAYOUT */}
      <Navbar dbMode={dbMode} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 relative">
        {/* SUBTLE CORNER MARKINGS FOR RETRO UI */}
        <div className="absolute top-2 left-2 text-[10px] text-zinc-600 select-none">GRID::SEC-0x49A</div>
        <div className="absolute top-2 right-2 text-[10px] text-zinc-600 select-none">SYS_READY::W9_IP</div>
        
        {children}
      </main>

      {/* MATRIX TELEMETRY FOOTER */}
      <footer className="border-t border-zinc-800 bg-black/80 py-4 text-center text-xs text-zinc-500 mt-12 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>[SYSTEM_SECURE_NODE: RENO_BOARD_NET]</span>
          <span>© 2026 RENO PLATFORMS // GRID CORE ENG_ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}
