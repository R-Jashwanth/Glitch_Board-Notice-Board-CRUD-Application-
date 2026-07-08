import React, { useState, useEffect } from "react";
import Layout from "../components/Layout.tsx";
import NoticeCard, { Notice } from "../components/NoticeCard.tsx";
import NoticeForm from "../components/NoticeForm.tsx";
import DeleteModal from "../components/DeleteModal.tsx";
import { Terminal, Search, Filter, RotateCcw, AlertTriangle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function App() {
  const [route, setRoute] = useState<string>("/"); // "/" | "/notice/new" | "/notice/edit"
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [dbMode, setDbMode] = useState<string>("cloud");
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // System status toast logger
  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch all notices on launch or reload
  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/notices");
      if (!response.ok) {
        throw new Error(`CRITICAL_NETWORK_FAILURE: Status code ${response.status}`);
      }
      const data = await response.json();
      setNotices(data);

      // Extract system db connection status
      const mode = response.headers.get("x-database-mode") || "cloud";
      setDbMode(mode);
    } catch (err) {
      console.error("[SYS] Notice retrieval failure:", err);
      setError(String(err));
      showToast("FAILED TO ESTABLISH DATA STREAM WITH NODE CONTROLLER", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Create Notice Command
  const handleCreateNotice = async (noticeData: any) => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noticeData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.validationErrors) {
          const firstErr = Object.values(result.validationErrors)[0];
          throw new Error(String(firstErr));
        }
        throw new Error(result.error || "TRANSMISSION FAILED");
      }

      showToast("NOTICE BROADCAST SUCCESSFULLY INJECTED INTO PROTOCOL GRID");
      await fetchNotices();
      setRoute("/");
    } catch (err) {
      console.error("[SYS] Notice injection failed:", err);
      showToast(`DISPATCH REJECTED: ${(err as Error).message}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Notice Handler (Open form)
  const initiateEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setRoute("/notice/edit");
  };

  // Update Notice Command
  const handleUpdateNotice = async (noticeData: any) => {
    if (!editingNotice) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/notices/${editingNotice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noticeData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.validationErrors) {
          const firstErr = Object.values(result.validationErrors)[0];
          throw new Error(String(firstErr));
        }
        throw new Error(result.error || "UPDATE TRANSMISSION FAILED");
      }

      showToast(`NOTICE NODE #${editingNotice.id.substring(0, 8)} SUCCESSFULLY RE-WRITTEN`);
      await fetchNotices();
      setEditingNotice(null);
      setRoute("/");
    } catch (err) {
      console.error("[SYS] Rewrite transmission failed:", err);
      showToast(`REWRITE REJECTED: ${(err as Error).message}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Notice Dialog Trigger
  const initiateDelete = (notice: Notice) => {
    setNoticeToDelete(notice);
    setDeleteModalOpen(true);
  };

  // Purge Notice Command
  const handlePurgeNotice = async () => {
    if (!noticeToDelete) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/notices/${noticeToDelete.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "PURGE OPERATION REJECTED BY HOST");
      }

      showToast(`BULLETIN NODE #${noticeToDelete.id.substring(0, 8)} PURGED FROM GRID`);
      await fetchNotices();
      setDeleteModalOpen(false);
      setNoticeToDelete(null);
    } catch (err) {
      console.error("[SYS] Purge transmission failed:", err);
      showToast(`PURGE PROTOCOL REJECTED: ${(err as Error).message}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter and Search logic on notices array (Note: priority sorting is already done in Prisma on DB level!)
  const filteredNotices = notices.filter((notice) => {
    const matchesCategory = categoryFilter === "All" || notice.category === categoryFilter;
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout dbMode={dbMode}>
      {/* GLITCH TOAST OVERLAYS */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none max-w-sm w-full font-sans">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-4 border-2 flex items-start gap-2 backdrop-blur pointer-events-auto ${
                toast.type === "error"
                  ? "border-[#ff00ff] bg-black/90 text-[#ff00ff] neon-border-magenta"
                  : "border-[#00f0ff] bg-black/90 text-[#00f0ff] neon-border-cyan"
              }`}
            >
              <Terminal className="w-5 h-5 shrink-0 animate-pulse" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider">
                  {toast.type === "error" ? "SYSTEM_ALERT_ALARM" : "SYSTEM_LOG_TRANSMISSION"}
                </p>
                <p className="text-xs text-white/90 font-mono mt-0.5">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* RENDER PAGES DYNAMICALLY */}
      <AnimatePresence mode="wait">
        {route === "/" && (
          <motion.div
            key="list-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* TERMINAL STATUS BLOCK */}
            <div className="border border-zinc-800 bg-[#06060a] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cyan-500 animate-ping shrink-0" />
                <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
                  MATRIX TERMINAL ENG_READY // ACTIVE_NODES:{" "}
                  <span className="text-[#00f0ff] font-extrabold">{notices.length}</span>
                </p>
              </div>

              {/* SEARCH & FILTERS DOCK */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* SEARCH INPUT */}
                <div className="relative flex-1 md:flex-initial">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search transmissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 bg-black border border-zinc-800 focus:border-[#00f0ff] outline-none text-xs text-slate-100 font-mono transition-colors w-full md:w-48"
                  />
                </div>

                {/* CATEGORY FILTER */}
                <div className="flex items-center gap-1.5 bg-black border border-zinc-800 px-3 py-1 text-xs">
                  <Filter className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-transparent border-none outline-none font-mono text-zinc-300 text-xs py-0.5"
                  >
                    <option value="All">All Categories</option>
                    <option value="Exam">Exam Block</option>
                    <option value="Event">Event Block</option>
                    <option value="General">General</option>
                  </select>
                </div>

                {/* RELOAD BUTTON */}
                <button
                  onClick={fetchNotices}
                  className="p-1.5 border border-zinc-800 hover:border-[#00f0ff] text-zinc-400 hover:text-[#00f0ff] transition-all cursor-pointer"
                  title="Force Feed Refresh"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ERROR DISPATCH */}
            {error && (
              <div className="border-2 border-red-500 bg-red-950/20 p-6 flex flex-col md:flex-row items-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-red-500 uppercase tracking-widest">
                    GRID_CORE_COMMUNICATION_FAULT
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono mt-1">{error}</p>
                </div>
                <button
                  onClick={fetchNotices}
                  className="md:ml-auto px-4 py-2 border border-red-500 hover:bg-red-500 hover:text-black text-xs font-bold uppercase tracking-wider text-red-500 transition-colors cursor-pointer"
                >
                  Force Re-Sync
                </button>
              </div>
            )}

            {/* LOADING STATE */}
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-[#00f0ff] border-r-transparent rounded-full animate-spin" />
                </div>
                <p className="text-xs uppercase tracking-widest text-zinc-500 animate-pulse">
                  Querying database node sectors...
                </p>
              </div>
            ) : filteredNotices.length === 0 ? (
              /* EMPTY STATE */
              <div className="border-2 border-dashed border-zinc-800 py-24 px-6 text-center">
                <AlertTriangle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h4 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400 mb-1">
                  NO ACTIVE DISPATCH NODES FOUND
                </h4>
                <p className="text-xs text-zinc-500 font-mono max-w-sm mx-auto mb-6">
                  The current transmission feed is empty. Initialize communication channels by dispatching a new bulletin.
                </p>
                <button
                  onClick={() => setRoute("/notice/new")}
                  className="px-6 py-2.5 border border-[#00f0ff] hover:bg-[#00f0ff]/10 text-xs font-bold uppercase tracking-wider text-[#00f0ff] transition-all cursor-pointer"
                >
                  Inject First Bulletin
                </button>
              </div>
            ) : (
              /* RESPONSIVE NOTICES GRID */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotices.map((notice) => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    onEdit={initiateEdit}
                    onDelete={initiateDelete}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* CREATE ROUTE */}
        {route === "/notice/new" && (
          <motion.div
            key="new-page"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-2xl mx-auto"
          >
            <NoticeForm
              onSubmit={handleCreateNotice}
              isLoading={actionLoading}
              onCancel={() => setRoute("/")}
            />
          </motion.div>
        )}

        {/* EDIT ROUTE */}
        {route === "/notice/edit" && (
          <motion.div
            key="edit-page"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto"
          >
            <NoticeForm
              initialData={editingNotice}
              onSubmit={handleUpdateNotice}
              isLoading={actionLoading}
              onCancel={() => {
                setEditingNotice(null);
                setRoute("/");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE MODAL FOR NODE PURGING */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setNoticeToDelete(null);
        }}
        onConfirm={handlePurgeNotice}
        targetName={noticeToDelete?.title}
        isLoading={actionLoading}
      />
    </Layout>
  );
}
