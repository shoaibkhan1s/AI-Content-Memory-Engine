"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIcon, Plus, Sparkles, AlertCircle, CheckCircle2, Wand2, FileText } from "lucide-react";

export default function SaveForm() {
  const [mode, setMode] = useState<"link" | "note">("link");
  const [url, setUrl] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [runAI, setRunAI] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "processing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "link" && !url) return;
    if (mode === "note" && !noteBody.trim()) return;

    setLoading(true);
    setStatus("saving");
    setErrorMsg("");

    try {
      // Step 1: Save Content
      const saveRes = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sourceUrl: mode === "link" ? url : undefined, 
          rawContent: mode === "link" ? url : noteBody.trim(), // Required by backend validator
          type: mode === "link" ? 'link' : 'note',
          title: mode === "note" && noteTitle.trim() ? noteTitle.trim() : undefined,
          manualNote: manualNote?.trim() ? manualNote.trim() : undefined,
          runAI,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error);

      // Step 2: Inform user AI is processing only if enabled
      setStatus(runAI ? "processing" : "success");

      // Visual feedback timing
      setTimeout(() => {
        setStatus("success");
        setUrl("");
        setNoteTitle("");
        setNoteBody("");
        setManualNote("");
        setLoading(false);
        setTimeout(() => setStatus("idle"), 4000);
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save content");
      setStatus("error");
      setLoading(false);
    }
  };

  return (
    <div className="glass p-10 rounded-[2.5rem] border border-slate-700/50 shadow-2xl overflow-hidden relative min-h-[400px] flex flex-col justify-center">
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none rounded-full" />
      
      <AnimatePresence>
        {status === "processing" && (
          <motion.div 
            initial={{ left: "-100%" }} 
            animate={{ left: "100%" }} 
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute top-0 w-1/2 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent z-20"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-sm">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Capture Information</h2>
          </div>
          <p className="text-slate-400 font-medium text-sm ml-1">Save a link or write your own personal note.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6 relative z-30">
          <div className="flex items-center gap-2 p-2 rounded-2xl border border-slate-800 bg-slate-900/40">
            <button
              type="button"
              onClick={() => setMode("link")}
              disabled={loading}
              className={`flex-1 h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                mode === "link"
                  ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-300"
                  : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
              }`}
            >
              Link
            </button>
            <button
              type="button"
              onClick={() => setMode("note")}
              disabled={loading}
              className={`flex-1 h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                mode === "note"
                  ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-300"
                  : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
              }`}
            >
              Personal Note
            </button>
          </div>

          {mode === "link" ? (
            <div className="relative group z-30">
              <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-all duration-300 z-10" />
              <input
                type="url"
                placeholder="Paste YouTube, Instagram, or Web Link..."
                className="input-base w-full pl-14 h-16 text-lg tracking-tight font-medium shadow-inner relative z-30 bg-slate-800/80 focus:bg-slate-800 border-slate-600 focus:border-indigo-400 text-white placeholder-slate-400"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <FileText className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Title (optional)"
                  className="input-base w-full pl-14 h-14 text-base font-bold shadow-inner bg-slate-800/70 border-slate-700 focus:border-indigo-400 text-white placeholder-slate-500"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  disabled={loading}
                  maxLength={200}
                />
              </div>
              <textarea
                placeholder="Write your note..."
                className="input-base w-full min-h-[160px] p-4 bg-slate-800/60 border-slate-700 focus:border-indigo-400 text-white placeholder-slate-500 resize-none"
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                disabled={loading}
                maxLength={10000}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
              Manual Note (optional)
            </div>
            <textarea
              placeholder="Add your own context, why you saved it, key takeaways..."
              className="input-base w-full min-h-[110px] p-4 bg-slate-800/60 border-slate-700 focus:border-indigo-400 text-white placeholder-slate-500 resize-none"
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
              disabled={loading}
              maxLength={2000}
            />
          </div>

          <label className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="space-y-0.5">
              <div className="text-xs font-black text-slate-200 uppercase tracking-widest">Run AI analysis</div>
              <div className="text-[11px] text-slate-500 font-medium">
                Only runs when you save (never on refresh).
              </div>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 accent-indigo-500"
              checked={runAI}
              onChange={(e) => setRunAI(e.target.checked)}
              disabled={loading}
            />
          </label>

          <motion.button
            whileHover={{ scale: 1.01, boxShadow: "0 20px 40px -15px rgba(79, 70, 229, 0.4)" }}
            whileTap={{ scale: 0.99 }}
            disabled={loading || (mode === "link" ? !url : !noteBody.trim())}
            className="btn-primary w-full h-16 text-lg font-black flex items-center justify-center gap-3 disabled:opacity-40 disabled:grayscale transition-all"
          >
            {status === "saving" && <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />}
            {status === "processing" && <Wand2 className="w-6 h-6 animate-pulse text-indigo-200" />}
            {status === "idle" && <Plus className="w-6 h-6 stroke-[3]" />}
            
            <span className="tracking-wide">
              {status === "idle" ? "Save to Brain" : status.toUpperCase() + "..."}
            </span>
          </motion.button>
        </form>

        <AnimatePresence mode="wait">
          {status === "success" && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 text-emerald-400 font-bold shadow-sm"
            >
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                 <div className="text-sm">{mode === "link" ? "Link Captured Successfully" : "Note Saved Successfully"}</div>
                 <div className="text-[11px] opacity-70 font-medium">
                   {runAI ? "AI analysis is running in the background." : "Saved without AI analysis."}
                 </div>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400 font-bold shadow-sm"
            >
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                 <div className="text-sm">Capture Failed</div>
                 <div className="text-[11px] opacity-70 font-medium">{errorMsg}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
