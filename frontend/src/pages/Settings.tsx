import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Bell, Eye, Shield, Cpu, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Settings: React.FC = () => {
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [aiCoachLevel, setAiCoachLevel] = useState('Coaching'); // Coaching, Mild, Silent
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setSuccessMsg(false);
    
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg(true);
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">System Settings</h1>
          <p className="text-slate-400 text-xs mt-1">Configure preferences, alerts, and AI coach options.</p>
        </div>
        <Button onClick={handleSave} isLoading={isSaving} className="py-2 px-5 text-xs font-bold">
          Save Preferences
        </Button>
      </div>

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center font-bold"
        >
          Preferences updated successfully!
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Navigation Tabs (Simulated Sidebar Tabs) */}
        <GlassCard className="md:col-span-1 p-4 space-y-1 select-none">
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-primary-light bg-primary/10 flex items-center gap-2.5">
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-slate-200 flex items-center gap-2.5 transition-all">
            <Cpu className="w-4 h-4" /> AI Preferences
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-slate-200 flex items-center gap-2.5 transition-all">
            <Eye className="w-4 h-4" /> Display Theme
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-slate-200 flex items-center gap-2.5 transition-all">
            <Shield className="w-4 h-4" /> Security
          </button>
        </GlassCard>

        {/* Settings Panels (2 cols) */}
        <div className="md:col-span-2 space-y-8">
          {/* Notifications config */}
          <GlassCard className="space-y-6">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 border-b border-white/5 pb-3">
              <Bell className="w-4.5 h-4.5 text-primary-light" /> Alert Config
            </h3>

            <div className="space-y-4">
              {/* Email notifications */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Email Alerts</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Receive daily consistency summaries via email.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={emailNotif}
                    onChange={(e) => setEmailNotif(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white peer-checked:after:border-transparent border border-white/10" />
                </label>
              </div>

              {/* Push notifications */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Browser Push Notifications</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Receive instant desktop reminders to complete active habits.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pushNotif}
                    onChange={(e) => setPushNotif(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white peer-checked:after:border-transparent border border-white/10" />
                </label>
              </div>

              {/* Weekly Digest */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Weekly Performance Digest</h4>
                  <p className="text-[10px] text-slate-500 mt-1">A weekly analytics email tracking progress over past weeks.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white peer-checked:after:border-transparent border border-white/10" />
                </label>
              </div>
            </div>
          </GlassCard>

          {/* AI Coach Preferences */}
          <GlassCard className="space-y-6">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 border-b border-white/5 pb-3">
              <Cpu className="w-4.5 h-4.5 text-accent-light" /> AI Coach Settings
            </h3>

            <div className="space-y-4">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-2">Coaching Mode Intensity</p>
              
              <div className="grid grid-cols-3 gap-3">
                {['Coaching', 'Mild', 'Silent'].map((mode) => {
                  const isActive = aiCoachLevel === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => setAiCoachLevel(mode)}
                      className={`py-2 px-3 rounded-xl border text-2xs font-bold transition-all text-center select-none ${
                        isActive
                          ? 'bg-accent/10 border-accent text-accent-light scale-[1.02]'
                          : 'bg-slate-950/20 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed mt-4 bg-slate-950/30 p-3 rounded-xl border border-white/5 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-accent-light flex-shrink-0 mt-0.5" />
                <span>
                  {aiCoachLevel === 'Coaching' && 'Coaching Mode: The AI will proactively analyze patterns and alert you of slumps, progress warnings, and financial alerts.'}
                  {aiCoachLevel === 'Mild' && 'Mild Mode: Receives coaching advice only on large weekly milestones or critical spending overages.'}
                  {aiCoachLevel === 'Silent' && 'Silent Mode: AI insights panel will be hidden on the dashboard, keeping all alerts silent.'}
                </span>
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
export default Settings;
