import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

export default function AutoLogoutPage() {
  const [enabled, setEnabled] = useState(true);
  const [time, setTime] = useState(15);
  
  const options = [5, 10, 15, 30, 60];

  return (
    <AppLayout showBottomNav={false}>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <Link href="/settings" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <h1 className="text-xl font-bold">Auto Logout</h1>
      </header>

      <div className="p-6 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full aspect-square max-w-[200px] mb-8 mt-4"
        >
          <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full" />
          <img 
            src="/panda-security.png" 
            alt="Panda with security shield" 
            className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
          />
        </motion.div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Stay Safe on Shared PCs</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Connect will automatically log you out if you forget to do so after using a library or lab computer.
          </p>
        </div>

        <div className="w-full space-y-6">
          <div className="glass-card p-5 rounded-3xl flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg text-white">Enable Auto Logout</h3>
              <p className="text-xs text-muted-foreground">Recommended for students</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} className="data-[state=checked]:bg-primary" />
          </div>

          <div className={`transition-opacity duration-300 ${enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 pl-2 uppercase tracking-wider">Log out after inactivity</h3>
            
            <div className="grid grid-cols-5 gap-2">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setTime(opt)}
                  disabled={!enabled}
                  className={`py-3 rounded-2xl text-sm font-medium transition-all ${
                    time === opt 
                      ? 'bg-primary text-white glowing-primary scale-105' 
                      : 'bg-surface border border-white/5 text-muted-foreground hover:bg-white/5'
                  }`}
                >
                  {opt >= 60 ? `${opt/60}h` : `${opt}m`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
