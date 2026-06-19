import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { updateSettings } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { THEMES, WALLPAPERS, applyTheme, getWallpaperStyle } from "@/lib/themes";

export default function ThemesPage() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [savingTheme, setSavingTheme] = useState<string | null>(null);
  const [savingWallpaper, setSavingWallpaper] = useState<string | null>(null);
  const activeTheme = profile?.theme || "midnight";
  const activeWallpaper = profile?.chatWallpaper || "none";

  const handleTheme = async (themeId: string) => {
    if (!profile || themeId === activeTheme) return;
    setSavingTheme(themeId);
    // Apply immediately for instant visual feedback
    applyTheme(themeId);
    try {
      await updateSettings(profile.uid, { theme: themeId });
      await refreshProfile();
      toast({ title: `${THEMES.find(t => t.id === themeId)?.emoji} ${THEMES.find(t => t.id === themeId)?.name} theme applied!` });
    } catch {
      applyTheme(activeTheme); // revert on error
      toast({ title: "Failed to save theme", variant: "destructive" });
    } finally {
      setSavingTheme(null);
    }
  };

  const handleWallpaper = async (wallpaperId: string) => {
    if (!profile || wallpaperId === activeWallpaper) return;
    setSavingWallpaper(wallpaperId);
    try {
      await updateSettings(profile.uid, { chatWallpaper: wallpaperId });
      await refreshProfile();
      toast({ title: `Chat wallpaper updated!` });
    } catch {
      toast({ title: "Failed to save wallpaper", variant: "destructive" });
    } finally {
      setSavingWallpaper(null);
    }
  };

  return (
    <AppLayout showBottomNav={false}>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <Link href="/settings" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-xl font-bold leading-none">Themes & Wallpapers</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Personalise your Connect experience</p>
        </div>
      </header>

      <div className="p-4 pb-12 space-y-8">

        {/* ── Colour Themes ── */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Colour Theme</h2>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((theme, i) => {
              const isActive = activeTheme === theme.id;
              const isSaving = savingTheme === theme.id;
              return (
                <motion.button
                  key={theme.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleTheme(theme.id)}
                  disabled={!!savingTheme}
                  className={`relative overflow-hidden rounded-3xl transition-all duration-200 ${
                    isActive
                      ? "ring-2 ring-white/80 shadow-xl scale-[1.02]"
                      : "hover:scale-[1.01] hover:ring-1 hover:ring-white/30"
                  }`}
                >
                  {/* Gradient background */}
                  <div className={`bg-gradient-to-br ${theme.previewGradient} aspect-[3/2] w-full`}>
                    {/* Simulated chat bubbles */}
                    <div className="absolute inset-0 p-3 flex flex-col justify-end gap-1.5">
                      <div className="self-end bg-white/20 backdrop-blur-sm rounded-2xl rounded-br-sm px-3 py-1.5 max-w-[65%]">
                        <div className="h-1.5 w-12 bg-white/60 rounded-full" />
                      </div>
                      <div className="self-start bg-white/10 backdrop-blur-sm rounded-2xl rounded-bl-sm px-3 py-1.5 max-w-[55%]">
                        <div className="h-1.5 w-8 bg-white/50 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Active checkmark overlay */}
                  {isActive && !isSaving && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-4 h-4 text-black" />
                    </motion.div>
                  )}
                  {isSaving && (
                    <div className="absolute top-2 right-2 w-7 h-7 bg-black/40 rounded-full flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                  )}

                  {/* Label bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm py-2 px-3 flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">
                      {theme.emoji} {theme.name}
                    </span>
                    {isActive && (
                      <span className="text-[10px] text-white/80 bg-white/20 px-2 py-0.5 rounded-full">Active</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* ── Chat Wallpapers ── */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-1">Chat Wallpaper</h2>
          <p className="text-xs text-muted-foreground mb-3 px-1">Pattern applied to your chat background</p>
          <div className="grid grid-cols-4 gap-2">
            {WALLPAPERS.map((wp, i) => {
              const isActive = activeWallpaper === wp.id;
              const isSaving = savingWallpaper === wp.id;
              return (
                <motion.button
                  key={wp.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleWallpaper(wp.id)}
                  disabled={!!savingWallpaper}
                  className={`relative overflow-hidden rounded-2xl aspect-square transition-all ${
                    isActive
                      ? "ring-2 ring-white/80 scale-105"
                      : "hover:scale-105 hover:ring-1 hover:ring-white/30"
                  }`}
                >
                  {/* Background preview */}
                  <div
                    className="absolute inset-0 bg-card"
                    style={getWallpaperStyle(wp.id)}
                  />

                  {/* Active indicator */}
                  {isActive && !isSaving && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-primary/20"
                    >
                      <CheckCircle2 className="w-5 h-5 text-white drop-shadow" />
                    </motion.div>
                  )}
                  {isSaving && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                  )}

                  {/* Name */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-1">
                    <span className="text-white text-[9px] font-medium block text-center">{wp.name}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
