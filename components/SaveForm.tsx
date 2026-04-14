"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIcon, Plus, Sparkles, AlertCircle, CheckCircle2, Wand2 } from "lucide-react";

export default function SaveForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "processing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setStatus("saving");
    setErrorMsg("");

    try {
      // Step 1: Save Content
      const saveRes = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sourceUrl: url, 
          rawContent: url, // Required by backend validator
          type: 'link' 
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error);

      // Step 2: Trigger/Inform user AI is processing
      setStatus("processing");
      
      // Step 3: Call AI processing route (trigger background job)
      const aiRes = await fetch("/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: saveData.data._id }),
      });

      if (!aiRes.ok) console.warn("AI processing background start failed");

      // Visual feedback timing
      setTimeout(() => {
        setStatus("success");
        setUrl("");
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
          <p className="text-slate-400 font-medium text-sm ml-1">Paste any URL and let the engine extract the essence.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="relative group">
            <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-all duration-300" />
            <input
              type="url"
              placeholder="Paste YouTube, Instagram, or Web Link..."
              className="input-base w-full pl-14 h-16 text-lg tracking-tight font-medium shadow-inner"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01, boxShadow: "0 20px 40px -15px rgba(79, 70, 229, 0.4)" }}
            whileTap={{ scale: 0.99 }}
            disabled={loading || !url}
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
                 <div className="text-sm">Link Captured Successfully</div>
                 <div className="text-[11px] opacity-70 font-medium">AI analysis is running in the background.</div>
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
