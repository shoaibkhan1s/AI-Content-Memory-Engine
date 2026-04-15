"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Brain, 
  ExternalLink, 
  Trash2, 
  Sparkles, 
  MessageCircle,
  Clock,
  Tag,
  Share2,
  Trash,
  Save,
  Pencil,
  X
} from "lucide-react";

export default function ContentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editManual, setEditManual] = useState(false);
  const [manualDraft, setManualDraft] = useState("");
  const [editBody, setEditBody] = useState(false);
  const [bodyDraft, setBodyDraft] = useState("");
  const [editTitle, setEditTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/content/${id}`);
      const data = await res.json();
      if (data.success) {
        setItem(data.data.item);
        setManualDraft(data.data.item.manualNote || "");
        setBodyDraft(data.data.item.rawContent || "");
        setTitleDraft(data.data.item.title || "");
      }
    } catch (err) {
      console.error("Fetch detail error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (payload: any) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/content/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Update failed");
      setItem(data.data);
      return true;
    } catch (err) {
      console.error("Update error:", err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Hydrating Memory...</span>
    </div>
  );

  if (!item) return (
    <div className="text-center py-20 bg-slate-900/50 rounded-[3rem] border border-slate-800 border-dashed">
       <div className="text-4xl mb-4">🚫</div>
       <h2 className="text-2xl font-black text-white">Insight Not Found</h2>
       <button onClick={() => router.back()} className="mt-6 btn-ghost">Go Back</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Navigation */}
      <nav className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3">
           <button className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 transition-all">
              <Share2 className="w-5 h-5" />
           </button>
           <button className="p-3 rounded-xl bg-slate-900 border border-red-500/20 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all">
              <Trash2 className="w-5 h-5" />
           </button>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-10">
          <header className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">
                {item.category}
              </span>
              <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                {item.sourcePlatform || item.type}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">{item.title}</h1>
            <div className="flex items-center gap-6 text-slate-500">
               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <Clock className="w-4 h-4" /> Captured {new Date(item.createdAt).toLocaleDateString()}
               </div>
               {item.sourceUrl && (
                 <a 
                   href={item.sourceUrl} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                 >
                   Open Source <ExternalLink className="w-4 h-4" />
                 </a>
               )}
            </div>
          </header>

          <section className="glass p-8 md:p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl pointer-events-none" />
             
             {/* Manual Note */}
             <div className="space-y-4">
               <div className="flex items-center justify-between gap-4">
                 <h2 className="text-xl font-black flex items-center gap-3 text-white">
                   <Pencil className="w-5 h-5 text-emerald-400" /> Manual Note
                 </h2>
                 <div className="flex items-center gap-2">
                   {!editManual ? (
                     <button
                       onClick={() => setEditManual(true)}
                       className="px-3 h-9 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 text-xs font-black uppercase tracking-widest hover:border-slate-700"
                     >
                       Edit
                     </button>
                   ) : (
                     <>
                       <button
                         onClick={async () => {
                           const ok = await updateItem({ manualNote: manualDraft });
                           if (ok) setEditManual(false);
                         }}
                         disabled={saving}
                         className="px-3 h-9 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-black uppercase tracking-widest disabled:opacity-50"
                       >
                         <Save className="w-4 h-4 inline-block mr-2" />
                         Save
                       </button>
                       <button
                         onClick={() => {
                           setManualDraft(item.manualNote || "");
                           setEditManual(false);
                         }}
                         className="px-3 h-9 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 text-xs font-black uppercase tracking-widest hover:border-slate-700"
                       >
                         <X className="w-4 h-4 inline-block mr-2" />
                         Cancel
                       </button>
                     </>
                   )}
                   <button
                     onClick={async () => {
                       setManualDraft("");
                       const ok = await updateItem({ manualNote: "" });
                       if (ok) setEditManual(false);
                     }}
                     disabled={saving}
                     className="px-3 h-9 rounded-xl border border-red-500/20 bg-red-500/5 text-red-300/80 text-xs font-black uppercase tracking-widest disabled:opacity-50"
                   >
                     Delete
                   </button>
                 </div>
               </div>

               {editManual ? (
                 <textarea
                   className="input-base w-full min-h-[120px] p-4 bg-slate-900/50 border-slate-800 focus:border-emerald-400 text-white placeholder-slate-600 resize-none"
                   value={manualDraft}
                   onChange={(e) => setManualDraft(e.target.value)}
                   maxLength={2000}
                   disabled={saving}
                   placeholder="Write your manual note..."
                 />
               ) : (
                 <div className="text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                   {item.manualNote?.trim()?.length ? item.manualNote : "No manual note yet."}
                 </div>
               )}
             </div>

             <div className="pt-8 border-t border-slate-800/70" />

             <div className="space-y-4">
                <h2 className="text-xl font-black flex items-center gap-3 text-white">
                   <Sparkles className="w-5 h-5 text-indigo-400" /> AI Executive Summary
                </h2>
                <div className="text-slate-300 leading-relaxed font-medium text-lg whitespace-pre-wrap">
                  {item.summary || "This item is still being analyzed. Please check back in a moment."}
                </div>
             </div>

             <div className="pt-8 border-t border-slate-800 space-y-6">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Tag className="w-4 h-4" /> Intellectual Labels
                </h3>
                <div className="flex flex-wrap gap-2">
                   {item.tags?.map((tag: string) => (
                     <span key={tag} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-widest">
                       #{tag}
                     </span>
                   ))}
                </div>
             </div>
          </section>

          {/* Personal note body editor */}
          {item.type === "note" && (
            <section className="glass p-8 md:p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-black flex items-center gap-3 text-white">
                  <Pencil className="w-5 h-5 text-indigo-300" /> Personal Note
                </h2>
                <div className="flex items-center gap-2">
                  {!editTitle ? (
                    <button
                      onClick={() => setEditTitle(true)}
                      className="px-3 h-9 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 text-xs font-black uppercase tracking-widest hover:border-slate-700"
                    >
                      Title
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={async () => {
                          const ok = await updateItem({ title: titleDraft });
                          if (ok) setEditTitle(false);
                        }}
                        disabled={saving}
                        className="px-3 h-9 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-200 text-xs font-black uppercase tracking-widest disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 inline-block mr-2" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setTitleDraft(item.title || "");
                          setEditTitle(false);
                        }}
                        className="px-3 h-9 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 text-xs font-black uppercase tracking-widest hover:border-slate-700"
                      >
                        <X className="w-4 h-4 inline-block mr-2" />
                        Cancel
                      </button>
                    </>
                  )}

                  {!editBody ? (
                    <button
                      onClick={() => setEditBody(true)}
                      className="px-3 h-9 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 text-xs font-black uppercase tracking-widest hover:border-slate-700"
                    >
                      Body
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={async () => {
                          const ok = await updateItem({ rawContent: bodyDraft });
                          if (ok) setEditBody(false);
                        }}
                        disabled={saving}
                        className="px-3 h-9 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-200 text-xs font-black uppercase tracking-widest disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 inline-block mr-2" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setBodyDraft(item.rawContent || "");
                          setEditBody(false);
                        }}
                        className="px-3 h-9 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 text-xs font-black uppercase tracking-widest hover:border-slate-700"
                      >
                        <X className="w-4 h-4 inline-block mr-2" />
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editTitle ? (
                <input
                  className="input-base w-full h-12 px-4 bg-slate-900/50 border-slate-800 focus:border-indigo-400 text-white placeholder-slate-600"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  maxLength={200}
                  disabled={saving}
                  placeholder="Title..."
                />
              ) : (
                <div className="text-sm font-black text-slate-400 uppercase tracking-widest">
                  {item.title}
                </div>
              )}

              {editBody ? (
                <textarea
                  className="input-base w-full min-h-[220px] p-4 bg-slate-900/50 border-slate-800 focus:border-indigo-400 text-white placeholder-slate-600 resize-none"
                  value={bodyDraft}
                  onChange={(e) => setBodyDraft(e.target.value)}
                  maxLength={10000}
                  disabled={saving}
                  placeholder="Write your note..."
                />
              ) : (
                <div className="text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                  {item.rawContent}
                </div>
              )}
            </section>
          )}

          {/* AI Questions */}
          {item.aiQuestions?.length > 0 && (
            <section className="space-y-6">
               <h2 className="text-xl font-black flex items-center gap-3 text-white">
                  <MessageCircle className="w-6 h-6 text-purple-400" /> Critical Recall Questions
               </h2>
               <div className="grid grid-cols-1 gap-4">
                  {item.aiQuestions.map((q: string, i: number) => (
                    <motion.div 
                      key={i}
                      whileHover={{ x: 5 }}
                      className="glass p-6 rounded-3xl border border-slate-800/80 bg-slate-900/40 relative overflow-hidden group"
                    >
                       <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors" />
                       <p className="text-slate-300 font-bold leading-relaxed">{q}</p>
                    </motion.div>
                  ))}
               </div>
            </section>
          )}
        </div>

        {/* Sidebar info */}
        <aside className="lg:col-span-4 space-y-8">
           <div className="glass p-8 rounded-[2rem] border border-slate-800 space-y-6">
              <div className="space-y-1 text-center pb-6 border-b border-slate-800">
                 <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Importance Score</div>
                 <div className="text-5xl font-black text-indigo-500">{item.importanceScore}<span className="text-xl text-slate-700">/10</span></div>
              </div>
              
              <div className="space-y-6">
                 <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Intelligence Metadata</div>
                    <div className="space-y-3">
                       <div className="flex items-center justify-between text-xs font-bold text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-800/40">
                          <span className="text-slate-500">Status</span>
                          <span className="text-emerald-500 uppercase tracking-widest">{item.status}</span>
                       </div>
                       <div className="flex items-center justify-between text-xs font-bold text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-800/40">
                          <span className="text-slate-500">Duplicate Check</span>
                          <span>{item.isDuplicate ? "Yes" : "Unique Memory"}</span>
                       </div>
                    </div>
                 </div>

                 <button className="btn-primary w-full h-14 font-black flex items-center justify-center gap-3">
                    <Brain className="w-5 h-5" /> Start Recall Practice
                 </button>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
