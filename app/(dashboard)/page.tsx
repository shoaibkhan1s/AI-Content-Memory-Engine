"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, Brain, ChevronRight, LayoutGrid, Clock } from "lucide-react";
import SaveForm from "@/components/SaveForm";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Header */}
      <section className="relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            <Zap className="w-3 h-3 fill-indigo-400" /> Neural Link Active
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Your Memory, <br />
            <span className="text-indigo-500">Augmented.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl font-medium leading-relaxed">
            The Content Memory Engine helps you capture, analyze, and recall everything you read or watch. Ready to expand your second brain?
          </p>
        </motion.div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-7"
        >
          <SaveForm />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-5 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-purple-400" /> Recent Intelligent Links
            </h3>
            <Link href="/library" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-all hover:translate-x-1">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i} 
                whileHover={{ x: 8, backgroundColor: "rgba(30, 41, 59, 1)" }}
                className="glass p-5 rounded-2xl border border-slate-800/50 hover:border-indigo-500/30 transition-all cursor-pointer group flex items-start justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">YouTube</span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <Clock className="w-3 h-3" /> 2h ago
                    </span>
                  </div>
                  <div className="font-bold text-slate-100 group-hover:text-white transition-colors line-clamp-1">Understanding React 19 Compiler and Server Actions</div>
                  <div className="flex gap-1">
                    {["react", "coding"].map(tag => (
                      <span key={tag} className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">#{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:bg-indigo-600 transition-all shadow-inner shrink-0 scale-90 group-hover:scale-100">
                  <Brain className="w-6 h-6 text-slate-400 group-hover:text-white" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="glass p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-3 bg-indigo-600/5 border-dashed">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
               <LayoutGrid className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="space-y-1">
               <div className="text-sm font-bold text-slate-200">Organize your data</div>
               <div className="text-xs text-slate-500 max-w-[200px] leading-relaxed">Create collections to group related insights and bookmarks.</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
