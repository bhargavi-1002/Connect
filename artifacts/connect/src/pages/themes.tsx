import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { motion } from "framer-motion";

const themes = [
  { id: "midnight", name: "Midnight", color: "from-blue-900 to-indigo-900", active: true },
  { id: "galaxy", name: "Galaxy", color: "from-purple-900 to-fuchsia-900", active: false },
  { id: "sunset", name: "Sunset", color: "from-orange-600 to-rose-600", active: false },
  { id: "ocean", name: "Ocean", color: "from-cyan-600 to-blue-800", active: false },
  { id: "forest", name: "Forest", color: "from-emerald-700 to-teal-900", active: false },
  { id: "lavender", name: "Lavender", color: "from-violet-500 to-purple-700", active: false },
];

export default function ThemesPage() {
  const [activeTab, setActiveTab] = useState("themes");
  const [activeTheme, setActiveTheme] = useState("midnight");

  return (
    <AppLayout showBottomNav={false}>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <Link href="/settings" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <h1 className="text-xl font-bold">Themes & Wallpapers</h1>
      </header>

      <div className="p-4">
        <div className="flex p-1 bg-surface rounded-full mb-6">
          <button 
            className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all ${activeTab === 'themes' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('themes')}
          >
            Themes
          </button>
          <button 
            className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all ${activeTab === 'wallpapers' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('wallpapers')}
          >
            Wallpapers
          </button>
        </div>

        {activeTab === 'themes' && (
          <div className="grid grid-cols-2 gap-4">
            {themes.map((theme, i) => (
              <motion.button
                key={theme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setActiveTheme(theme.id)}
                className={`relative aspect-[3/4] rounded-3xl p-4 flex flex-col justify-end text-left overflow-hidden border-2 transition-all ${activeTheme === theme.id ? 'border-primary glowing-primary scale-[1.02]' : 'border-white/5 hover:border-white/20'}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.color} opacity-80`} />
                <div className="absolute inset-0 bg-black/20" />
                
                {activeTheme === theme.id && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <h3 className="relative z-10 font-bold text-white text-lg drop-shadow-md">
                  {theme.name}
                </h3>
              </motion.button>
            ))}
          </div>
        )}

        {activeTab === 'wallpapers' && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Wallpapers Coming Soon</h3>
            <p className="text-muted-foreground max-w-[250px]">
              We're preparing magical new backgrounds for your chats.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
