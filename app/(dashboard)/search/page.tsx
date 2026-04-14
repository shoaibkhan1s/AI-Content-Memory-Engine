"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Sparkles, 
  Brain, 
  Loader2, 
  Target,
  Zap,
  Info
} from "lucide-react";
import ContentCard from "@/components/ContentCard";

export default function SemanticSearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Note: For a true semantic search bar, you would need an endpoint 
  // that converts user query -> embedding, then compares on server.
  // For now, we will use the improved text search which has relevance scoring.
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setHasSearched(true);
    
    try {
      const res = await fetch(`/api/content?search=${encodeURIComponent(query)}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data.items);
      }
    } catch (err) {
      console.error("Semantic search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <section className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-xs uppercase tracking-[0.2em]"
        >
          <Sparkles className="w-4 h-4 fill-indigo-400" /> Powered by Neural Embeddings
        </motion.div>
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Search by <span className="text-indigo-500 underline underline-offset-8 decoration-indigo-500/30">Meaning.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            Forget keywords. Search your library using natural language and find deep connections across your entire memory base.
          </p>
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSearch}
          className="max-w-3xl mx-auto relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200" />
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              autoFocus
              type="text"
              placeholder="e.g. 'How can I improve my React performance with caching?'"
              className="input-base w-full pl-16 pr-32 h-20 text-xl font-medium bg-slate-900 border-2 border-slate-800 rounded-[2rem] shadow-2xl focus:border-indigo-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading || !query}
              className="absolute right-4 top-1/2 -translate-y-1/2 btn-primary h-12 px-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze"}
            </button>
          </div>
        </motion.form>
      </section>

      {/* Results */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {!hasSearched ? (
            <motion.div 
              key="guide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
               {[
                 { icon: Target, title: "Deep Intent", desc: "Finds what you actually mean, not just the words you use." },
                 { icon: Brain, title: "Cross-Topic", desc: "Discovers links between unrelated platforms like YT and Insta." },
                 { icon: Zap, title: "Real-time", desc: "Contextual results updated as your AI processing finishes." },
               ].map((item, idx) => (
                 <div key={idx} className="glass p-8 rounded-[2rem] border border-slate-800/40 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                       <item.icon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="space-y-1">
                       <h3 className="font-bold text-slate-200">{item.title}</h3>
                       <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </motion.div>
          ) : loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 space-y-6"
            >
               <div className="relative">
                  <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-400 animate-pulse" />
               </div>
               <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-200">Neural Engines Ramping...</h3>
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mt-2">Semantic Mapping in Progress</p>
               </div>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div 
               key="results"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-8"
            >
               <div className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Showing Top {results.length} Contextual Matches</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {results.map((item: any) => (
                   <ContentCard key={item._id} item={item} />
                 ))}
               </div>
            </motion.div>
          ) : (
            <motion.div 
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 space-y-6 glass border-dashed rounded-[3rem]"
            >
               <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800">
                  <span className="text-4xl">🔎</span>
               </div>
               <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold text-white">No Semantic Matches</h3>
                  <p className="text-sm text-slate-500 font-medium italic">"Try a different phrasing or save more content first."</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
