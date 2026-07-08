import React from "react";
import { Calendar, Tag, AlertTriangle, Edit3, Trash2 } from "lucide-react";
import { motion } from "motion/react";

export interface Notice {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  publishDate: string | Date;
  image?: string | null;
  createdAt?: string | Date;
}

interface NoticeCardProps {
  key?: React.Key;
  notice: Notice;
  onEdit: (notice: Notice) => void;
  onDelete: (notice: Notice) => void;
}

export default function NoticeCard({ notice, onEdit, onDelete }: NoticeCardProps) {
  const isUrgent = notice.priority === "Urgent";
  
  // Format publish date
  const formattedDate = React.useMemo(() => {
    try {
      const date = new Date(notice.publishDate);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "UNKNOWN_DATE";
    }
  }, [notice.publishDate]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`relative flex flex-col bg-[#08080c] border-2 transition-all duration-300 ${
        isUrgent 
          ? "border-[#ff00ff] neon-border-magenta bg-gradient-to-br from-[#ff00ff]/5 via-transparent to-black" 
          : "border-zinc-800 hover:border-[#00f0ff] hover:neon-border-cyan"
      }`}
    >
      {/* CORNER INDICATOR DECORATORS */}
      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-inherit" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-inherit" />

      {/* DOCK IMAGE (IF PRESENT) */}
      {notice.image && (
        <div className="w-full h-44 overflow-hidden border-b border-zinc-800 relative group">
          <img
            src={notice.image}
            alt={notice.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        </div>
      )}

      {/* CORE INFO ELEMENT */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* HEADER TAGS */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
            {/* CATEGORY TAG */}
            <span className="flex items-center gap-1.5 px-2 py-0.5 border border-zinc-700 bg-zinc-900 text-zinc-300 uppercase tracking-wider text-[11px]">
              <Tag className="w-3.5 h-3.5 text-[#00f0ff]" />
              {notice.category}
            </span>

            {/* PRIORITY BADGE */}
            {isUrgent ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 border-2 border-red-500 bg-red-950/40 text-red-500 font-extrabold uppercase tracking-widest text-[11px] animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                Urgent
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 border border-zinc-800 bg-zinc-950 text-zinc-400 text-[11px] uppercase tracking-wider">
                Normal
              </span>
            )}
          </div>

          {/* BULLETIN TITLE */}
          <h3 className={`text-lg font-bold uppercase tracking-wide mb-2 ${
            isUrgent ? "text-[#ff00ff] glitch-shadow-magenta" : "text-[#00f0ff]"
          }`}>
            {notice.title}
          </h3>

          {/* BULLETIN BODY */}
          <p className="text-zinc-400 text-sm leading-relaxed mb-4 whitespace-pre-wrap font-mono font-medium">
            {notice.body}
          </p>
        </div>

        {/* FOOTER ACTIONS AND DATE */}
        <div className="border-t border-zinc-800/80 pt-4 mt-auto flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            {/* DATE */}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-zinc-400" />
              {formattedDate}
            </span>
            {/* ID STAMP */}
            <span className="text-[10px] text-zinc-600 font-mono select-all">
              NODE::#{notice.id.substring(0, 8)}
            </span>
          </div>

          {/* ACTION INTERFACE PANEL */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onEdit(notice)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 border border-zinc-700 hover:border-[#00f0ff] hover:bg-[#00f0ff]/10 hover:text-[#00f0ff] text-zinc-300 font-bold uppercase tracking-wider text-[11px] transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modify</span>
            </button>

            <button
              onClick={() => onDelete(notice)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 border border-zinc-700 hover:border-red-500 hover:bg-red-950/20 hover:text-red-500 text-zinc-300 font-bold uppercase tracking-wider text-[11px] transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
