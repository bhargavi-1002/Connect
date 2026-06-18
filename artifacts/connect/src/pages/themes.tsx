import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { updateSettings } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const themes = [
  { id: "midnight", name: "Midnight", color: "from-blue-900 to-indigo-900" },
  { id: "galaxy", name: "Galaxy", color: "from-purple-900 to-fuchsia-900" },
  { id: "sunset", name: "Sunset", color: "from-orange-600 to-rose-600" },
  { id: "ocean", name: "Ocean", color: "from-cyan-700 to-blue-700" },
  { id: "forest", name: "Forest", color: "from-green-800 to-emerald-800" },
  { id: "lavender", name: "Lavender", color: "from-violet-600 to-purple-600" },
  { id: "candy", name: "Candy", color: "from-pink-500 to-rose-500" },
  { id: "bubblegum", name: "Bubblegum", color: "from-fuchsia-500 to-pink-400" },
];

export default function ThemesPage() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);
  const active = profile?.theme || "midnight";

  const handleSelect = async (themeId: string) => {
    if (!profile || themeId === active) return;
    setSaving(themeId);
    try {
      await updateSettings(profile.uid, { theme: themeId });
      await refreshProfile();
      toast({ title: `${themes.find(t => t.id === themeId)?.name} theme applied!` });
    } catch {
      toast({ title: "Failed to apply theme", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <AppLayout showBottomNav={false}>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <Link href="/settings" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <h1 className="text-xl font-bold">Themes</h1>
      </header>

      <div className="p-4 pb-10">
        <p className="text-sm text-muted-foreground mb-6 px-1">Choose a theme for your chat experience.</p>

        <div className="grid grid-cols-2 gap-4">
          {themes.map((theme, i) => {
            const isActive = active === theme.id;
            const isSaving = saving === theme.id;
            return (
              <motion.button
                key={theme.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleSelect(theme.id)}
                disabled={!!saving}
                className={`relative overflow-hidden rounded-3xl aspect-[4/3] transition-all ${isActive ? "ring-2 ring-white shadow-lg scale-[1.02]" : "hover:scale-[1.01]"}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.color}`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {isSaving ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : isActive ? (
                    <CheckCircle2 className="w-8 h-8 text-white drop-shadow-lg" />
                  ) : null}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm py-2 px-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold text-sm">{theme.name}</span>
                    {isActive && <span className="text-[10px] text-white/80 bg-white/20 px-2 py-0.5 rounded-full">Active</span>}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
