"use client";

import SaveForm from "@/components/SaveForm";

export default function SavePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest leading-none mb-4">
         New Knowledge
      </div>
      <SaveForm />
    </div>
  );
}
