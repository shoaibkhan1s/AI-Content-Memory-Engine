"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/");
      } else {
        setError(data.error || "Invalid login credentials");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative bg-[#0F172A] flex items-center justify-center p-4 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl mb-6 relative group cursor-pointer"
          >
            <div className="absolute inset-0 rounded-3xl bg-indigo-500/10 blur-xl group-hover:bg-indigo-500/20 transition-all" />
            <Brain className="w-10 h-10 text-indigo-400 relative z-10" />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-gray-100 tracking-tight mb-2">Welcome Back</h1>
          <p className="text-slate-400 font-medium tracking-wide">Sync your memory to the cloud</p>
        </div>

        <div className="glass p-8 rounded-3xl shadow-2xl relative">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="input-base w-full pl-12 h-12"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input-base w-full pl-12 h-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="btn-primary w-full h-12 flex items-center justify-center gap-2 mt-4 text-base font-bold"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Connect Sense <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-700/50">
            <p className="text-sm text-slate-500 font-medium">
              New to Antigravity?{" "}
              <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4 font-semibold">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
