import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetName?: string;
  isLoading: boolean;
}

export default function DeleteModal({ isOpen, onClose, onConfirm, targetName, isLoading }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-md w-full border-2 border-[#ff00ff] bg-[#0c050c] p-6 text-slate-100 neon-border-magenta"
        >
          {/* TECHNICAL BOUNDARY DECORATIONS */}
          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-inherit" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-inherit" />

          {/* CLOSE CONTROLLER */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-zinc-500 hover:text-[#ff00ff] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* DOCK CONTENT */}
          <div className="flex flex-col items-center text-center mt-2">
            <div className="p-3 border border-red-500 bg-red-950/20 text-red-500 rounded-full mb-4 animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-extrabold uppercase tracking-widest text-[#ff00ff] glitch-shadow-magenta mb-2">
              DESTRUCTIVE PURGE COMMAND
            </h3>

            <p className="text-zinc-400 text-sm font-mono mb-6 leading-relaxed">
              YOU ARE ABOUT TO INITIATE A PERMANENT NETWORK DE-AUTHORIZATION OF BULLETIN NODE:
              <span className="block mt-2 font-bold text-red-500 select-all tracking-wider text-xs border border-red-500/30 p-2 bg-black/50 uppercase">
                {targetName || "UNSPECIFIED NOTICE NODE"}
              </span>
              THIS OPERATION IS DIRECT AND CANNOT BE RECOVERED.
            </p>

            {/* ACTION TRIGGERS */}
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-2.5 border border-zinc-700 hover:border-zinc-500 text-xs font-bold uppercase tracking-wider text-zinc-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel Protocol
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 hover:glitch-shadow-magenta text-xs font-extrabold uppercase tracking-wider text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-3 h-3 rounded-full border-2 border-t-transparent border-white animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>PURGE NODE</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
