"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Library, 
  PlusCircle, 
  Settings, 
  LogOut, 
  Brain,
  Search,
  Sparkles,
  Zap
} from "lucide-react";

const navItems = [
  { name: "Home Dashboard", href: "/", icon: Home },
  { name: "Knowledge Library", href: "/library", icon: Library },
  { name: "Capture Link", href: "/save", icon: PlusCircle },
  { name: "Semantic Search", href: "/search", icon: Search },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <aside className="w-80 h-full border-r border-slate-800 bg-slate-900 flex flex-col relative z-30 shadow-2xl">
      {/* Brand area */}
      <div className="p-8 pb-10">
        <Link href="/" className="flex items-center gap-4 group">
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center shadow-2xl group-hover:border-indigo-500/60 transition-all"
          >
            <Brain className="w-8 h-8 text-indigo-400" />
          </motion.div>
          <div>
            <span className="font-black text-2xl block tracking-tighter text-white">Antigravity</span>
            <div className="flex items-center gap-1.5 mt-0.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.25em]">Neural Engine</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        <div className="px-5 mb-4">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Core Systems</span>
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-black transition-all relative group overflow-hidden ${
                  isActive 
                    ? "text-white shadow-lg" 
                    : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <item.icon className={`w-5 h-5 relative z-10 ${isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400"}`} />
                <span className="relative z-10 leading-none">{item.name}</span>
                
                {isActive && (
                   <motion.div
                     initial={{ opacity: 0, scale: 0 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="ml-auto relative z-10"
                   >
                     <Zap className="w-3 h-3 text-indigo-100 fill-indigo-100 shadow-sm" />
                   </motion.div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800/60 mt-auto bg-slate-950/20 backdrop-blur-sm">
        <motion.button
          whileHover={{ x: 4, color: "#f87171", backgroundColor: "rgba(239, 68, 68, 0.05)" }}
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-[13px] font-black text-slate-500 transition-all group"
        >
          <div className="p-2 border border-slate-800 rounded-lg group-hover:border-red-500/20">
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
          </div>
          Log Out System
        </motion.button>
      </div>
    </aside>
  );
}
