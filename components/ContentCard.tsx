"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Play, 
  Camera, 
  Link as LinkIcon, 
  FileText, 
  Lightbulb, 
  Code,
  Calendar,
  Layers,
  Brain,
  ExternalLink
} from "lucide-react";

interface ContentCardProps {
  item: {
    _id: string;
    type: string;
    title: string;
    summary: string;
    category: string;
    tags: string[];
    createdAt: string;
    processingStatus: string;
    importanceScore: number;
    sourcePlatform?: string;
    sourceUrl?: string; // Added to enable Visit Source link
    thumbnailUrl?: string;
  };
}

const getPlatformIcon = (platform?: string, type?: string) => {
  if (platform?.toLowerCase().includes("youtube")) return <Play className="w-4 h-4 text-red-500 fill-red-500/20" />;
  if (platform?.toLowerCase().includes("instagram")) return <Camera className="w-4 h-4 text-pink-500" />;
  if (type === "note") return <FileText className="w-4 h-4 text-blue-400" />;
  if (type === "idea") return <Lightbulb className="w-4 h-4 text-amber-400" />;
  if (type === "snippet") return <Code className="w-4 h-4 text-purple-400" />;
  return <LinkIcon className="w-4 h-4 text-slate-400" />;
};

export default function ContentCard({ item }: ContentCardProps) {
  const isProcessing = item.processingStatus === "processing";

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      className="glass p-6 rounded-3xl border border-slate-800/60 hover:border-indigo-500/30 transition-all flex flex-col h-full group relative overflow-hidden"
    >
      {isProcessing && (
        <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500 overflow-hidden">
          <motion.div 
             animate={{ x: ["-100%", "100%"] }}
             transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
             className="w-1/2 h-full bg-indigo-300"
          />
        </div>
      )}

      {/* Thumbnail */}
      {item.thumbnailUrl && (
        <div className="mb-5 -mt-2">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/40">
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 shadow-inner group-hover:scale-110 transition-transform">
            {getPlatformIcon(item.sourcePlatform, item.type)}
          </div>
          <div className="space-y-0.5">
             <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{item.category}</div>
             <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                <Calendar className="w-3 h-3" />
                {new Date(item.createdAt).toLocaleDateString()}
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/50 rounded-lg border border-slate-800">
           <Layers className="w-3 h-3 text-slate-500" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.type}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3">
        <Link href={`/content/${item._id}`}>
          <h3 className="text-lg font-black text-slate-100 hover:text-indigo-400 transition-colors leading-tight line-clamp-2">
            {item.title}
          </h3>
        </Link>
        <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-3">
          {item.summary || "No summary available yet. Analysis might be in progress."}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-5 border-t border-slate-800/60 space-y-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {item.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-indigo-500/5 border border-indigo-500/10 rounded flex items-center text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest">
              #{tag}
            </span>
          ))}
          {item.tags?.length > 3 && (
            <span className="text-[9px] text-slate-500 font-bold flex items-center pr-1">+{item.tags.length - 3} MORE</span>
          )}
        </div>

        <div className="flex items-center justify-between">
           <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full ${i < (item.importanceScore / 2) ? 'bg-indigo-400' : 'bg-slate-800'}`} 
                />
              ))}
           </div>
           
           <div className="flex items-center gap-3">
             {item.sourceUrl && (
               <a 
                 href={item.sourceUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-[11px] font-black text-slate-400 hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors"
               >
                 Source <ExternalLink className="w-3 h-3" />
               </a>
             )}
             <Link href={`/content/${item._id}`}>
               <motion.button
                 whileHover={{ scale: 1.05, x: 2 }}
                 whileTap={{ scale: 0.95 }}
                 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 group/btn"
               >
                  Open Engine <Brain className="w-3 h-3 group-hover/btn:scale-125 transition-transform" />
               </motion.button>
             </Link>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
