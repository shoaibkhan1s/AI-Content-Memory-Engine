"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";

type SettingsData = {
  email: string;
  preferences: {
    reminderTime: string;
    timezone: string;
    emailReminders: boolean;
  };
  reminderSettings: {
    enabled: boolean;
    frequency: "daily" | "every 2 days" | "weekly";
    lastReminderSentAt?: string | null;
  };
};

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/settings");
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const save = async (patch: any) => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Update failed");
      if (json.data) setData(json.data);
      setMsg("Saved");
      setTimeout(() => setMsg(""), 1500);
    } catch (e: any) {
      setMsg(e.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-slate-400 font-bold">Failed to load settings.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest leading-none">
            Preferences
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-indigo-400" /> Settings
          </h1>
          <p className="text-slate-400 font-medium">Control reminders and notifications.</p>
        </div>
        {msg && (
          <div
            className={`px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-widest ${
              msg === "Saved"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {msg}
          </div>
        )}
      </div>

      <div className="glass p-8 rounded-[2.5rem] border border-slate-800 space-y-8">
        <div className="flex items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-sm font-black text-white uppercase tracking-widest">
              Email reminders
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Max 1 email/day. Only sent when enabled.
            </div>
          </div>
          <input
            type="checkbox"
            className="h-5 w-5 accent-indigo-500"
            checked={!!data.preferences.emailReminders}
            disabled={saving}
            onChange={(e) =>
              save({ preferences: { emailReminders: e.target.checked } })
            }
          />
        </div>

        <div className="flex items-center justify-between gap-6 pt-6 border-t border-slate-800/70">
          <div className="space-y-1">
            <div className="text-sm font-black text-white uppercase tracking-widest">
              Reminder engine
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Enables due-review selection for reminders.
            </div>
          </div>
          <input
            type="checkbox"
            className="h-5 w-5 accent-indigo-500"
            checked={!!data.reminderSettings.enabled}
            disabled={saving}
            onChange={(e) => save({ reminderSettings: { enabled: e.target.checked } })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800/70">
          <div className="space-y-2">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
              Frequency
            </div>
            <select
              className="input-base w-full h-12 bg-slate-900/50 border-slate-800"
              value={data.reminderSettings.frequency}
              disabled={saving}
              onChange={(e) =>
                save({ reminderSettings: { frequency: e.target.value } })
              }
            >
              <option value="daily">Daily</option>
              <option value="every 2 days">Every 2 days</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
              Reminder time (HH:MM)
            </div>
            <input
              className="input-base w-full h-12 bg-slate-900/50 border-slate-800"
              value={data.preferences.reminderTime || "09:00"}
              disabled={saving}
              onChange={(e) => setData({ ...data, preferences: { ...data.preferences, reminderTime: e.target.value } })}
              onBlur={() => save({ preferences: { reminderTime: data.preferences.reminderTime } })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
              Timezone
            </div>
            <input
              className="input-base w-full h-12 bg-slate-900/50 border-slate-800"
              value={data.preferences.timezone || "Asia/Kolkata"}
              disabled={saving}
              onChange={(e) => setData({ ...data, preferences: { ...data.preferences, timezone: e.target.value } })}
              onBlur={() => save({ preferences: { timezone: data.preferences.timezone } })}
              placeholder="e.g. Asia/Kolkata"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-slate-500 font-medium pt-2"
        >
          Signed in as <span className="text-slate-300 font-bold">{data.email}</span>
        </motion.div>
      </div>
    </div>
  );
}

