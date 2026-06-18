import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { updateSettings } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";

const timeOptions = [
  { label: "5 min", value: 5 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hr", value: 60 },
];

export default function AutoLogoutPage() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const currentMinutes = profile?.autoLogoutMinutes ?? 15;
  const enabled = currentMinutes > 0;

  const handleToggle = async (on: boolean) => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateSettings(profile.uid, { autoLogoutMinutes: on ? 15 : 0 });
      await refreshProfile();
      toast({ title: on ? "Auto logout enabled" : "Auto logout disabled" });
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = async (minutes: number) => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateSettings(profile.uid, { autoLogoutMinutes: minutes });
      await refreshProfile();
      toast({ title: `Auto logout set to ${minutes} min` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout showBottomNav={false}>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <Link href="/settings" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <h1 className="text-xl font-bold">Auto Logout</h1>
        {saving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />}
      </header>

      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-[17px]">Auto Logout</h3>
              <p className="text-sm text-muted-foreground mt-1">Automatically sign out after inactivity on shared computers</p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={saving}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </motion.div>

        {enabled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 rounded-3xl"
          >
            <h3 className="font-bold text-white mb-4">Logout After</h3>
            <div className="grid grid-cols-2 gap-3">
              {timeOptions.map(opt => (
                <button
                  key={opt.value}
                  disabled={saving}
                  onClick={() => handleTimeChange(opt.value)}
                  className={`p-4 rounded-2xl text-center font-semibold transition-all ${
                    currentMinutes === opt.value
                      ? "bg-gradient-to-br from-primary to-secondary text-white shadow-[0_0_15px_rgba(124,77,255,0.3)]"
                      : "glass-card text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="glass-card p-5 rounded-3xl border-warning/20">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center text-warning flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-warning text-sm">Security Tip</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Enable auto logout when using shared or public computers to protect your messages and family connections.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
