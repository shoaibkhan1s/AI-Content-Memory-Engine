"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Loader2, 
  Inbox,
  ArrowUpDown,
  Sparkles
} from "lucide-react";
import ContentCard from "@/components/ContentCard";

export default function LibraryPage() {
  const [items, setItems] = useState([]);
  const [categoriesList, setCategoriesList] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategoriesList(["all", ...data.data]);
      }
    } catch(err) {
      console.error("Categories fetch error:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);


  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (category !== "all") query.append("category", category);
      
      const res = await fetch(`/api/content?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items);
      }
    } catch (err) {
      console.error("Library fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchLibrary, 500);
    return () => clearTimeout(timer);
  }, [search, category]);

  // Transform flat items into hierarchical structure: Map<Category, Map<Subcategory, Item[]>>
  const groupedItems = items.reduce((acc: Record<string, Record<string, any[]>>, item: any) => {
    const catName = item.category || "Uncategorized";
    const subCatName = item.subcategory || "General";
    
    if (!acc[catName]) acc[catName] = {};
    if (!acc[catName][subCatName]) acc[catName][subCatName] = [];
    
    acc[catName][subCatName].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest leading-none">
             Archived Knowledge
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Your Intelligence <span className="text-indigo-500">Vault.</span></h1>
          <p className="text-slate-400 font-medium">Browse through your processed thoughts and research.</p>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => setView("grid")}
             className={`p-3 rounded-xl border transition-all ${view === 'grid' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
           >
             <LayoutGrid className="w-5 h-5" />
           </button>
           <button 
             onClick={() => setView("list")}
             className={`p-3 rounded-xl border transition-all ${view === 'list' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
           >
             <List className="w-5 h-5" />
           </button>
        </div>
      </section>

      {/* Filters Bar */}
      <div className="glass p-3 rounded-2xl border border-slate-800/60 flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full lg:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text"
            placeholder="Search keywords, titles, or tags..."
            className="input-base w-full pl-12 h-12 bg-slate-950/30 border-slate-800/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
           <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 mr-1 shrink-0">
              <Filter className="w-4 h-4 text-slate-500" />
           </div>
           {categoriesList.map((cat) => (
             <button
               key={cat}
               onClick={() => setCategory(cat)}
               className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shrink-0 border ${
                 category === cat 
                   ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-400" 
                   : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
               }`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      {/* Grid */}
      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Syncing Vault...</span>
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-16">
            <AnimatePresence>
               {Object.entries(groupedItems).map(([catName, subcategories]) => (
                <motion.div key={catName} layout className="space-y-8">
                  {/* Category Header */}
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-black text-white">{catName}</h2>
                    <div className="flex-1 h-px bg-slate-800"></div>
                  </div>

                  {/* Subcategories */}
                  <div className="space-y-10 pl-2 lg:pl-6">
                    {Object.entries(subcategories).map(([subCatName, subItems]) => (
                      <div key={`${catName}-${subCatName}`} className="space-y-5">
                        <h3 className="text-sm font-black tracking-widest text-indigo-400 uppercase flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-indigo-500"></span> {subCatName}
                        </h3>
                        
                        <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3' : 'grid-cols-1'}`}>
                          {subItems.map((item: any) => (
                            <motion.div
                              key={item._id}
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ContentCard item={item} />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 rounded-[3rem] border border-slate-800/50 border-dashed space-y-6">
            <div className="w-20 h-20 bg-slate-800 rounded-[2.5rem] flex items-center justify-center border border-slate-700">
               <Inbox className="w-10 h-10 text-slate-600" />
            </div>
            <div className="space-y-1 text-center">
               <h3 className="text-xl font-bold text-slate-200">The Vault is Empty</h3>
               <p className="text-sm text-slate-500 font-medium max-w-sm">We couldn't find any intelligence matching your filters. Try adjusting your search.</p>
            </div>
            <button 
              onClick={() => { setSearch(""); setCategory("all"); }}
              className="btn-ghost flex items-center gap-2"
            >
               <Sparkles className="w-4 h-4" /> Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
